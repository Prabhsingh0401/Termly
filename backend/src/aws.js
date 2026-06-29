const AWS = require('aws-sdk');

AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const defaultS3 = new AWS.S3();
const defaultTextract = new AWS.Textract();
const defaultBedrock = new AWS.BedrockRuntime({
  region: process.env.AWS_REGION || 'us-east-1',
});
const cognito = new AWS.CognitoIdentityServiceProvider();
const ses = new AWS.SES({ apiVersion: '2010-12-01', region: process.env.SES_REGION || 'ap-south-1' });
const sns = new AWS.SNS({ apiVersion: '2010-03-31', region: process.env.SNS_REGION || 'us-east-1' });

function getClientsForOrg(awsConfig) {
  if (awsConfig && awsConfig.accessKeyId && awsConfig.secretAccessKey) {
    const config = {
      region: awsConfig.region || 'us-east-1',
      accessKeyId: awsConfig.accessKeyId,
      secretAccessKey: awsConfig.secretAccessKey,
    };
    return {
      s3: new AWS.S3(config),
      textract: new AWS.Textract(config),
      bedrock: new AWS.BedrockRuntime({
        region: awsConfig.region || 'us-east-1',
        accessKeyId: awsConfig.accessKeyId,
        secretAccessKey: awsConfig.secretAccessKey,
      }),
      bucketName: awsConfig.s3Bucket || process.env.S3_BUCKET_NAME
    };
  }
  return {
    s3: defaultS3,
    textract: defaultTextract,
    bedrock: defaultBedrock,
    bucketName: process.env.S3_BUCKET_NAME
  };
}

module.exports = {
  AWS,
  s3: defaultS3,
  textract: defaultTextract,
  bedrock: defaultBedrock,
  cognito,
  ses,
  sns,
  getClientsForOrg,
};

