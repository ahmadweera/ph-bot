const Axios = require('axios');
const Auth = require('./commands/spotify/auth.js');
const SpotifyNew = require('./commands/spotify/new.js');

class Request {
    constructor(url, token) {
        this.url = url,
            this.method = 'GET',
            this.headers = { 'Authorization': 'Bearer ' + token }
    }
}

var releases = new Map();
module.exports = {
    Init: async function (db) {
        db.connect();
        let res = await db.query(`SELECT * FROM releases;`)

        for (const row of res.rows) {
            releases.set(row.artist_name, row);
        }

        console.log('data loaded.');
    },
    Update: async function (db, artistId, releaseName, releaseId) {
        await db.query(`UPDATE releases SET name = $2, release_id = $3 WHERE artist_id = $1`, [artistId, releaseName, releaseId]);
    },
    TrackNewArtist: async function(db, artistName) {
        let token = await Auth.GetToken();
        const artist = await SpotifyNew.GetArtistByName(artistName, token);

        if (artist && !releases.has(artist.name)) {
            await db.query(`INSERT INTO releases(artist_name, artist_id) VALUES($1, $2)`, [artist.name, artist.id]);
        }
},
    CheckForNewRelease: async function (db) {
        let response = await NewRelease();
        let newReleases = [];

        for (const release of response) {
            let artistName = release.artist_name;
            let artistRelease = releases.get(artistName);

            if (release.release_id !== artistRelease.release_id) {
                await this.Update(db, artistRelease.artist_id, release.name, release.release_id);

                artistRelease.name = release.name;
                artistRelease.release_id = release.release_id;
                
                releases.set(artistName, artistRelease);
                newReleases.push(release);
            }
        }

        return newReleases;
    }
}

async function NewRelease() {
    let token = await Auth.GetToken();
    let map = new Map();

    for (const [key, value] of releases.entries()) {
        let res = await Axios.all([
            Axios(new Request(`https://api.spotify.com/v1/artists/${value.artist_id}/albums?include_groups=album&limit=1`, token)),
            Axios(new Request(`https://api.spotify.com/v1/artists/${value.artist_id}/albums?include_groups=single&limit=1`, token))
        ]);
        
        res.artist_id = value.artist_id;
        map.set(key, res);
    }

    let latestReleases = [];
    for (const [key, value] of map.entries()) {
        let album = value[0].data.items[0];
        let single = value[1].data.items[0];

        let latest_release;
        if (album && !single) {
            latest_release = album;
        } else if (single && !album) {
            latest_release = single;
        } else if (single && album) {
            latest_release = album.release_date > single.release_date ? album : single;
        }

        if (latest_release) {
            latestReleases.push({
                'release_id': latest_release.id,
                'name': latest_release.name,
                'artist_id': value.artist_id,
                'artist_name': key,
                'url': `https://open.spotify.com/${latest_release.type}/${latest_release.id}`
            });
        }
    }

    return latestReleases;
}
