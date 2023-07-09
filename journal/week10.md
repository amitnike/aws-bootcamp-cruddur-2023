# Week 10 — CloudFormation Part 1

## Required HomeWork

### Networking - VPC CFN 

The  CloudFormation (CFN) are created using  either JSON or YAML. The CFN files , template.yaml are created  inside the aws/cfn folder.
VPC Stack created has below componenets created using script -:

  - VPC
    - sets DNS hostnames for EC2 instances
    - Only IPV4, IPV6 is disabled
  - InternetGateway
  - Route Table
    - route to the IGW
    - route to Local
  - 6 Subnets Explicity Associated to Route Table
    - 3 Public Subnets numbered 1 to 3
    - 3 Private Subnets numbered 1 to 3

The executable script takes the template.yaml as well as config.toml 

```
#! /usr/bin/env bash
set -e # stop the execution of the script if it fails

CFN_PATH="$(pwd)/aws/cfn/networking/template.yaml"
CONFIG_PATH="$(pwd)/aws/cfn/networking/config.toml"
echo $CFN_PATH

cfn-lint $CFN_PATH

BUCKET=$(cfn-toml key deploy.bucket -t $CONFIG_PATH)
REGION=$(cfn-toml key deploy.region -t $CONFIG_PATH)
STACK_NAME=$(cfn-toml key deploy.stack_name -t $CONFIG_PATH)

aws cloudformation deploy \
  --stack-name $STACK_NAME \
  --s3-bucket $BUCKET \
  --s3-prefix networking \
  --region $REGION \
  --template-file "$CFN_PATH" \
  --no-execute-changeset \
  --tags group=cruddur-networking \
  --capabilities CAPABILITY_NAMED_IAM


```

The CFN output is as below -:

![image](https://github.com/amitnike/aws-bootcamp-cruddur-2023/assets/18515029/d9041204-00d6-4f9d-83b5-6691475de2e5)


The VPC -:

![image](https://github.com/amitnike/aws-bootcamp-cruddur-2023/assets/18515029/97def2a9-8c5a-4091-b67c-d94a45b793be)



### ECS Cluster CFN

The ECS cluster has following items created using the script

  The networking and cluster configuration to support fargate containers
  - ECS Fargate Cluster
  - Application Load Balanacer (ALB)
    - ipv4 only
    - internet facing
    - certificate attached from Amazon Certification Manager (ACM)
  - ALB Security Group
  - HTTPS Listerner
    - send naked domain to frontend Target Group
    - send api. subdomain to backend Target Group
  - HTTP Listerner
    - redirects to HTTPS Listerner
  - Backend Target Group
  - Frontend Target Group

The executable script takes the template.yaml as well as config.toml 

```
#! /usr/bin/env bash
set -e # stop the execution of the script if it fails

CFN_PATH="$(pwd)/aws/cfn/cluster/template.yaml"
CONFIG_PATH="$(pwd)/aws/cfn/cluster/config.toml"
echo $CFN_PATH

cfn-lint $CFN_PATH

BUCKET=$(cfn-toml key deploy.bucket -t $CONFIG_PATH)
REGION=$(cfn-toml key deploy.region -t $CONFIG_PATH)
STACK_NAME=$(cfn-toml key deploy.stack_name -t $CONFIG_PATH)
PARAMETERS=$(cfn-toml params v2 -t $CONFIG_PATH)

aws cloudformation deploy \
  --stack-name $STACK_NAME \
  --s3-bucket $BUCKET \
  --s3-prefix cluster \
  --region $REGION \
  --template-file "$CFN_PATH" \
  --no-execute-changeset \
  --tags group=cruddur-cluster \
  --parameter-overrides $PARAMETERS \
  --capabilities CAPABILITY_NAMED_IAM

```
The CFN cluster output generated as below -:

![image](https://github.com/amitnike/aws-bootcamp-cruddur-2023/assets/18515029/63184fbc-140c-4e01-8340-5247ff49b984)

The ECS cluster for Cruddur backend -:

![image](https://github.com/amitnike/aws-bootcamp-cruddur-2023/assets/18515029/96d4c3c1-a444-486c-adf3-b615c7a81d12)


### CFN RDS
### CFN DyanmoDB using SAM
### CFN Services 
### CFN CICD
### Diagramming



