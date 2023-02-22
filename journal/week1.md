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

### Running the docker on local

![image](https://user-images.githubusercontent.com/18515029/220299997-d2f1eb82-ade2-4b61-9b00-5d9f34aa182c.png)

## Hands-on docker with spring-boot app

### Prepare the sample spring boot and add dockerfile with below contents

```
FROM openjdk:8-jdk-alpine
EXPOSE  8080
ADD target/hello-world-rest-api.jar hello-world-rest-api.jar
ENTRYPOINT ["sh", "-c", "java -jar /hello-world-rest-api.jar"]

```
### Build the docker image and tag it

```
docker build -t amitnike/hello-docker-world:0.0.1 .
```
![image](https://user-images.githubusercontent.com/18515029/220566237-235ed325-6835-4953-af60-4528c9e29a7e.png)

### Run the images

```
docker run -p 8080:8080 amitnike/hello-docker-world:0.0.1
```
![image](https://user-images.githubusercontent.com/18515029/220566580-1155ebdf-f7bd-46f8-b461-4f96a957f4e8.png)

### Test the app with browser URL

```
http://localhost:8080/hello-world
```
![image](https://user-images.githubusercontent.com/18515029/220564840-0506e2a8-0a5f-4b3b-a4a8-5aef45de2128.png)

### Push the iamge to remote repo

### First set up the connectivity with docker hub usig pass init

https://docs.docker.com/desktop/get-started/#credentials-management-for-linux-users

### Docker hub connection is success

![image](https://user-images.githubusercontent.com/18515029/220569089-f5c90712-c0e8-41c9-b719-a2b5c4b3e3da.png)

### Push the image to docker hub

```
docker push amitnike/hello-docker-world:0.0.1
```
![image](https://user-images.githubusercontent.com/18515029/220569604-34ce6760-948a-4f3a-84b5-7e7038d59951.png)

![image](https://user-images.githubusercontent.com/18515029/220569732-c41b2a47-f99b-4703-8504-bf2856ed773d.png)



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
