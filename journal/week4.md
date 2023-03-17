# Week 4 — Postgres and RDS

## AWS RDS Setup

### Run below AWS CLI command to setup the Postgres RDS

```
aws rds create-db-instance \
  --db-instance-identifier cruddur-db-instance \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version  14.6 \
  --master-username <user> \
  --master-user-password <password> \
  --allocated-storage 20 \
  --availability-zone <az> \
  --backup-retention-period 0 \
  --port 5432 \
  --no-multi-az \
  --db-name cruddur \
  --storage-type gp2 \
  --publicly-accessible \
  --storage-encrypted \
  --enable-performance-insights \
  --performance-insights-retention-period 7 \
  --no-deletion-protection

```

### RDS Up and running

![image](https://user-images.githubusercontent.com/18515029/225875650-4784733c-e26f-4775-bdf5-f9f37bd62348.png)

 
### Connecting to RDS and setup the schema    


### Connect to Database . See  [DB-Connect](/backend-flask/bin/db-connect)  for source. 

### Create DB schema. See  [Create-Schema](/backend-flask/bin/db-create)  for source. 

### Drop existing schema. See  [Drop-Schema](/backend-flask/bin/db-drop)  for source. 

### Create table. [Schema-load](/backend-flask/bin/db-schema-load)  for source. 

### Add data to tables. [Add-Data](/backend-flask/bin/db-seed)  for source. 

### Complete setup in 1 go. [Setup-1-go](/backend-flask/bin/db-setup)  for source. 

### Modify security group to provide access to GITPOD IP to the RDS Instance [RDS-Access](/backend-flask/bin/rds-update-sg-rule)  for source. 

### Validate the connectivity from extension

![Screenshot from 2023-03-14 15-42-05](https://user-images.githubusercontent.com/18515029/225879232-520cb78b-5d5f-4e6f-aa5d-434180eb1ec8.png)

### Validate the DB connectivity from shell

![Screenshot from 2023-03-13 16-11-49](https://user-images.githubusercontent.com/18515029/225879148-2c90d12a-0b26-4a46-99e1-cf3213b84f88.png)

### Validate the RDS sg inbound rule update

![image](https://user-images.githubusercontent.com/18515029/225879075-05ceea36-c4cb-4933-b38b-20023b3df9c0.png)


## AWS Lambda Postconfirmation script

### AWS Lamda 

![image](https://user-images.githubusercontent.com/18515029/225880270-aa12954f-2da9-4f64-b466-b6e333d8aff7.png)


### Post confirmation script

### See  [cognito fuction](/aws/lambdas/cruddur-post-confirmation.py)  for source. 

### setup environment variables

![image](https://user-images.githubusercontent.com/18515029/225880742-efafc94c-b36e-4fbf-89f3-1e80d91bdd28.png)


### Update IAM role for this Lambda function

![image](https://user-images.githubusercontent.com/18515029/225880963-046883b7-a1cb-49c7-b003-23c7908186ff.png)

### Create the layer and link it to Lambda function

![image](https://user-images.githubusercontent.com/18515029/225881790-7ebef9ca-3dc4-4efa-bfd8-0fd10098bb3e.png)

Refer -: https://github.com/jkehler/awslambda-psycopg2  for more detail

### Upon signup user getting added to the user pool as well as Users table

![image](https://user-images.githubusercontent.com/18515029/225882527-975c1f42-565c-4a76-b298-f9fead989d24.png)

![Screenshot from 2023-03-14 15-42-05](https://user-images.githubusercontent.com/18515029/225879232-520cb78b-5d5f-4e6f-aa5d-434180eb1ec8.png)


## Post User activity

### Update code chages to post the activity

### changes to home_activity.py to pull the activities using DB call

### Changes to create_activity.py to post a tweet

### db.py file added for all DB operations

### app.py update to remove hard code user


