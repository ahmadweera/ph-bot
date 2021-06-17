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
    GetArtistNewRelease: async function (name) {
        if (name) {
            let token = await Auth.GetToken();
            let artist = await GetArtistByName(name, token);
            

            let responses = await Axios.all([
                Axios(new Request(`https://api.spotify.com/v1/artists/${artist.id}/albums?include_groups=album&limit=1`, token)),
                Axios(new Request(`https://api.spotify.com/v1/artists/${artist.id}/albums?include_groups=single&limit=1`, token))
            ]);

            let album = responses[0].data.items[0];
            let single = responses[1].data.items[0];

            let latest_release;
            if (album && !single) {
                latest_release = album;
            } else if (single && !album) {
                latest_release = single;
            } else if (single && album) {
                latest_release = album.release_date > single.release_date ? album : single;
            }

            if (latest_release) {
                return `${artist.name}\nhttps://open.spotify.com/${latest_release.type}/${latest_release.id}`;
            }
        }
    }
}

async function GetArtistByName(name, token) {
    let encoded_name = encodeURI(name);
    let response = await Axios(new Request(`https://api.spotify.com/v1/search?q=${encoded_name}&type=artist&limit=1`, token));
    let artists = response.data.artists.items;

    let artist;
    if (artists[0]) {
        artist = artists[0];
    }

    return artist;
}
