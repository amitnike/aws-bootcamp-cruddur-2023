# Week 6 — Deploying Containers

## Folder Restructure and Env variable file

In this step , we restrucuted the script file into a separate directory 

- `bin`: earlier it was used as `backend-flask/bin` ;
- `erb`: to store ERB files to generate our environment variables;
- `docker-compose.yml`: update networks ;


## Create ECS cluster , Log group ,ECR Repo

Using AWS CLI, create a CloudWatch log group named `cruddur`, a ECS cluster named `cruddur`, and three ECR repos on AWS:

```sh
aws logs create-log-group --log-group-name cruddur
aws logs put-retention-policy --log-group-name cruddur --retention-in-days 1

aws ecs create-cluster \
 --cluster-name cruddur \
 --service-connect-defaults namespace=cruddur

aws ecr create-repository \
 --repository-name cruddur-python \
 --image-tag-mutability MUTABLE

aws ecr create-repository \
 --repository-name backend-flask \
 --image-tag-mutability MUTABLE

aws ecr create-repository \
 --repository-name frontend-react-js \
 --image-tag-mutability MUTABLE
```
## Setting env variable to run AWS CLI Commands

```sh
export AWS_ACCOUNT_ID={your_acct_id}
gp env AWS_ACCOUNT_ID={your_acct_id}

export AWS_DEFAULT_REGION={your_region}
gp env AWS_DEFAULT_REGION={your_region}

export ECR_PYTHON_URL="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/cruddur-python"
gp env ECR_PYTHON_URL="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/cruddur-python"

export ECR_FRONTEND_REACT_URL="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/frontend-react-js"
gp env ECR_FRONTEND_REACT_URL="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/frontend-react-js"

export ECR_BACKEND_FLASK_URL="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/backend-flask"
gp env ECR_BACKEND_FLASK_URL="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/backend-flask"
```

## Create images, tag them and Push to repo

For Python base images

```sh
./bin/ecr/login

docker pull python:3.10-slim-buster
docker tag python:3.10-slim-buster $ECR_PYTHON_URL:3.10-slim-buster
docker push $ECR_PYTHON_URL:3.10-slim-buster
```

The above image is used as the base image for backend app (Refer dockerfile)
Create the backend image and push it to repo
Configure the health check using new health endpoint as well as HC script

```sh
./bin/backend/build
./bin/ecr/login
./bin/backend/push
```
For the frontend image

```sh
cd frontend-react-js
npm run build
cd ../
./bin/frontend/build
./bin/ecr/login
./bin/frontend/push
```
## Setting up the AWS IAM Roles 

``` sh
aws iam create-role \
    --role-name CruddurTaskRole \
    --assume-role-policy-document "{
  \"Version\":\"2012-10-17\",
  \"Statement\":[{
    \"Action\":[\"sts:AssumeRole\"],
    \"Effect\":\"Allow\",
    \"Principal\":{
      \"Service\":[\"ecs-tasks.amazonaws.com\"]
    }
  }]
}"

aws iam put-role-policy \
  --policy-name SSMAccessPolicy \
  --role-name CruddurTaskRole \
  --policy-document "{
  \"Version\":\"2012-10-17\",
  \"Statement\":[{
    \"Action\":[
      \"ssmmessages:CreateControlChannel\",
      \"ssmmessages:CreateDataChannel\",
      \"ssmmessages:OpenControlChannel\",
      \"ssmmessages:OpenDataChannel\"
    ],
    \"Effect\":\"Allow\",
    \"Resource\":\"*\"
  }]
}
"

aws iam attach-role-policy --policy-arn arn:aws:iam::aws:policy/CloudWatchFullAccess --role-name CruddurTaskRole
aws iam attach-role-policy --policy-arn arn:aws:iam::aws:policy/AWSXRayDaemonWriteAccess --role-name CruddurTaskRole

```

## Setting up the Load balancer , Target Groups  and security group configs

- Basic configurations: name `cruddur-alb`, Internet-facing, IPv4 address type;
- Network mapping: default VPC, select first three availability zones;
- Security groups: create a new security group named `cruddur-alb-sg`, 
    set inbound rules of HTTP and HTTPS from the  source from Anywhere (For security purpose it needs to set from your own IP);
- Security groups: create a new security group named `cruddur-srv-sg`, 
    set inbound rules of Custom TCP of 4567 and 3000 from the port source from `cruddur-alb-sg`;
  
- Target Group + Listeners with HC: 
  - HTTP:4567 with a new target group named `cruddur-backend-flask-tg`, select type as IP addresses, set HTTP:4567, set health check as `/api/health-check` with 3 healthy threshold, get its arn to put in `aws/json/service-backend-flask.json`
  
  - HTTP:3000 with another target group created named `cruddur-frontend-react-js-tg`
    set 3 healthy threshold, get its arn to put in `aws/json/service-frontend-react-js.json`.

## Passing env variable to AWS 

```sh
aws ssm put-parameter --type "SecureString" --name "/cruddur/backend-flask/AWS_ACCESS_KEY_ID" --value $AWS_ACCESS_KEY_ID
aws ssm put-parameter --type "SecureString" --name "/cruddur/backend-flask/AWS_SECRET_ACCESS_KEY" --value $AWS_SECRET_ACCESS_KEY
aws ssm put-parameter --type "SecureString" --name "/cruddur/backend-flask/CONNECTION_URL" --value $PROD_CONNECTION_URL
aws ssm put-parameter --type "SecureString" --name "/cruddur/backend-flask/ROLLBAR_ACCESS_TOKEN" --value $ROLLBAR_ACCESS_TOKEN
aws ssm put-parameter --type "SecureString" --name "/cruddur/backend-flask/OTEL_EXPORTER_OTLP_HEADERS" --value "x-honeycomb-team=$HONEYCOMB_API_KEY"
```

## Create Fargate task and service

Build the docker images using 

```sh
./bin/backend/build
./bin/frontend/build
```
Login to ECR using 

```sh
./bin/ecr/login
```

Tag and push the docker images using 

```sh
./bin/backend/push
./bin/frontend/push
```

Register the task definition using 

```sh
./bin/backend/register
./bin/frontend/register
```

Create backend and frontend service using

```sh
aws ecs create-service --cli-input-json file://aws/json/service-frontend-react-js.json
aws ecs create-service --cli-input-json file://aws/json/service-backend-flask.json
```

Deploy process has been automated using 
```sh
./bin/backend/deploy
./bin/frontend/deploy
```

In order to validate the service deployment, we can connect to containerId under the taks for given service
```sh
./bin/backend/connect
./bin/frontend/connect
```

## Purchase Domain name and Host the application using Route53

## Container Insights

Update the Frontend and backend taks definition to include Xray Deamon

```sh
      {
        "name": "xray",
        "image": "public.ecr.aws/xray/aws-xray-daemon" ,
        "essential": true,
        "user": "1337",
        "portMappings": [
          {
            "name": "xray",
            "containerPort": 2000,
            "protocol": "udp"
          }
        ]
      }
```

Update the ECS cluster to enable container insights

View the container insights under Cloudwatch