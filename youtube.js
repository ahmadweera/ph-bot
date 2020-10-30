require('dotenv').config();

const axios = require('axios');

class Request {
    constructor(keyword) {
        this.url = `https://www.googleapis.com/youtube/v3/search?q=${keyword}&key=${process.env.YOUTUBE_API_KEY}`,
        this.method = 'GET',
        this.headers = {
            'Authorization': 'Bearer ' + '',
            'Accept': 'application/json'
        }
    }
}


module.exports = {
    GetVideoByKeyword: async function (keyword) {
        let encoded_keyword = encodeURI(keyword);
        let resp = await axios(new Request());
    }
}

function GetAccessToken() {

}