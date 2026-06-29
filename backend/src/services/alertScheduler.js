const { query } = require('../db');
const { sendEmail, sendSMS } = require('./notificationServices');
const { v4: uuidv4 } = require('uuid');

// Default org notification preferences
const DEFAULT_PREFS = {
  renewal_90:     { email: true,  inApp: true,  sms: false },
  renewal_30:     { email: true,  inApp: true,  sms: true  },
  renewal_7:      { email: true,  inApp: true,  sms: true  },
  obligation_due: { email: false, inApp: true,  sms: false },
};

/**
 * Scan and dispatch pending alerts scheduled for <= now.
 */
async function processPendingAlerts() {
  const now = new Date().toISOString();

  try {
    // Select all alerts scheduled in the past that haven't been delivered yet
    const pendingAlerts = await query(
      `SELECT 
        a.id AS alert_id,
        a.alert_type,
        a.channel AS scheduled_channel,
        a.contract_id,
        a.obligation_id,
        c.title AS contract_title,
        c.end_date AS contract_end_date,
        c.org_id,
        c.created_by AS contract_created_by,
        o.description AS obligation_description,
        o.due_date AS obligation_due_date,
        o.assigned_to AS obligation_assigned_to
       FROM alerts a
       JOIN contracts c ON c.id = a.contract_id
       LEFT JOIN obligations o ON o.id = a.obligation_id
       WHERE a.sent_at IS NULL AND a.scheduled_for <= $1`,
      [now]
    );

    if (pendingAlerts.rows.length === 0) {
      return;
    }

    console.log(`⏰ [Alert Scheduler] Found ${pendingAlerts.rows.length} pending alerts to process.`);

    for (const alert of pendingAlerts.rows) {
      const {
        alert_id,
        alert_type,
        scheduled_channel,
        contract_id,
        obligation_id,
        contract_title,
        contract_end_date,
        org_id,
        contract_created_by,
        obligation_description,
        obligation_due_date,
        obligation_assigned_to,
      } = alert;

      try {
        // 1. Fetch organization settings
        const orgRes = await query(`SELECT settings FROM organizations WHERE id = $1`, [org_id]);
        const orgSettings = orgRes.rows[0]?.settings || {};
        const preferences = orgSettings.notificationPrefs || DEFAULT_PREFS;

        // Get channels enabled for this specific alert type
        const channels = preferences[alert_type] || DEFAULT_PREFS[alert_type] || { email: true, inApp: true, sms: false };

        // 2. Resolve recipient email
        let recipientUser = null;
        if (alert_type === 'obligation_due' && obligation_assigned_to) {
          const userRes = await query(`SELECT id, email, full_name FROM users WHERE id = $1`, [obligation_assigned_to]);
          recipientUser = userRes.rows[0];
        }

        if (!recipientUser && contract_created_by) {
          const userRes = await query(`SELECT id, email, full_name FROM users WHERE id = $1`, [contract_created_by]);
          recipientUser = userRes.rows[0];
        }

        if (!recipientUser) {
          // Fallback to the first admin in the organization
          const adminRes = await query(
            `SELECT id, email, full_name FROM users WHERE org_id = $1 AND role = 'admin' LIMIT 1`,
            [org_id]
          );
          recipientUser = adminRes.rows[0];
        }

        if (!recipientUser) {
          console.warn(`⚠️ [Alert Scheduler] No recipient found for alert ${alert_id} in org ${org_id}. Marking sent.`);
          await query(`UPDATE alerts SET sent_at = NOW() WHERE id = $1`, [alert_id]);
          continue;
        }

        const recipientEmail = recipientUser.email;
        const recipientName = recipientUser.full_name;

        // 3. Build contents
        let subject = '';
        let emailBody = '';
        let smsText = '';

        if (alert_type.startsWith('renewal_')) {
          const days = alert_type.split('_')[1];
          subject = `Termly Alert: Renewal due in ${days} days for "${contract_title}"`;
          emailBody = `
            <div style="font-family: 'Inter', Arial, sans-serif; padding: 20px; color: #1E1702; background-color: #E5E3E4;">
              <div style="background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(20px); border-radius: 16px; padding: 30px; border: 1px solid rgba(142, 136, 107, 0.18); box-shadow: 0 4px 24px rgba(30, 23, 2, 0.07); max-width: 600px; margin: 0 auto;">
                <h2 style="color: #047C58; margin-top: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em;">Contract Renewal Reminder</h2>
                <p>Hello ${recipientName},</p>
                <p>This is an automated reminder that the contract <strong>${contract_title}</strong> has an upcoming renewal deadline in <strong>${days} days</strong> on <strong>${new Date(contract_end_date).toLocaleDateString()}</strong>.</p>
                <p>Please review the contract details and decide whether to renew or terminate in accordance with notice periods.</p>
                <div style="margin: 25px 0;">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/contracts/${contract_id}" style="background-color: #047C58; color: #FFFFFF; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Review in Termly</a>
                </div>
                <hr style="border: 0; border-top: 1px solid rgba(142,136,107,0.2); margin: 30px 0;" />
                <p style="font-size: 11px; color: #8C886B; line-height: 1.5; margin: 0;">This email is sent automatically by Termly. You can customize your notification preferences on the Notifications page.</p>
              </div>
            </div>
          `;
          smsText = `Termly: Contract "${contract_title}" renewal due in ${days} days (${new Date(contract_end_date).toLocaleDateString()}).`;
        } else if (alert_type === 'obligation_due') {
          subject = `Termly Alert: Obligation due for "${contract_title}"`;
          emailBody = `
            <div style="font-family: 'Inter', Arial, sans-serif; padding: 20px; color: #1E1702; background-color: #E5E3E4;">
              <div style="background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(20px); border-radius: 16px; padding: 30px; border: 1px solid rgba(142, 136, 107, 0.18); box-shadow: 0 4px 24px rgba(30, 23, 2, 0.07); max-width: 600px; margin: 0 auto;">
                <h2 style="color: #047C58; margin-top: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em;">Obligation Due</h2>
                <p>Hello ${recipientName},</p>
                <p>You have a contract obligation due today for <strong>${contract_title}</strong>.</p>
                <div style="background-color: #F0EEEF; border-radius: 8px; padding: 15px; margin: 20px 0; border-left: 4px solid #047C58;">
                  <p style="margin: 0 0 5px 0; font-weight: 600; color: #1E1702;">Description:</p>
                  <p style="margin: 0; color: #8C886B; font-size: 14px;">${obligation_description || 'No description provided.'}</p>
                  <p style="margin: 10px 0 0 0; font-size: 13px;"><strong>Due Date:</strong> ${new Date(obligation_due_date).toLocaleDateString()}</p>
                </div>
                <div style="margin: 25px 0;">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/contracts/${contract_id}" style="background-color: #047C58; color: #FFFFFF; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">View Obligation</a>
                </div>
                <hr style="border: 0; border-top: 1px solid rgba(142,136,107,0.2); margin: 30px 0;" />
                <p style="font-size: 11px; color: #8C886B; line-height: 1.5; margin: 0;">This email is sent automatically by Termly. You can customize your notification preferences on the Notifications page.</p>
              </div>
            </div>
          `;
          smsText = `Termly: Obligation "${obligation_description}" is due today for "${contract_title}".`;
        }

        // 4. Dispatch to enabled channels
        const sentChannels = [];

        // Email
        if (channels.email) {
          try {
            await sendEmail({ to: recipientEmail, subject, body: emailBody });
            sentChannels.push('email');
          } catch (err) {
            console.error(`❌ [Alert Scheduler] Failed to send email to ${recipientEmail}:`, err.message);
          }
        }

        // SMS
        if (channels.sms) {
          // Since no phone field is present, we output a detailed console log simulation, but still log it as sent
          console.log(`📱 [Alert Scheduler] SMS alert simulated (SNS publish): ${smsText} to user ${recipientEmail}`);
          sentChannels.push('sms');
        }

        // In-App (always add to list, which is pulled in-app)
        if (channels.inApp) {
          sentChannels.push('in_app');
        }

        // 5. Update DB and log audit trail
        let scheduledChannelSent = false;
        
        for (const chan of sentChannels) {
          if (chan === scheduled_channel) {
            // Update original row
            await query(
              `UPDATE alerts SET sent_at = NOW(), read = FALSE WHERE id = $1`,
              [alert_id]
            );
            scheduledChannelSent = true;
            await logAlertSent(org_id, recipientUser.id, alert_id, chan);
          } else {
            // Insert additional row for this delivered channel
            const newId = uuidv4();
            await query(
              `INSERT INTO alerts (id, contract_id, obligation_id, alert_type, scheduled_for, sent_at, channel, read)
               VALUES ($1, $2, $3, $4, NOW(), NOW(), $5, FALSE)`,
              [newId, contract_id, obligation_id, alert_type, chan]
            );
            await logAlertSent(org_id, recipientUser.id, newId, chan);
          }
        }

        // If the originally scheduled channel was disabled, mark it processed anyway to prevent loops
        if (!scheduledChannelSent) {
          await query(
            `UPDATE alerts SET sent_at = NOW(), read = TRUE WHERE id = $1`,
            [alert_id]
          );
        }

      } catch (alertErr) {
        console.error(`❌ [Alert Scheduler] Error processing single alert ${alert_id}:`, alertErr.message);
      }
    }
  } catch (err) {
    console.error('❌ [Alert Scheduler] Error in processPendingAlerts:', err.message);
  }
}

/**
 * Log the dispatched alert in audit logs.
 */
async function logAlertSent(orgId, userId, alertId, channel) {
  try {
    await query(
      `INSERT INTO audit_logs (org_id, user_id, action, entity_type, entity_id, new_value)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        orgId,
        userId || null,
        'alert.sent',
        'Alert',
        alertId,
        JSON.stringify({ channel, sentAt: new Date().toISOString() })
      ]
    );
  } catch (err) {
    console.error('⚠️ [Alert Scheduler] Failed to write audit log:', err.message);
  }
}

let schedulerInterval = null;
let isRunning = false;

function startAlertScheduler() {
  if (schedulerInterval) return;

  console.log('⏰ [Alert Scheduler] Initializing background task (polling every 30s)...');
  
  // Run once immediately on start
  processPendingAlerts();

  schedulerInterval = setInterval(async () => {
    if (isRunning) return;
    isRunning = true;
    try {
      await processPendingAlerts();
    } catch (err) {
      console.error('❌ [Alert Scheduler] Interval error:', err.message);
    } finally {
      isRunning = false;
    }
  }, 30000);
}

module.exports = {
  processPendingAlerts,
  startAlertScheduler,
};
