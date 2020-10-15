require('dotenv').config();
const main = require('./main');

module.exports = {
    getArtistNewRelease: async function (name) {
        if (name) {
            let artistId = await getArtistByName(name);
            let token = await getSpotifyToken();

            const request1 = {
                method: 'GET',
                url: `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album&limit=1`,
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            }

            const request2 = {
                method: 'GET',
                url: `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=single&limit=1`,
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            }

            let promises = [
                main.sendRequest(request1),
                main.sendRequest(request2)
            ];
            let responses = await main.sendMultipleRequests(promises);

            let album = responses[0].data.items[0];
            let single = responses[1].data.items[0];

            let latestRelease = album.release_date > single.release_date ? album: single;
            return `https://open.spotify.com/${latestRelease.type}/${latestRelease.id}`;
        }
    },

}

async function getSpotifyToken() {
    const request = {
        method: 'POST',
        url: 'https://accounts.spotify.com/api/token',
        data: 'grant_type=client_credentials',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }

    let response = await main.sendRequest(request);
    return response.data.access_token;
}

async function getArtistByName(name) {
    let encodedName = encodeURI(name);
    let token = await getSpotifyToken();

    const request = {
        method: 'GET',
        url: `https://api.spotify.com/v1/search?q=${encodedName}&type=artist&limit=1`,
        headers: {
            'Authorization': 'Bearer ' + token
        }
    }

    let response = await main.sendRequest(request);
    let artists = response.data.artists.items;

    let artistId;
    if (artists[0]) {
        artistId = artists[0].id;
    }

    return artistId;
}