require('dotenv').config();

/**
 * Imports
 */
const axios = require('axios');
const discord = require('discord.js');

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
            let artist = await GetArtistByName(name);
            let token = await GetSpotifyToken();

            let responses = await axios.all([
                axios(new Request(`https://api.spotify.com/v1/artists/${artist.id}/albums?include_groups=album&limit=1`, token)),
                axios(new Request(`https://api.spotify.com/v1/artists/${artist.id}/albums?include_groups=single&limit=1`, token))
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
                return `New ${artist.name} (${latest_release.release_date})
                \nhttps://open.spotify.com/${latest_release.type}/${latest_release.id}`;
            }
        }
    },
    GetItemByTitle: async function (command, title) {
        if (title) {
            let encoded_title = encodeURI(title);
            let token = await GetSpotifyToken();
            let response = await axios(new Request(`https://api.spotify.com/v1/search?q=${encoded_title}&type=${command}&limit=1`, token));

            let item = command === 'track'
                ? response.data.tracks.items[0]
                : response.data.albums.items[0];

            if (item) {
                return item.external_urls.spotify;
            }
        }
    }
}

async function GetArtistByName(name) {
    let encoded_name = encodeURI(name);
    let token = await GetSpotifyToken();

    let response = await axios(new Request(`https://api.spotify.com/v1/search?q=${encoded_name}&type=artist&limit=1`, token));
    let artists = response.data.artists.items;

    let artist;
    if (artists[0]) {
        artist = artists[0];
    }

    return artist;
}

async function GetSpotifyToken() {
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
