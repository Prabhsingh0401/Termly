const { ses, sns } = require('../aws');

/**
 * Sends an email using AWS SES.
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.body - Email HTML body
 */
async function sendEmail({ to, subject, body }) {
  const sender = process.env.SES_FROM_EMAIL || 'hello@prableen.co.in';
  
  const params = {
    Source: sender,
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: body,
          Charset: 'UTF-8',
        },
        Text: {
          Data: body.replace(/<[^>]*>/g, ''), // Simple plain text fallback
          Charset: 'UTF-8',
        },
      },
    },
  };

  try {
    console.log(`✉️ Sending email via SES from ${sender} to ${to}...`);
    const res = await ses.sendEmail(params).promise();
    console.log(`✅ Email sent successfully. MessageId: ${res.MessageId}`);
    return res;
  } catch (err) {
    console.error(`❌ Failed to send email via SES to ${to}:`, err.message);
    throw err;
  }
}

/**
 * Sends an SMS using AWS SNS.
 * @param {Object} options
 * @param {string} options.phoneNumber - E.164 phone number
 * @param {string} options.message - Message content
 */
async function sendSMS({ phoneNumber, message }) {
  const params = {
    PhoneNumber: phoneNumber,
    Message: message,
  };

  try {
    console.log(`📱 Sending SMS via SNS to ${phoneNumber}...`);
    const res = await sns.publish(params).promise();
    console.log(`✅ SMS sent successfully. MessageId: ${res.MessageId}`);
    return res;
  } catch (err) {
    console.error(`❌ Failed to send SMS via SNS to ${phoneNumber}:`, err.message);
    throw err;
  }
}

module.exports = {
  sendEmail,
  sendSMS,
};
