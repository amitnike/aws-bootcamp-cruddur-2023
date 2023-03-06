const express = require('express');
const jwt = require('aws-jwt-verify');
const axios = require('axios');
const cors = require('cors');


// Verifier that expects valid access tokens:
// const verifier = awsJwtVerify.create({
//     userPoolId: "<user_pool_id>",
//     tokenUse: "access",
//     clientId: "<client_id>",
//   });

const app = express();
// Set the port number for the server
const PORT = process.env.PORT || 3001;

app.use(cors());

// Define the route for the API call by first validating it
app.get('/api/validate', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
          return res.status(401).send('Unauthorized');
        }
 
        const token = authHeader.split(' ')[1];
        const decoded = await jwt.verify(token);
        console.log(token);
        const backendurl = req.headers.backendurl;
        if (!backendurl) {
            return res.status(400).send('Invalid Request');
        }
        const url = backendurl.split(' ')[1];
        
        // If token is valid, make API call with token in Authorization header
        const response = await axios.get(url, {});
    
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
