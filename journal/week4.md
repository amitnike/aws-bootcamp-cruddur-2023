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

### Connecting to RDS and setup the schema  See  [DB-Connect](/(https://github.com/amitnike/aws-bootcamp-cruddur-2023/blob/main/backend-flask/bin/db-connect)/)  for source.   


### Connect to Database

### Create DB schema

### Drop existing schema

### Create table

### Add data to tables

### Complete setup in 1 go

### Modify security group to provide access to GITPOD IP to the RDS Instance 

