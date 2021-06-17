require('dotenv').config();
const axios = require('axios');

module.exports = {
    GetToken: async function() {
        const request = {
            method: 'POST',
            url: 'https://accounts.spotify.com/api/token',
            data: 'grant_type=client_credentials',
            headers: {
                'Authorization': 'Basic ' + Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    
        let response = await axios(request);
        return response.data.access_token;
    }    
}