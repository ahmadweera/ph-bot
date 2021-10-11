const Helper = require('../helper.js');

// Spotify Commands
const New = require('./spotify/new.js');
const Item = require('./spotify/item.js');

// Sports Commands
const NBA = require('./sports/nba.js');
const Futbol = require('./sports/futbol.js');
const F1 = require('./sports/f1.js');

module.exports = {
    GenerateResponse: async function (interaction, emojis) {
        let response;

        switch (Helper.GetInteractionName(interaction)) {
            case 'new':
                response = await New.GetArtistNewRelease(interaction);
                break;
            case 'track':
                response = await Item.GetItem(interaction);
                break;
            case 'album':
                response = await Item.GetItem(interaction);
                break;
            case 'nba':
                response = await NBA.GetGames(interaction, emojis);
                break;
            case 'futbol':
                response = await Futbol.GetMatches(interaction, emojis);
                break;
            case 'f1next':
                response = await F1.GetUpcomingSchedule(interaction);
                break;
            case 'f1teams':
                response = await F1.GetTeamsStandings(interaction);
                break;
            case 'f1drivers':
                response = await F1.GetDriversStanding(interaction);
                break;
            case 'f1schedule':
                response = await F1.GetFullSchedule(interaction);
                break;
        }

        return response;
    }
}