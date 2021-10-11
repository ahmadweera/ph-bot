const Axios = require('axios');
const Auth = require('./auth');
const Helper = require('../../helper');

class Request {
    constructor(url, token) {
        this.url = url,
            this.method = 'GET',
            this.headers = { 'Authorization': 'Bearer ' + token }
    }
}

module.exports = {
    GetItem: async function (interaction) {
        let command = Helper.GetInteractionName(interaction);
        let title = Helper.GetInteractionArgs(interaction);
        
        if (title) {
            let encoded_title = encodeURI(title);
            let token = await Auth.GetToken();
            let response = await Axios(new Request(`https://api.spotify.com/v1/search?q=${encoded_title}&type=${command}&limit=1`, token));

            let item = command === 'track'
                ? response.data.tracks.items[0]
                : response.data.albums.items[0];

            let content = item
                ? `${item.name}\n${item.external_urls.spotify}`
                : 'Release not found.'

            return Helper.CreateResponseObject({
                interaction: interaction,
                content: content
            });
        }
    }
}