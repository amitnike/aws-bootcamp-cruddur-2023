const express = require('express');
const { CognitoJwtVerifier } = require("aws-jwt-verify");
const axios = require('axios');
const cors = require('cors');

const app = express();
// Set the port number for the server
const PORT = process.env.PORT || 3001;

app.use(cors());

// Verifier that expects valid access tokens:
const verifier = CognitoJwtVerifier.create({
    userPoolId: "ap-south-1_HvWBed4Mc",
    tokenUse: "access",
    clientId: "4a930ki8237113j3847gpuov0n",
  });


// Define the route for the API call by first validating it
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
        const url = `https://4567-amitnike-awsbootcampcru-bopui05et79.ws-us89b.gitpod.io/api/activities/home`
        // If token is valid, make API call with token in Authorization header
        const response = await axios.get(url, {});
        console.log(response.data);
        return res.send(response.data);
      } catch (error) {
        console.error(error);
        return res.status(401).send('Unauthorized');
      }
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
