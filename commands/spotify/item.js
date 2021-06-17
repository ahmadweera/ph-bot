const Axios = require('axios');
const Auth = require('./auth');

class Request {
    constructor(url, token) {
        this.url = url,
            this.method = 'GET',
            this.headers = { 'Authorization': 'Bearer ' + token }
    }
}

module.exports = {
    GetItem: async function (command, title) {
        if (title) {
            let encoded_title = encodeURI(title);
            let token = await Auth.GetToken();
            let response = await Axios(new Request(`https://api.spotify.com/v1/search?q=${encoded_title}&type=${command}&limit=1`, token));

            let item = command === 'track'
                ? response.data.tracks.items[0]
                : response.data.albums.items[0];

            if (item) {
                return `${item.name}\n${item.external_urls.spotify}`;
            }
        }
    }
}