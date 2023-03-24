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

### Create Trigger for Dynamodb with given Lambda function

![image](https://user-images.githubusercontent.com/18515029/227586014-dd443e6d-2f4a-4e29-b8e5-72fd0b966461.png)

### Testing Pending




