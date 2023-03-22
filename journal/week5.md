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





