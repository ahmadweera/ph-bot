require('dotenv').config();

const main = require('./main')
const moment = require('moment-timezone');
const { performance } = require('perf_hooks');
const date_format = 'YYYY-MM-DD';
const discord = require('discord.js');

class NBAReq {
    constructor(endpoint, arg) {
        this.method = 'GET'
        this.url = `https://api-nba-v1.p.rapidapi.com/${endpoint}/${arg}`;
        this.headers = {
            'x-rapidapi-host': 'api-nba-v1.p.rapidapi.com',
            'x-rapidapi-key': process.env.NBA_API_KEY,
            'useQueryString': true
        };
    }
}

module.exports = {
    getGamesForDate: async function (arg) {
        let start = performance.now();

        if (!arg) {
            arg = moment().format(date_format);
        }

        let dates = main.getRelativeDates(arg);
        let trueDate = dates.d1;
        let date = trueDate === moment().format(date_format) ? 'Today' : trueDate;

        // send requests 
        let r1 = performance.now();

        let promises = [
            main.sendRequest(new NBAReq('games/date', dates.d1)),
            main.sendRequest(new NBAReq('games/date', dates.d1))
        ];
        let responses = await main.sendMultipleRequests(promises);
        let r2 = performance.now();
        console.log(`request: ${Math.round(r2 - r1)}ms`)

        let games = [];
        responses.forEach((resp) => {
            games = games.concat(resp.data.api.games)
        });

        games = games.filter(g => moment.utc(g.startTimeUTC).tz("America/Toronto").format(date_format) === trueDate);

        let embed = new discord.MessageEmbed();
        embed.setTitle(`Games for ${date}`);

        games.forEach((game) => {
            let name = '';
            let value = '';
            let ht = game.hTeam;
            let at = game.vTeam;

            if (game.statusGame === 'Scheduled') {
                let time = new Date(game.startTimeUTC).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                name = `${ht.fullName} @ ${at.fullName}`;
                value = "`" + time + "`";
            }

            else if (game.statusGame === 'In Play') {
                name = `${ht.fullName} @ ${at.fullName}`;
                value = `${ht.score.points} - ${at.score.points}  ` + "`" + ` Q${game.currentPeriod[0]} => ${game.clock} ` + "`";
            }

            else if (game.statusGame === 'Finished') {
                name = `${ht.fullName} @ ${at.fullName}`;
                value = `${ht.score.points} - ${at.score.points} ` + "`FINAL`";
            }

            embed.addField(name, value, false);
        });

        if (games.length === 0) {
            embed.setDescription(`No games scheduled for ${date}`);
        }
        let end = performance.now();
        embed.setFooter(`${Math.round(end - start)}ms`)
        return embed;
    }
}

