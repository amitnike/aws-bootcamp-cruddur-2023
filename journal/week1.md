# Week 1 — App 

# Home Work Tasks -:

## Install Doker desktop on Ubuntu

### Set up the docker package repo

```
sudo apt-get update
sudo apt-get install \
    ca-certificates \
    curl \
    gnupg \
    lsb-release
    
sudo mkdir -m 0755 -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  
```

### Download Package and install

```
First download the package

sudo apt-get update
sudo apt-get install ./docker-desktop-<version>-<arch>.deb

```

### Running the application on local

![image](https://user-images.githubusercontent.com/18515029/220299997-d2f1eb82-ade2-4b61-9b00-5d9f34aa182c.png)


# Online class work

## Add new backend endpoint by updating OPENAPI spec file

![image](https://user-images.githubusercontent.com/18515029/220246773-b12fc30d-cf09-4851-aee3-8c43ffff52da.png)

## Integration of UI and backend changes as per the instructions in the video

![image](https://user-images.githubusercontent.com/18515029/220246991-7f27a324-3063-4a0b-a4db-e787033d0ab4.png)


## Successfully containerized the app using dockerfile. Run the app using docker compose 

![image](https://user-images.githubusercontent.com/18515029/220247332-e7a19f88-3a57-4ae1-9227-4af135cee103.png)

## Run DynamoDB

### Create the table / Add new item in table / List the tables/ Query the table

 ```
aws dynamodb create-table \
    --endpoint-url http://localhost:8000 \
    --table-name Music \
    --attribute-definitions \
        AttributeName=Artist,AttributeType=S \
        AttributeName=SongTitle,AttributeType=S \
    --key-schema AttributeName=Artist,KeyType=HASH AttributeName=SongTitle,KeyType=RANGE \
    --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 \
    --table-class STANDARD
    
 aws dynamodb put-item \
    --endpoint-url http://localhost:8000 \
    --table-name Music \
    --item \
        '{"Artist": {"S": "No One You Know"}, "SongTitle": {"S": "Call Me Today"}, "AlbumTitle": {"S": "Somewhat Famous"}}' \
    --return-consumed-capacity TOTAL 
    
 aws dynamodb list-tables --endpoint-url http://localhost:8000
 
 aws dynamodb scan --table-name Music --query "Items" --endpoint-url http://localhost:8000

 ```

![image](https://user-images.githubusercontent.com/18515029/220249184-6cf8249d-75e1-40f9-930d-e161280570e9.png)


## Run Postgres

Running the postgres 

![image](https://user-images.githubusercontent.com/18515029/220298000-e1598718-e3ae-4e32-9175-80efec027c25.png)
