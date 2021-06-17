// Spotify Commands
const New = require('./spotify/new.js');
const Item = require('./spotify/item.js');

// Sports Commands
const NBA = require('./sports/nba.js');
const Futbol = require('./sports/futbol.js');

module.exports = {
    // Spotify
    GetNewRelease: async function(argument) {
        return await New.GetArtistNewRelease(argument);
    },
    GetItem: async function(command, argument) {
        return await Item.GetItem(command, argument);
    },

    // Sports
    GetGames: async function(argument, emojis) {
        return await NBA.GetGames(argument, emojis)
    },
    GetMatches: async function(argument, emojis) {
        return await Futbol.GetMatches(argument, emojis)
    }
}