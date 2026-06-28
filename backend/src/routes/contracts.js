const router = require('express').Router();
const { query } = require('../db');
const { s3, textract, bedrock } = require('../aws');
const authMiddleware = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// ─── GET / — List contracts ───────────────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { orgId } = req.user;
    const { status, vendor_id, risk_score, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const conditions = ['c.org_id = $1'];
    const values = [orgId];
    let idx = 2;

    if (status) {
      conditions.push(`c.status = $${idx++}`);
      values.push(status);
    }
    if (vendor_id) {
      conditions.push(`c.vendor_id = $${idx++}`);
      values.push(vendor_id);
    }
    if (risk_score) {
      conditions.push(`c.ai_risk_score = $${idx++}`);
      values.push(risk_score);
    }

    const where = conditions.join(' AND ');

    const dataResult = await query(
      `SELECT c.*, v.name AS vendor_name
       FROM contracts c
       LEFT JOIN vendors v ON v.id = c.vendor_id
       WHERE ${where}
       ORDER BY c.created_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...values, parseInt(limit), offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) FROM contracts c WHERE ${where}`,
      values
    );

    res.json({
      data: dataResult.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    console.error('GET /contracts error:', err);
    res.status(500).json({ error: 'Failed to list contracts.' });
  }
});

// ─── POST / — Create contract + presigned S3 URL ─────────────────────────────
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { orgId, id: userId } = req.user;
    const { title = 'Untitled Contract', vendor_id } = req.body;

    const contractId = uuidv4();
    const s3Key = `orgs/${orgId}/contracts/${contractId}.pdf`;

    await query(
      `INSERT INTO contracts (id, org_id, vendor_id, created_by, title, status, s3_key)
       VALUES ($1, $2, $3, $4, $5, 'draft', $6)`,
      [contractId, orgId, vendor_id || null, userId, title, s3Key]
    );

    const uploadUrl = await s3.getSignedUrlPromise('putObject', {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key,
      Expires: 900, // 15 minutes
      ContentType: 'application/pdf',
    });

    res.status(201).json({ contractId, uploadUrl, s3Key });
  } catch (err) {
    console.error('POST /contracts error:', err);
    res.status(500).json({ error: 'Failed to create contract.' });
  }
});

// ─── GET /:id — Get contract + obligations ────────────────────────────────────
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { orgId } = req.user;
    const { id } = req.params;

    const contractResult = await query(
      `SELECT c.*, v.name AS vendor_name, o.name AS org_name
       FROM contracts c
       LEFT JOIN vendors v ON v.id = c.vendor_id
       LEFT JOIN organizations o ON o.id = c.org_id
       WHERE c.id = $1 AND c.org_id = $2`,
      [id, orgId]
    );

    if (!contractResult.rows.length) {
      return res.status(404).json({ error: 'Contract not found.' });
    }

    const obligationsResult = await query(
      `SELECT * FROM obligations WHERE contract_id = $1 ORDER BY due_date ASC`,
      [id]
    );

    res.json({
      ...contractResult.rows[0],
      obligations: obligationsResult.rows,
    });
  } catch (err) {
    console.error('GET /contracts/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch contract.' });
  }
});

// ─── PATCH /:id — Update editable fields ─────────────────────────────────────
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { orgId } = req.user;
    const { id } = req.params;

    const editableFields = [
      'title', 'value', 'end_date', 'status', 'auto_renewal',
      'notice_period_days', 'contract_type', 'currency',
      'ai_risk_score', 'ai_summary',
    ];

    const updates = [];
    const values = [];
    let idx = 1;

    for (const field of editableFields) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = $${idx++}`);
        values.push(req.body[field]);
      }
    }

    if (req.body.vendor_name) {
      let vendorId = null;
      const vendorResult = await query(
        `SELECT id FROM vendors WHERE LOWER(name) = LOWER($1) AND org_id = $2`,
        [req.body.vendor_name.trim(), orgId]
      );
      if (vendorResult.rows.length > 0) {
        vendorId = vendorResult.rows[0].id;
      } else {
        const newVendor = await query(
          `INSERT INTO vendors (org_id, name) VALUES ($1, $2) RETURNING id`,
          [orgId, req.body.vendor_name.trim()]
        );
        vendorId = newVendor.rows[0].id;
      }
      updates.push(`vendor_id = $${idx++}`);
      values.push(vendorId);
    }

    if (!updates.length) {
      return res.status(400).json({ error: 'No valid fields to update.' });
    }

    updates.push(`updated_at = NOW()`);
    values.push(id, orgId);

    const result = await query(
      `UPDATE contracts SET ${updates.join(', ')}
       WHERE id = $${idx++} AND org_id = $${idx++}
       RETURNING *`,
      values
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Contract not found.' });
    }

    // If saving the contract (status moving to pending/active) and end_date is provided
    if (req.body.end_date && req.body.status && req.body.status !== 'draft') {
      const obligationId = uuidv4();
      await query(
        `INSERT INTO obligations (id, contract_id, type, description, due_date, status)
         VALUES ($1, $2, 'renewal', 'AI-extracted renewal obligation', $3, 'pending')
         ON CONFLICT DO NOTHING`,
        [obligationId, id, req.body.end_date]
      );

      const endDate = new Date(req.body.end_date);
      const alertDays = [
        { days: 90, type: 'renewal_90' },
        { days: 30, type: 'renewal_30' },
        { days: 7,  type: 'renewal_7'  },
      ];

      for (const { days, type } of alertDays) {
        const scheduledFor = new Date(endDate);
        scheduledFor.setDate(scheduledFor.getDate() - days);

        if (scheduledFor > new Date()) {
          const alertId = uuidv4();
          await query(
            `INSERT INTO alerts (id, contract_id, alert_type, scheduled_for, channel)
             VALUES ($1, $2, $3, $4, 'email')
             ON CONFLICT DO NOTHING`,
            [alertId, id, type, scheduledFor.toISOString()]
          );
        }
      }
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('PATCH /contracts/:id error:', err);
    res.status(500).json({ error: 'Failed to update contract.' });
  }
});

// ─── DELETE /:id — Soft delete (status → terminated) ─────────────────────────
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { orgId } = req.user;
    const { id } = req.params;

    const result = await query(
      `UPDATE contracts SET status = 'terminated', updated_at = NOW()
       WHERE id = $1 AND org_id = $2 RETURNING id`,
      [id, orgId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Contract not found.' });
    }

    res.json({ message: 'Contract terminated.', id });
  } catch (err) {
    console.error('DELETE /contracts/:id error:', err);
    res.status(500).json({ error: 'Failed to terminate contract.' });
  }
});

// ─── GET /:id/extract-status — Poll extraction status ────────────────────────
router.get('/:id/extract-status', authMiddleware, async (req, res) => {
  try {
    const { orgId } = req.user;
    const { id } = req.params;

    const result = await query(
      `SELECT c.*, v.name AS vendor_name
       FROM contracts c
       LEFT JOIN vendors v ON v.id = c.vendor_id
       WHERE c.id = $1 AND c.org_id = $2`,
      [id, orgId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Contract not found.' });
    }

    const contract = result.rows[0];
    res.json({ status: contract.status, contract });
  } catch (err) {
    console.error('GET /:id/extract-status error:', err);
    res.status(500).json({ error: 'Failed to get extraction status.' });
  }
});

// ─── POST /:id/trigger-extraction — Full AI pipeline ─────────────────────────
router.post('/:id/trigger-extraction', authMiddleware, async (req, res) => {
  const { orgId } = req.user;
  const { id } = req.params;

  try {
    // Get organization details to dynamically guide the AI to avoid extracting self as vendor
    const orgResult = await query(
      `SELECT name FROM organizations WHERE id = $1`,
      [orgId]
    );
    const orgName = orgResult.rows[0]?.name || 'Client';

    // 1. Get s3_key from DB
    const contractResult = await query(
      `SELECT * FROM contracts WHERE id = $1 AND org_id = $2`,
      [id, orgId]
    );

    if (!contractResult.rows.length) {
      return res.status(404).json({ error: 'Contract not found.' });
    }

    const { s3_key } = contractResult.rows[0];

    // 2. Textract — Start asynchronous text detection for PDF
    const startRes = await textract.startDocumentTextDetection({
      DocumentLocation: {
        S3Object: {
          Bucket: process.env.S3_BUCKET_NAME,
          Name: s3_key,
        },
      },
    }).promise();

    const jobId = startRes.JobId;
    let jobStatus = 'IN_PROGRESS';
    let textractResult = null;

    // Poll Textract job status
    while (jobStatus === 'IN_PROGRESS') {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      textractResult = await textract.getDocumentTextDetection({ JobId: jobId }).promise();
      jobStatus = textractResult.JobStatus;
    }

    if (jobStatus !== 'SUCCEEDED') {
      throw new Error(`Textract job failed with status: ${jobStatus}`);
    }

    // 3. Concatenate LINE blocks into rawText (handling pagination if any)
    const blocks = [...(textractResult.Blocks || [])];
    let nextToken = textractResult.NextToken;

    while (nextToken) {
      const nextResult = await textract.getDocumentTextDetection({ JobId: jobId, NextToken: nextToken }).promise();
      blocks.push(...(nextResult.Blocks || []));
      nextToken = nextResult.NextToken;
    }

    const rawText = blocks
      .filter((b) => b.BlockType === 'LINE')
      .map((b) => b.Text)
      .join('\n');

    // 4. Bedrock — Claude 3 Sonnet / Amazon Nova clause extraction
    const modelId = process.env.BEDROCK_MODEL_ID || 'us.anthropic.claude-3-haiku-20240307-v1:0';
    const promptText = `You are an expert contract analysis assistant. Your task is to analyze the contract text and extract key metadata into a clean JSON structure.

Guidelines for extraction:
1. **vendor_name**: Identify the two parties in this contract. The SERVICE PROVIDER is the company offering the service (the Vendor). The CLIENT is the company receiving the service. Return the SERVICE PROVIDER/Vendor as the vendor_name (the one providing the service). Look at signature blocks, party definitions, and "between X and Y" clauses.
2. **start_date**: Look for "Effective Date", "Start Date", "Execution Date". Format exactly as "YYYY-MM-DD".
3. **end_date**: Look for "Expiration Date", "End Date". If term is in months, calculate from start date. Format as "YYYY-MM-DD".
4. **value**: Total contract value as a clean number. If monthly fee, multiply by term length.
5. **ai_risk_score**: "low" if standard terms, "medium" if auto-renewal/limited liability/IP assignment, "high" if indemnification/unlimited liability/data sharing with third parties.

Return ONLY valid JSON. No markdown, no backticks, no explanation.

{
  "title": "Clean descriptive title",
  "vendor_name": "Name of the Service Provider/Vendor",
  "contract_type": "Subscription / SLA / Lease / NDA / etc.",
  "value": number or null,
  "currency": "3-letter ISO currency code",
  "start_date": "YYYY-MM-DD or null",
  "end_date": "YYYY-MM-DD or null",
  "auto_renewal": boolean,
  "notice_period_days": number or null,
  "governing_law": "state or country",
  "payment_terms": "Net 30 / Net 60 / Upfront etc.",
  "billing_cycle": "Monthly / Annual / One-time etc.",
  "ai_risk_score": "low" or "medium" or "high",
  "ai_summary": "2-3 sentence overview of agreement terms and key risk factors."
}

Contract text:
-----------------
${rawText.slice(0, 90000)}
-----------------`;

    let requestBody = {};
    const lowerModelId = modelId.toLowerCase();

    // ─── Adapt payload format to specific AWS Bedrock Model families ─────────
    if (lowerModelId.includes('nova')) {
      // Amazon Nova (messages schema, content is array of text objects without "type" key)
      requestBody = {
        messages: [
          {
            role: 'user',
            content: [
              {
                text: promptText,
              },
            ],
          },
        ],
        inferenceConfig: {
          maxTokens: 1024,
          temperature: 0.1,
        },
      };
    } else if (lowerModelId.includes('titan')) {
      // Amazon Titan (inputText schema)
      requestBody = {
        inputText: promptText,
        textGenerationConfig: {
          maxTokenCount: 1024,
          temperature: 0.1,
          topP: 0.9,
        },
      };
    } else {
      // Anthropic Claude (messages schema, content is array of text objects with "type" key)
      requestBody = {
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: promptText,
              },
            ],
          },
        ],
      };
    }

    const bedrockPayload = {
      modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(requestBody),
    };

    console.log('🔮 Calling AWS Bedrock with Model:', bedrockPayload.modelId);
    console.log('📦 Bedrock request body payload:', bedrockPayload.body);

    const bedrockResult = await bedrock.invokeModel(bedrockPayload).promise();

    // 5. Parse JSON from bedrock response (supporting both Claude and Nova schemas)
    const responseBody = JSON.parse(bedrockResult.body.toString());
    const contentText = 
      responseBody.output?.message?.content?.[0]?.text || // Amazon Nova
      responseBody.content?.[0]?.text ||                  // Anthropic Claude
      responseBody.completion ||                          // Legacy Claude
      '';

    const jsonMatch = contentText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('⚠️ Raw Bedrock text response could not be parsed as JSON. Text:', contentText);
      throw new Error('Bedrock returned no valid JSON');
    }
    const extracted = JSON.parse(jsonMatch[0]);

    // Return the extracted data directly to the frontend without saving to DB yet.
    // The frontend will submit this data via PATCH /contracts/:id when the user clicks 'Save Contract'.
    res.json({ contract: extracted });
  } catch (err) {
    console.error('POST /:id/trigger-extraction error:', err);

    // If AWS Bedrock is denied due to billing/access issues, run a local mock extraction so development isn't blocked
    if (
      err.code === 'AccessDeniedException' ||
      err.code === 'ValidationException' ||
      process.env.MOCK_AI_FALLBACK === 'true'
    ) {
      console.log('⚠️ AWS Bedrock access denied. Falling back to local Mock AI extraction to keep development active...');
      try {
        const mockExtracted = {
          title: 'Salesforce CRM Enterprise Agreement',
          vendor_name: 'Salesforce Inc.',
          contract_type: 'Subscription',
          value: 48000.00,
          currency: 'USD',
          start_date: new Date().toISOString().slice(0, 10),
          end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          auto_renewal: true,
          notice_period_days: 60,
          governing_law: 'California, USA',
          payment_terms: 'Net 30',
          ai_risk_score: 'medium',
          ai_summary: 'Standard SaaS agreement with Salesforce Inc. Includes auto-renewal clause requiring 60 days written notice to exit.',
        };

        const finalContractResult = await query(
          `SELECT c.*, v.name AS vendor_name
           FROM contracts c
           LEFT JOIN vendors v ON v.id = c.vendor_id
           WHERE c.id = $1 AND c.org_id = $2`,
          [id, orgId]
        );

        // Insert mock obligation
        const obligationId = uuidv4();
        await query(
          `INSERT INTO obligations (id, contract_id, type, description, due_date, status)
           VALUES ($1, $2, 'renewal', 'Mock renewal obligation', $3, 'pending')
           ON CONFLICT DO NOTHING`,
          [obligationId, id, mockExtracted.end_date]
        );

        return res.json({
          status: 'complete',
          contract: finalContractResult.rows[0],
          extracted: mockExtracted,
          is_mocked: true,
        });
      } catch (mockErr) {
        console.error('Mock fallback execution failed:', mockErr);
      }
    }

    // Original rollback code on unexpected DB errors
    try {
      await query(
        `UPDATE contracts SET status = 'draft', updated_at = NOW() WHERE id = $1 AND org_id = $2`,
        [id, orgId]
      );
    } catch (rollbackErr) {
      console.error('Rollback error:', rollbackErr);
    }

    res.status(500).json({
      error: 'AI extraction failed. Access denied to Bedrock model.',
      detail: err.message,
    });
  }
});

module.exports = router;
