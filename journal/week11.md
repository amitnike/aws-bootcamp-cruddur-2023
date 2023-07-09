# Week 11 — CloudFormation Part 2


### CFN DyanmoDB using SAM

Add AWS SAM installation instructions to the .gitpod.yml file.

```
tasks:
  - name: aws-sam
    init: |
      cd /workspace
       wget https://github.com/aws/aws-sam-cli/releases/latest/download/aws-sam-cli-linux-x86_64.zip
       unzip aws-sam-cli-linux-x86_64.zip -d sam-installation
       sudo ./sam-installation/install
       sudo rm -rf ./aws-sam-cli-linux-x86_64.zip
       sudo rm -rf ./aws-sam-cli-linux-x86_64
       cd $THEIA_WORKSPACE_ROOT
```

Move the cruddur-messaging-stream.py file to ddb/function/ and rename it as lambda_function.py.
Create a ddb/config.toml file. (this is different from config.toml used in cfn-toml)

```
version=0.1

[default.build.parameters]
region = ""

[default.package.parameters]
region = ""

[default.deploy.parameters]
region = ""
```

Create SAM Build, Package, and Deploy scripts within the ddb/ folder.

SAM Build script 

```
#! /usr/bin/env bash
set -e # stop the execution of the script if it fails

FUNC_DIR="$(pwd)/ddb/function"
TEMPLATE_PATH="$(pwd)/ddb/template.yaml"
CONFIG_PATH="$(pwd)/ddb/config.toml"

sam validate -t $TEMPLATE_PATH

echo "== build"
# https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-build.html
# --use-container
# use container is for building the lambda in a container
# it's still using the runtimes and its not a custom runtime
sam build \
--use-container \
--config-file $CONFIG_PATH \
--template $TEMPLATE_PATH \
--base-dir $FUNC_DIR
#--parameter-overrides

```
Package

```
#! /usr/bin/env bash
set -e # stop the execution of the script if it fails

ARTIFACT_BUCKET="avn-cfn-artifacts"
TEMPLATE_PATH="$(pwd)/.aws-sam/build/template.yaml"
OUTPUT_TEMPLATE_PATH="$(pwd)/.aws-sam/build/packaged.yaml"
CONFIG_PATH="$(pwd)/ddb/config.toml"

echo "== package"
# https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-package.html
sam package \
  --s3-bucket $ARTIFACT_BUCKET \
  --config-file $CONFIG_PATH \
  --output-template-file $OUTPUT_TEMPLATE_PATH \
  --template-file $TEMPLATE_PATH \
  --s3-prefix "ddb"
```
Deploy

```
#! /usr/bin/env bash
set -e # stop the execution of the script if it fails

PACKAGED_TEMPLATE_PATH="$(pwd)/.aws-sam/build/packaged.yaml"
CONFIG_PATH="$(pwd)/ddb/config.toml"

echo "== deploy"
# https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-deploy.html
sam deploy \
  --template-file $PACKAGED_TEMPLATE_PATH  \
  --config-file $CONFIG_PATH \
  --stack-name "CrdDdb" \
  --tags group=cruddur-ddb \
  --no-execute-changeset \
  --capabilities "CAPABILITY_NAMED_IAM"

```

DynamoDB CFN Output as below -:

![image](https://github.com/amitnike/aws-bootcamp-cruddur-2023/assets/18515029/dd75c3f1-6f64-400c-9bca-dad750c7a433)

DDB  -:

![image](https://github.com/amitnike/aws-bootcamp-cruddur-2023/assets/18515029/e6577229-d1c7-4969-9847-5e023d6124e7)


### CFN Services 

AWS CFN for ECS services will be created for below-:

Description: |
  Task Definition
  Fargate Service
  Execution Role
  Task Role

The script for generating the service 

```
#! /usr/bin/env bash
set -e # stop the execution of the script if it fails

CFN_PATH="$(pwd)/aws/cfn/service/template.yaml"
CONFIG_PATH="$(pwd)/aws/cfn/service/config.toml"
echo $CFN_PATH

cfn-lint $CFN_PATH

BUCKET=$(cfn-toml key deploy.bucket -t $CONFIG_PATH)
REGION=$(cfn-toml key deploy.region -t $CONFIG_PATH)
STACK_NAME=$(cfn-toml key deploy.stack_name -t $CONFIG_PATH)
PARAMETERS=$(cfn-toml params v2 -t $CONFIG_PATH)


aws cloudformation deploy \
  --stack-name $STACK_NAME \
  --s3-bucket $BUCKET \
  --s3-prefix backend-service \
  --region $REGION \
  --template-file "$CFN_PATH" \
  --no-execute-changeset \
  --tags group=cruddur-backend-flask \
  --parameter-overrides $PARAMETERS \
  --capabilities CAPABILITY_NAMED_IAM
```

The CFN output is generated as below -:

![image](https://github.com/amitnike/aws-bootcamp-cruddur-2023/assets/18515029/d8f78b1a-1946-468e-842c-7da2a04230d1)

The backend service along with tasks

![image](https://github.com/amitnike/aws-bootcamp-cruddur-2023/assets/18515029/19108601-f3ff-4249-83f7-acb61757b7c5)


### CFN CICD 

The CFCICD pipeline will generate below ites -:

  - CodeStar Connection V2 Github
  - CodePipeline
  - Codebuild

The CFN script for CICD setup as below -:

```
#! /usr/bin/env bash
#set -e # stop the execution of the script if it fails

CFN_PATH="$(pwd)/aws/cfn/cicd/template.yaml"
CONFIG_PATH="$(pwd)/aws/cfn/cicd/config.toml"
PACKAGED_PATH="$(pwd)/tmp/packaged-template.yaml"
PARAMETERS=$(cfn-toml params v2 -t $CONFIG_PATH)
echo $CFN_PATH

cfn-lint $CFN_PATH

BUCKET=$(cfn-toml key deploy.bucket -t $CONFIG_PATH)
REGION=$(cfn-toml key deploy.region -t $CONFIG_PATH)
STACK_NAME=$(cfn-toml key deploy.stack_name -t $CONFIG_PATH)

# package
# -----------------
echo "== packaging CFN to S3..."
aws cloudformation package \
  --template-file $CFN_PATH \
  --s3-bucket $BUCKET \
  --s3-prefix cicd-package \
  --region $REGION \
  --output-template-file "$PACKAGED_PATH"

aws cloudformation deploy \
  --stack-name $STACK_NAME \
  --s3-bucket $BUCKET \
  --s3-prefix cicd \
  --region $REGION \
  --template-file "$PACKAGED_PATH" \
  --no-execute-changeset \
  --tags group=cruddur-cicd \
  --parameter-overrides $PARAMETERS \
  --capabilities CAPABILITY_NAMED_IAM

```

View of CICD code build & code pipeline

![image](https://github.com/amitnike/aws-bootcamp-cruddur-2023/assets/18515029/2510e5ce-cb5e-40a9-86fd-25a1a266cdce)


![image](https://github.com/amitnike/aws-bootcamp-cruddur-2023/assets/18515029/39974da3-3c8a-4090-b15f-f8a90079fde7)


### AWS CloudFormation Security Best Practices


AWS CFN Best Practices - AWS

Compliance standard is what your business requires from a Infrastructure as Code (laC) service and is available in the region you need to operate in.
Amazon Organizations SCP - to restrict actions like creation, deletion, modification of production Cloudformation Templates/Resources etc
AWS CloudTrail is enabled & monitored to trigger alerts for malicious activities e.g changes to Production Environment etc
AWS Audit Manager, IAM Access Analyzer etc
AWS CFN Best Practices - Application

Linting CFN
Access Control - Roles or IAM Users for making changes in Amazon Cloudformation Template stacks or StackSets especially one for production.
Security of the Cloudformation - Configuration access
Security in the Cloudformation - Code Security Best Practices - SCA, SAST, Secret Scanner, DAST implemented in the CI/CD Pipeline
Security of the CloudFormation entry points e.g - private access points using AWS Private Link etc
Only use Trusted source control for sending changes to CFN
Develop process for continuously verifying if there is a changes in compromise the known state of a CI/CD pipeline


### Diagramming


![image](https://github.com/amitnike/aws-bootcamp-cruddur-2023/assets/18515029/e4f4cad5-7507-436c-85ce-e574123fea44)

### CFN TOML

cfn-toml is a tool utilized for retrieving environment variables from a config.toml file specifically designed for CloudFormation templates.

Installation & Setup

gem install cfn-toml (add to gitpod.yaml).

Create aws/cfn/cluster/config.toml

```

[deploy]
bucket = ''
region = ''
stack_name = 'CrdCluster'

[parameters]
CertificateArn = ''
NetworkingStack = 'CrdNet'

```

### CFN Static Website Hosting - Frontend



CFN Script forFrontservice will help to create below items

  - CloudFront Distribution
  - S3 Bucket for www.
  - S3 Bucket for naked domain
  - Bucket Policy

Script to execute the CFN

```
#! /usr/bin/env bash
set -e # stop the execution of the script if it fails

CFN_PATH="$(pwd)/aws/cfn/frontend/template.yaml"
CONFIG_PATH="$(pwd)/aws/cfn/frontend/config.toml"
echo $CFN_PATH

cfn-lint $CFN_PATH

BUCKET=$(cfn-toml key deploy.bucket -t $CONFIG_PATH)
REGION=$(cfn-toml key deploy.region -t $CONFIG_PATH)
STACK_NAME=$(cfn-toml key deploy.stack_name -t $CONFIG_PATH)
PARAMETERS=$(cfn-toml params v2 -t $CONFIG_PATH)

aws cloudformation deploy \
  --stack-name $STACK_NAME \
  --s3-bucket $BUCKET \
  --s3-prefix frontend \
  --region $REGION \
  --template-file "$CFN_PATH" \
  --no-execute-changeset \
  --tags group=cruddur-frontend \
  --parameter-overrides $PARAMETERS \
  --capabilities CAPABILITY_NAMED_IAM

```
Created bukcet as per the DNS for your webiste

![image](https://github.com/amitnike/aws-bootcamp-cruddur-2023/assets/18515029/20b3aa87-4b3c-42b8-a1e1-4ff740d54f9d)

CFN stack 

![image](https://github.com/amitnike/aws-bootcamp-cruddur-2023/assets/18515029/79fdb50d-3d1e-41fc-9c95-cdea9e7ff0ec)

CloufFront -:

![image](https://github.com/amitnike/aws-bootcamp-cruddur-2023/assets/18515029/bcdb68ae-53c8-468a-8f84-2aa63427243f)


Script to prepare the static build and sync with cloudfront

./bin/frontend/static-build

```
#! /usr/bin/bash

ABS_PATH=$(readlink -f "$0")
FRONTEND_PATH=$(dirname $ABS_PATH)
BIN_PATH=$(dirname $FRONTEND_PATH)
PROJECT_PATH=$(dirname $BIN_PATH)
echo $(pwd)
PROJECT_PATH=$(pwd)
FRONTEND_REACT_JS_PATH="$PROJECT_PATH/frontend-react-js"

cd $FRONTEND_REACT_JS_PATH


REACT_APP_BACKEND_URL="https://api.testcruddur.click" \
REACT_APP_AWS_PROJECT_REGION="$AWS_DEFAULT_REGION" \
REACT_APP_AWS_COGNITO_REGION="$AWS_DEFAULT_REGION" \
REACT_APP_AWS_USER_POOLS_ID="ap-south-1_HvWBed4Mc" \
REACT_APP_CLIENT_ID="4a930ki8237113j3847gpuov0n" \
npm run build

```
./bin/frontend/sync

```

#!/usr/bin/env ruby

require 'aws_s3_website_sync'
require 'dotenv'

env_path = "/home/amit/Documents/git/cruddur-app-2023/aws-bootcamp-cruddur-2023/bin/frontend/sync.env"
Dotenv.load(env_path)

puts "== configuration"
puts "aws_default_region:   ap-south-1"
puts "s3_bucket:            testcruddur.click"
puts "distribution_id:      ******"
puts "build_dir:            /home/amit/Documents/git/cruddur-app-2023/aws-bootcamp-cruddur-2023/frontend-react-js/build"

changeset_path = '/home/amit/Documents/git/cruddur-app-2023/aws-bootcamp-cruddur-2023/tmp/sync-changeset.json'
changeset_path = changeset_path.sub(".json","-#{Time.now.to_i}.json")

puts "output_changset_path: #{changeset_path}"
puts "auto_approve:         false"

puts "sync =="
AwsS3WebsiteSync::Runner.run(
  aws_access_key_id:     '*******',
  aws_secret_access_key: '*********',
  aws_default_region:    'ap-south-1',
  s3_bucket:             'testcruddur.click',
  distribution_id:       '******',
  build_dir:             '/home/amit/Documents/git/cruddur-app-2023/aws-bootcamp-cruddur-2023/frontend-react-js/build',
  output_changset_path:  changeset_path,
  auto_approve:          'false',
  silent: "ignore,no_change",
  ignore_files: [
    'stylesheets/index',
    'android-chrome-192x192.png',
    'android-chrome-256x256.png',
    'apple-touch-icon-precomposed.png',
    'apple-touch-icon.png',
    'site.webmanifest',
    'error.html',
    'favicon-16x16.png',
    'favicon-32x32.png',
    'favicon.ico',
    'robots.txt',
    'safari-pinned-tab.svg'
  ]
)
```





