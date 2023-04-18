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

* On the clodfront console , Set the Origin domain to point to the assets.<domain>S3 bucket.
* Choose Origin access control settings (recommended) and create a control setting.
* Select Redirect HTTP to HTTPS for the viewer protocol policy.
* Choose CORS-CustomOrigin for the optional Origin request policy.
* Choose SimpleCORS for the optional Response headers policy.
* Set the Alternate domain name (CNAME) to assets.<domain>.
* Choose the previously created ACM for the Custom SSL certificate.
* Give a description and click Create.
* Choose Origin access control settings (recommended) and create a control setting.
* Select Redirect HTTP to HTTPS for the viewer protocol policy.
* Choose CORS-CustomOrigin for the optional Origin request policy.
* Choose SimpleCORS for the optional Response headers policy.
* Set the Alternate domain name (CNAME) to assets.<domain>.
* Choose the previously created ACM for the Custom SSL certificate.
* Give a description and click Create.

![image](https://user-images.githubusercontent.com/18515029/232864667-d6e50fe4-9a42-489f-b6bc-d7247c1b6a68.png)

![image](https://user-images.githubusercontent.com/18515029/232864731-69df1068-64eb-4c01-ae63-a4ba4dad3b0c.png)

# Implement Avatar Uploading
Pre-signed URL Lambda

* Create a new function in Lambda.
* In API Gateway, select HTTP API and click Build.
* Click Add integration and choose Lambda.
* Name the integration CruddurAvatarUpload.
* Select the Ruby 2.7 runtime.
* Choose Create a new role with basic Lambda permissions for the default execution role.
* Create the function.
  
Create aws/lambdas/cruddur-upload-avatar/function.rb
  
```
require 'aws-sdk-s3'
require 'json'
require 'jwt'

def handler(event:, context:)
  puts event
  # return cors headers for preflight check
  if event['routeKey'] == "OPTIONS /{proxy+}"
    puts({step: 'preflight', message: 'preflight CORS check'}.to_json)
    { 
      headers: {
        "Access-Control-Allow-Headers": "*, Authorization",
        "Access-Control-Allow-Origin": "https://3000-amitnike-awsbootcampcru-eb1xpvxb2qm.ws-us94.gitpod.io",
        "Access-Control-Allow-Methods": "OPTIONS,GET,POST"
      },
      statusCode: 200
    }
  else
    token = event['headers']['authorization'].split(' ')[1]
    puts({step: 'presignedurl', access_token: token}.to_json)

    body_hash = JSON.parse(event["body"])
    extension = body_hash["extension"]

    decoded_token = JWT.decode token, nil, false
    cognito_user_uuid = decoded_token[0]['sub']

    s3 = Aws::S3::Resource.new
    bucket_name = ENV["UPLOADS_BUCKET_NAME"]
    object_key = "#{cognito_user_uuid}.#{extension}"

    puts({object_key: object_key}.to_json)

    obj = s3.bucket(bucket_name).object(object_key)
    url = obj.presigned_url(:put, expires_in: 60 * 5)
    url # this is the data that will be returned
    body = {url: url}.to_json
    { 
      headers: {
        "Access-Control-Allow-Headers": "*, Authorization",
        "Access-Control-Allow-Origin": "https://3000-amitnike-awsbootcampcru-eb1xpvxb2qm.ws-us94.gitpod.io",
        "Access-Control-Allow-Methods": "OPTIONS,GET,POST"
      },
      statusCode: 200, 
      body: body 
    }
  end # if 
end # def handle
  
```
  
Update the Gemfile and run bundle install
  
```
  
# frozen_string_literal: true

source "https://rubygems.org"

# gem "rails"
gem "aws-sdk-s3"
gem "ox"
  
```
  
* Add the code from above file to create a lambda function
* Add the UPLOADS_BUCKET_NAME environment variable to the Lambda function.
* Change the Lambda runtime handler to function.handler.
* Rename the file to function.rb.
* Run a test to check that everything is working as expected.
  
policy to attach 
  
```
 {
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "VisualEditor0",
      "Effect": "Allow",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::<bucket_name>/*"
    }
  ]
} 
  
```
  
# Lambda Authorizer
  
Create a new file called index.js in the aws/lambdas/lambda_authorizer directory. 
This Lambda function will be used to authorize API Gateway requests.
Create the zip and create lambda fuction



```
  
  "use strict";
const { CognitoJwtVerifier } = require("aws-jwt-verify");
//const { assertStringEquals } = require("aws-jwt-verify/assert");

const jwtVerifier = CognitoJwtVerifier.create({
  userPoolId: process.env.USER_POOL_ID,
  tokenUse: "access",
  clientId: process.env.CLIENT_ID, //,
  //customJwtCheck: ({ payload }) => {
  //  assertStringEquals("e-mail", payload["email"], process.env.USER_EMAIL);
  //},
});

exports.handler = async (event) => {
  console.log("request:", JSON.stringify(event, undefined, 2));

  const auth = event.headers.authorization;
  const jwt = auth.split(" ")[1];

  try {
    const payload = await jwtVerifier.verify(jwt);
    console.log("Access allowed. JWT payload:", payload);
  } catch (err) {
    console.error("Access forbidden:", err);
    return {
      isAuthorized: false,
    };
  }

  return {
    isAuthorized: true,
  };
};
  
```
# API Gateway
  
* Select HTTP APIs in the API Gateway console
* Choose Build
* Select Lambda from the Add integration dropdown and choose the CruddurUploadAvatar lambda function
* Enter the API name as api.<domain_name>
* Click Next
* Change the resource path to /avatars/key_upload
* Set the method to POST
* Click Next, Next, and Create
* Select Authorization from the left pane
* Go to Manage authorizers and click Create
* Choose Lambda as the authorizer type, give it a name, and select the lambda authorizer function
* Turn off Authorizer caching
* Click Create
* From Attach authorizers to routes tab, click on POST
* Select the lambda authorizer from the "Select existing authorizer" dropdown
* Click Attach Authorizer
* Copy the invoke URL from the API page

  ![image](https://user-images.githubusercontent.com/18515029/232869136-2a92d2de-673b-4ef4-8e38-22d35d4cae76.png)

  ![image](https://user-images.githubusercontent.com/18515029/232869233-92e0286b-b02a-4c5c-91d8-48891c27a68b.png)

  ![image](https://user-images.githubusercontent.com/18515029/232869272-a08743e8-4edd-4ec4-9b35-c975cc0ef7bb.png)
  
  ![image](https://user-images.githubusercontent.com/18515029/232869362-4032ca62-bd2c-4627-a381-59756adf5b4c.png)
  
  ![image](https://user-images.githubusercontent.com/18515029/232869430-49a80b89-ac58-40d6-ab65-79af1082e777.png)





