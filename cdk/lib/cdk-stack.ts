import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {aws_cloudfront, aws_iam, aws_s3, aws_s3_deployment} from "aws-cdk-lib";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'CdkQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
    const cloudfrontOAI = new aws_cloudfront.OriginAccessIdentity(this, "JSCC-OAI")

    const siteBucket = new aws_s3.Bucket(this, "JSCCStaticBucket", {
      bucketName: "nodejs-aws-shop-react-atmafinal",
      websiteIndexDocument: "index.html",
      publicReadAccess: false,
      blockPublicAccess: aws_s3.BlockPublicAccess.BLOCK_ACLS
    })
siteBucket.addToResourcePolicy(new aws_iam.PolicyStatement({
  actions: ["S3:GetObject"],
  resources: [siteBucket.arnForObjects("*")],
  principals: [new aws_iam.CanonicalUserPrincipal(cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId)]
}))

    const distribution = new aws_cloudfront.CloudFrontWebDistribution(this, "JSCC-distribution", {
      originConfigs: [{
        s3OriginSource: {
          s3BucketSource: siteBucket,
          originAccessIdentity: cloudfrontOAI
        },
        behaviors: [{
          isDefaultBehavior: true
        }]
      }]
    })

    new aws_s3_deployment.BucketDeployment(this, "JSCC-Bucket-Deployment", {
      sources: [aws_s3_deployment.Source.asset("../dist")],
      destinationBucket: siteBucket,
      distribution,
      distributionPaths: ["/*"]
    })
  }
}
