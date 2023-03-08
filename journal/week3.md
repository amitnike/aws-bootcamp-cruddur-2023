# Week 3 — Decentralized Authentication

##  Decouple the JWT verification logic (Nodejs App using AWS’s official Aws-jwt-verify.js library)

### Create app with below dependencies (SOme may be redundant )

```

    "aws-jwt-verify": "^3.4.0",
    "axios": "^1.3.4",
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.0"

```


### JS file setup to import dependencies as well as cognito instrumentation
```

const { CognitoJwtVerifier } = require("aws-jwt-verify");

const verifier = CognitoJwtVerifier.create({
    userPoolId: "{PASS_YOUR_POOL_ID}",
    tokenUse: "access",
    clientId: "{PASS_YOUR_CLIENT_ID},
  });

```

### Write a js file with logic to perform JWT validation

```
app.get('/api/validate', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
          return res.status(401).send('Unauthorized');
        }
 
        const jwtToken = authHeader.split(' ')[1];
        console.log(jwtToken);
        const payload = await verifier.verify(jwtToken);
        console.log(payload);
        const url = `{ENTER_BACKEND_HOME_ENDPOINT URL}`
        // If token is valid, make API call with token in Authorization header
        const response = await axios.get(url, {});
        console.log(response.data);
        return res.send(response.data);
      } catch (error) {
        console.error(error);
        return res.status(401).send('Unauthorized');
      }
});

```
### Setting up port as well as CORS

```

// Set the port number for the server
const PORT = process.env.PORT || 3001;

app.use(cors());

```

### Create dockerfile as well as add entries to docker compose yml

```
FROM node:16.18

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY . .

EXPOSE 3001

CMD ["npm", "start"]

```
### Verification -: Launch HomePage by running the app...Backend API call is not made as JWT verification is failed

![image](https://user-images.githubusercontent.com/18515029/223761695-465bfce3-b1e5-4249-9e2f-9287549d6bc0.png)

### Perform login with correct creds

![image](https://user-images.githubusercontent.com/18515029/223762876-e8f3df22-6826-4d6d-8100-6404d67f7aea.png)

### JWT validator app logs 

![image](https://user-images.githubusercontent.com/18515029/223763044-7a0cd656-92b7-44ee-8dfe-dcd5dd5abbff.png)


## Implement MFA with TOTP for sign-in

### Enable MFA 

![image](https://user-images.githubusercontent.com/18515029/223768695-1227c134-1dda-4d8f-92d5-ecfaaab24fd3.png)

### Update MFA configs

![image](https://user-images.githubusercontent.com/18515029/223770740-5c06f99f-b5cb-48a4-ae84-862e826d51f0.png)

### Getting error MFA and resolution

message: User does not have delivery config set to turn on SOFTWARE_TOKEN_MFA

![image](https://user-images.githubusercontent.com/18515029/223771859-a56869ed-33e2-4fd3-8f3d-2d51fb14711e.png)

![image](https://user-images.githubusercontent.com/18515029/223780298-788c6a99-525f-48be-99e9-690296314783.png)

![image](https://user-images.githubusercontent.com/18515029/223781255-7085398b-725b-4fcd-948b-77eacb7ff3b8.png)

![image](https://user-images.githubusercontent.com/18515029/223782680-653dc465-6e32-49cb-b062-b8e9e116ab49.png)



## New user pool with IDP (Google).

### New user pool created

![image](https://user-images.githubusercontent.com/18515029/223796086-8c029ea8-82cf-42e9-9b3f-2c17ff3351ac.png)

### Set up the project and get the new creds from Google cloud platform console

![image](https://user-images.githubusercontent.com/18515029/223796404-8feb42a4-7055-44aa-99b0-ff21f4d472bf.png)


### Add a social IdP to your user pool

![image](https://user-images.githubusercontent.com/18515029/223796730-c64eb19a-d6eb-478a-8776-6c24810ac50a.png)


![image](https://user-images.githubusercontent.com/18515029/223797006-4072b9dc-86c9-4428-adbe-d7d8bb751e63.png)


### Verification -: Test your social IdP configuration

Enter url -:

```
https://cruddur.auth.ap-south-1.amazoncognito.com/login?response_type=code&client_id=<client ID>&redirect_uri=https://www.google.com

```

![image](https://user-images.githubusercontent.com/18515029/223798791-98519c7a-a020-4284-b983-26699c13f31a.png)


![image](https://user-images.githubusercontent.com/18515029/223799057-03634637-c893-4fdc-8ec2-1d87f4b3eeb7.png)

    


