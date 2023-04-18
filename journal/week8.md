# Week 8 — Serverless Image Processing

## AWS CDK - For serverless Avatar Processing

Utilize AWS CDK to setup Cloudformation stack. 
Create s separate directory and install CDK
Initialize the project and Bootstrap it 

```
cd /workspace/aws-bootcamp-cruddur-2023
mkdir thumbing-serverless-cdk

npm install aws-cdk -g

cdk init app --language typescript

cdk bootstrap aws://ACCOUNT-NUMBER/REGION

cdk synth

cdk deploy  -- TO DEPLOY THE STACK

cdk destory  -- TO DESTRY THE STACK

```

The stack will be have s3 bucket to store uploaded and processed image


```
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";

export class ThumbingServerlessCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const bucketName: string = process.env.THUMBING_BUCKET_NAME as string;
    const bucket = this.createBucket(bucketName);
  }

  createBucket(bucketName: string): s3.IBucket {
    const bucket = new s3.Bucket(this, "ThumbingBucket", {
      bucketName: bucketName,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    return bucket;
  }
}

```
Setup the separate file to load the environemnt variables

```

const dotenv = require('dotenv');
dotenv.config();

const bucketName: string = process.env.THUMBING_BUCKET_NAME as string;
const folderInput: string = process.env.THUMBING_S3_FOLDER_INPUT as string;
const folderOutput: string = process.env.THUMBING_S3_FOLDER_OUTPUT as string;
const webhookUrl: string = process.env.THUMBING_WEBHOOK_URL as string;
const topicName: string = process.env.THUMBING_TOPIC_NAME as string;
const functionPath: string = process.env.THUMBING_FUNCTION_PATH as string;
console.log('bucketName',bucketName)
console.log('folderInput',folderInput)
console.log('folderOutput',folderOutput)
console.log('webhookUrl',webhookUrl)
console.log('topicName',topicName)
console.log('functionPath',functionPath)

```
Lambda function to process the uploaded image 

```
import * as lambda from 'aws-cdk-lib/aws-lambda';

const lambda = this.createLambda(folderInput,folderOutput,functionPath,bucketName)

createLambda(folderIntput: string, folderOutput: string, functionPath: string, bucketName: string): lambda.IFunction {
  const logicalName = 'ThumbLambda';
  const code = lambda.Code.fromAsset(functionPath)
  const lambdaFunction = new lambda.Function(this, logicalName, {
    runtime: lambda.Runtime.NODEJS_18_X,
    handler: 'index.handler',
    code: code,
    environment: {
      DEST_BUCKET_NAME: bucketName,
      FOLDER_INPUT: folderIntput,
      FOLDER_OUTPUT: folderOutput,
      PROCESS_WIDTH: '512',
      PROCESS_HEIGHT: '512'
    }
  });
  return lambdaFunction;
}

```

Create SNS Topic and its subscription

```
import * as sns from 'aws-cdk-lib/aws-sns';

const snsTopic = this.createSnsTopic(topicName)

createSnsTopic(topicName: string): sns.ITopic{
  const logicalName = "Topic";
  const snsTopic = new sns.Topic(this, logicalName, {
    topicName: topicName
  });
  return snsTopic;
}


import * as s3n from 'aws-cdk-lib/aws-s3-notifications';

this.createSnsSubscription(snsTopic,webhookUrl)

createSnsSubscription(snsTopic: sns.ITopic, webhookUrl: string): sns.Subscription {
  const snsSubscription = snsTopic.addSubscription(
    new subscriptions.UrlSubscription(webhookUrl)
  )
  return snsSubscription;
}

```

Create S3 event notification to SNS and AWS Lambda

```

this.createS3NotifyToSns(folderOutput,snsTopic,bucket)

createS3NotifyToSns(prefix: string, snsTopic: sns.ITopic, bucket: s3.IBucket): void {
  const destination = new s3n.SnsDestination(snsTopic)
  bucket.addEventNotification(
    s3.EventType.OBJECT_CREATED_PUT, 
    destination,
    {prefix: prefix}
  );
}


this.createS3NotifyToLambda(folderInput,laombda,bucket)

createS3NotifyToLambda(prefix: string, lambda: lambda.IFunction, bucket: s3.IBucket): void {
  const destination = new s3n.LambdaDestination(lambda);
    bucket.addEventNotification(s3.EventType.OBJECT_CREATED_PUT,
    destination,
    {prefix: prefix}
  )
}

```

Create ``` aws/lambdas/process-images/s3-image-processing.js ``` for handling the image processing using sharp module

```
const sharp = require("sharp");
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");

function getClient() {
  const client = new S3Client();
  return client;
}

async function getOriginalImage(client, srcBucket, srcKey) {
  console.log("get==");
  const params = {
    Bucket: srcBucket,
    Key: srcKey,
  };
  console.log("params", params);
  const command = new GetObjectCommand(params);
  const response = await client.send(command);

  const chunks = [];
  for await (const chunk of response.Body) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);
  return buffer;
}

async function processImage(image, width, height) {
  const processedImage = await sharp(image)
    .resize(width, height)
    .jpeg()
    .toBuffer();
  return processedImage;
}

async function uploadProcessedImage(client, dstBucket, dstKey, image) {
  console.log("upload==");
  const params = {
    Bucket: dstBucket,
    Key: dstKey,
    Body: image,
    ContentType: "image/jpeg",
  };
  console.log("params", params);
  const command = new PutObjectCommand(params);
  const response = await client.send(command);
  console.log("repsonse", response);
  return response;
}

module.exports = {
  getClient: getClient,
  getOriginalImage: getOriginalImage,
  processImage: processImage,
  uploadProcessedImage: uploadProcessedImage,
};

```

Sharp package Installation

Create ``` bin/avatar/build ```

```
#! /usr/bin/bash

# set the absolute path to the file
abs_filepath="$ABS_PATH/thumbing-serverless-cdk"

# get the relative path to the file from the current directory
FilePath=$(realpath --relative-base="$PWD" "$abs_filepath")

cd $FilePath

npm install
rm -rf node_modules/sharp
SHARP_IGNORE_GLOBAL_LIBVIPS=1 npm install --arch=x64 --platform=linux --libc=glibc sharp

```
Create script to upload and delete the image , in order to test the flow

Create ``` bin/avatar/upload ``` and make it executable. This script is used to upload image to S3 bucket
Create ``` bin/avatar/clear ``` and make it executable. This script is used to deelte images from  S3 bucket


Lambda Functions for image procession

![image](https://user-images.githubusercontent.com/18515029/232860904-8ab87808-72a6-4578-9c13-7746aee4cac9.png)

Lambda Function for SNS notification

![image](https://user-images.githubusercontent.com/18515029/232861233-123a313e-d5f0-4ece-bbc7-a1f2cee3ab13.png)


S3 Buckets

![image](https://user-images.githubusercontent.com/18515029/232861391-21845bbe-11c5-47f5-80a1-fbc20eae7314.png)

![image](https://user-images.githubusercontent.com/18515029/232861475-6d1c0774-8381-47d8-a5bc-d435fdf152f5.png)

![image](https://user-images.githubusercontent.com/18515029/232861625-0ad47cb0-9b3f-4693-8b37-13109a3b7549.png)

![image](https://user-images.githubusercontent.com/18515029/232861718-9ca279c9-9e04-4ed7-accf-d9792ef84fad.png)

Policy attached image processing lambda function

![image](https://user-images.githubusercontent.com/18515029/232862354-5060afb2-7f23-46c0-8002-975ebc4bbdc7.png)


# Serving content over CloudFront 

On the clodfront console , Set the Origin domain to point to the assets.<domain>S3 bucket.
Choose Origin access control settings (recommended) and create a control setting.
Select Redirect HTTP to HTTPS for the viewer protocol policy.
Choose CORS-CustomOrigin for the optional Origin request policy.
Choose SimpleCORS for the optional Response headers policy.
Set the Alternate domain name (CNAME) to assets.<domain>.
Choose the previously created ACM for the Custom SSL certificate.
Give a description and click Create.
Choose Origin access control settings (recommended) and create a control setting.
Select Redirect HTTP to HTTPS for the viewer protocol policy.
Choose CORS-CustomOrigin for the optional Origin request policy.
Choose SimpleCORS for the optional Response headers policy.
Set the Alternate domain name (CNAME) to assets.<domain>.
Choose the previously created ACM for the Custom SSL certificate.
Give a description and click Create.

![image](https://user-images.githubusercontent.com/18515029/232863364-43d9957f-936c-4d17-8045-8ae1c3cd6288.png)

![image](https://user-images.githubusercontent.com/18515029/232863476-6ba0be77-bb92-4840-bbe4-45579731c593.png)

