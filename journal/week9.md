# Week 9 — CI/CD with CodePipeline, CodeBuild and CodeDeploy

## Setup of the Repo

Create a new branch named 'prod'  from the existing 'main' branch
Create a buildpsec file at location ``` backend-flask/buildspec.yml ```
Lets start the ECS backend service by updating desire tasks numbers to 1 from 0

## AWS CodeBuild

Create a Codebuild project , named ``` cruddur-backend-flask-bake-image ``` with badge enabled

source -: GitHUb repo with prod branch
use a buildspec file at location backend-flask/buildspec.yml
No artifact in artifact section
Enable cloudwatch logs
In the environment seciton, VPC configs are can be kept unchanged


## AWS Pipeline

Create a AWS CodePipeline, named ``` cruddur-backend-fargate ```
For Source stage from GitHub (Version 2), click "Connect to GitHub", set connection name as cruddur, install a new app, 
select the cruddur repo, in the end finish "Connect to GitHub" and back to the pipeline page
For Build stage, select AWS CodeBuild as build provider, amd select the newly  project cruddur-backend-flask-bake-image
For deploy stage, select ECS as deploy provider, choose cruddur cluster, backend-flask service

For Test Stege, added pytest in the code repo, tried updating the buildspec as well as pipeline by adding ew stage
Still struggling with (WIP)

## Test the app

Create HC endpoint changes to app to return addtional response and push the changes
Create PR from main to prod branch
BUild will be triggered, upon successful build new image will be pushed to ECR
A new build definition version will be create and will be referred for service deployment

### Initial Failure to the pipeline

![Screenshot from 2023-04-19 22-49-43](https://user-images.githubusercontent.com/18515029/233765496-ff6f751a-cbf5-4a6b-8a8b-3134baf42486.png)

### Update the 'codebuild-cruddur-backend-flask-bake-image-service-role' by adding new policy

![image](https://user-images.githubusercontent.com/18515029/233765687-63fdeae7-2117-4410-a6a8-eeac0fbb6b20.png)

### Successful build

![Screenshot from 2023-04-20 17-37-32](https://user-images.githubusercontent.com/18515029/233765515-af0472a0-2341-4df0-ba59-0bfbff6d34fb.png)

### Updated image at ECR

![Screenshot from 2023-04-20 17-38-26](https://user-images.githubusercontent.com/18515029/233765524-dedd31d1-aa2d-489c-8c49-c5ef8575a9cb.png)

### Old and new Task definition + New version for service

![Screenshot from 2023-04-20 17-52-34](https://user-images.githubusercontent.com/18515029/233765539-712ea602-5555-41fe-a379-b3cd247a0fa3.png)

![Screenshot from 2023-04-20 17-54-28](https://user-images.githubusercontent.com/18515029/233765546-fc1220b0-4124-4b40-ab91-3af117e5f546.png)

![Screenshot from 2023-04-20 17-58-24](https://user-images.githubusercontent.com/18515029/233765558-0c534f8d-ea78-4ef4-b6be-7981a3acc3cf.png)

### Validate the new changes in HC endpoint

![Screenshot from 2023-04-20 17-59-13](https://user-images.githubusercontent.com/18515029/233765575-93b41d46-459e-432f-b397-94fbb95e356a.png)




