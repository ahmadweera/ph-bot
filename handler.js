const Axios = require('axios');
const Auth = require('./commands/spotify/auth.js');

// todo store and automate this
var tracked_artists =
{
    'Kanye West': 'Nah Nah Nah (feat. DaBaby & 2 Chainz) [Remix]'
};

class Request {
    constructor(url, token) {
        this.url = url,
            this.method = 'GET',
            this.headers = { 'Authorization': 'Bearer ' + token }
    }
}

module.exports = {
    UpdateArtistLatestRelease: async function () {
        let res = await NewRelease('Kanye West');

        if (res.name != tracked_artists['Kanye West']) {
            tracked_artists['Kanye West'] = res.name;
            console.log(`${res.name}\n${res.url}`);
            return res;
        }
    }
}

async function NewRelease(name) {
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
        return {
            'name': latest_release.name,
            'id': latest_release.id,
            'artist': artist.name,
            'url': `https://open.spotify.com/${latest_release.type}/${latest_release.id}`
        };
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