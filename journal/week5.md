# Week 5 — DynamoDB and Serverless Caching

# Part 1 DyanamoDB script to load data

## Verify local Postgres setup

![image](https://user-images.githubusercontent.com/18515029/226615275-2aeb6dcc-0702-4162-8bd5-7868d3e82bde.png)

## DynamoDB Schema- load

![image](https://user-images.githubusercontent.com/18515029/226863121-6ba586df-385a-49b5-b656-69f02e89ddc4.png)

## Verify the table created

![image](https://user-images.githubusercontent.com/18515029/226863408-637f56ea-0b54-4c89-bbad-330fe0bf3e77.png)

## Can we drop the table ?

![image](https://user-images.githubusercontent.com/18515029/226863701-2cf94f74-4332-4279-9ba8-1a86410c00c7.png)

## Load schema again and seed the data

![image](https://user-images.githubusercontent.com/18515029/226866820-02889d3c-db49-4d4d-b444-54e899b50e32.png)

### Scan the table to view the records

![image](https://user-images.githubusercontent.com/18515029/226867493-50f7d408-b00b-4cb0-9672-3166a5804db7.png)

### Query DynamoDB. (Pattern 1)
This query is to get the data about the paricular conversation. check the message group id

![image](https://user-images.githubusercontent.com/18515029/226869417-b38c028e-9975-48d2-bfc4-453f5c8ce2a6.png)

### Query DynamoDB. (Pattern 2)
This query is to get the list of conversations for the my user
First the get the user uuid from psotgres

![image](https://user-images.githubusercontent.com/18515029/226871408-bbe9cab7-b876-4a76-8838-0f8afd966981.png)

## Part 2 -:

### List cognito users from pool

![image](https://user-images.githubusercontent.com/18515029/227713980-80884399-7bff-43a2-9df3-415e2abc2638.png)

### Postgres localDB seed 

![image](https://user-images.githubusercontent.com/18515029/227713414-0ce0c271-8d74-4c08-abc7-df6f74676abc.png)

### Update Cognito UUID as well as username for local run

![image](https://user-images.githubusercontent.com/18515029/227715857-a190b5e0-c3ec-4c55-922d-7a36399a7df5.png)

### Seed local dynamoDB data with minor modification to script

![image](https://user-images.githubusercontent.com/18515029/227716018-6add0554-4fb0-43b7-a86b-9dec08dca0d7.png)

### Message group displayed

![image](https://user-images.githubusercontent.com/18515029/227716068-6beced39-9cd6-4911-8490-7bb997b80f74.png)


### List the conversations 

![image](https://user-images.githubusercontent.com/18515029/227716174-609dbe2c-968b-4255-aa51-4df42830b907.png)

### Post the message

![image](https://user-images.githubusercontent.com/18515029/227716637-ffc00664-a397-40d5-b910-4ced1c35fdbc.png)

UI Distorted

![image](https://user-images.githubusercontent.com/18515029/227716650-1f3c0902-0baf-4be5-84c6-57f767b055f5.png)




### Changes to app.py + message_group.py files (access pattern 1)

## Part 3 -: 

### Create DyanmoDB table on AWS

![image](https://user-images.githubusercontent.com/18515029/227580667-bf5db1c1-e728-463f-9c34-6a3aa3280329.png)

![image](https://user-images.githubusercontent.com/18515029/227580744-a75b83b3-2bd1-445a-b3e5-2b4ff14fa720.png)

### Enable Stream

![image](https://user-images.githubusercontent.com/18515029/227581264-7babb3ff-b4c6-4690-a646-d1772f23966d.png)


### Create VPC Gateway endpoint for dynamodb service

![image](https://user-images.githubusercontent.com/18515029/227582271-3b3c25f6-674d-4bfd-bf8b-64aa1627c057.png)


### Attach DynamoDB specific policy to Lambda Function

![image](https://user-images.githubusercontent.com/18515029/227585012-be4b9bf1-5b51-4c19-a21a-ed851ff9e1cd.png)


![image](https://user-images.githubusercontent.com/18515029/227584750-3cb829ad-fa9e-4388-b8d2-8156bf8bcc1c.png)

### Correction - Create new inline policy and attach it (remove full access dynamoDB)

![image](https://user-images.githubusercontent.com/18515029/227713054-346c3e92-a979-4f47-a9fa-f3a69c4f9981.png)


### Create Trigger for Dynamodb with given Lambda function

![image](https://user-images.githubusercontent.com/18515029/227586014-dd443e6d-2f4a-4e29-b8e5-72fd0b966461.png)

### Testing Pending




