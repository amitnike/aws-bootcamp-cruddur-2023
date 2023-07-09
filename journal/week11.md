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
### AWS CloudFormation Security Best Practices

