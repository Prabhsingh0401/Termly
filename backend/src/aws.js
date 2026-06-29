const AWS = require('aws-sdk');

AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();
const textract = new AWS.Textract();
const bedrock = new AWS.BedrockRuntime({
  region: process.env.AWS_REGION || 'us-east-1',
});
const cognito = new AWS.CognitoIdentityServiceProvider();
const ses = new AWS.SES({ apiVersion: '2010-12-01', region: process.env.SES_REGION || 'ap-south-1' });
const sns = new AWS.SNS({ apiVersion: '2010-03-31', region: process.env.SNS_REGION || 'us-east-1' });

module.exports = {
  AWS,
  s3,
  textract,
  bedrock,
  cognito,
  ses,
  sns,
};
