require('dotenv').config();

/**
 * Imports
 */
const axios = require('axios');
const moment = require('moment-timezone');
const discord = require('discord.js');

const date_format = 'YYYYMMDD';

class Request {
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
    // GetGamesForDate: async function (arg) {
    //     if (!arg) {
    //         arg = moment().format(date_format);
    //     }

    //     let dates = GetRelativeDates(arg);
    //     let trueDate = dates.d1;
    //     let date = trueDate === moment().format(date_format) ? 'Today' : trueDate;

    //     // send requests 
    //     let responses = await axios.all([
    //         axios(new Request('games/date', dates.d1)),
    //         axios(new Request('games/date', dates.d1))
    //     ]);

    //     let games = [];
    //     responses.forEach((resp) => {
    //         games = games.concat(resp.data.api.games)
    //     });

    //     games = games.filter(g => moment.utc(g.startTimeUTC).tz("America/Toronto").format(date_format) === trueDate);

    //     let embed = new discord.MessageEmbed();
    //     embed.setTitle(`Games for ${date}`);

    //     games.forEach((game) => {
    //         let name = '';
    //         let value = '';
    //         let ht = game.hTeam;
    //         let at = game.vTeam;

    //         if (game.statusGame === 'Scheduled') {
    //             let time = new Date(game.startTimeUTC).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    //             name = `${ht.fullName} @ ${at.fullName}`;
    //             value = "`" + time + "`";
    //         }

    //         else if (game.statusGame === 'In Play') {
    //             name = `${ht.fullName} @ ${at.fullName}`;
    //             value = `${ht.score.points} - ${at.score.points}  ` + "`" + ` Q${game.currentPeriod[0]} => ${game.clock} ` + "`";
    //         }

    //         else if (game.statusGame === 'Finished') {
    //             name = `${ht.fullName} @ ${at.fullName}`;
    //             value = `${ht.score.points} - ${at.score.points} ` + "`FINAL`";
    //         }

    //         embed.addField(name, value, false);
    //     });

    //     if (games.length === 0) {
    //         embed.setDescription(`No games scheduled for ${date}`);
    //     }
    //     return embed;
    // },

    GetGamesForDate: async function () {
        // arg = arg
        //     ? moment(arg).format(date_format)
        //     : moment().format(date_format);

        // let date = (arg === moment().format(date_format))
        //     ? 'today'
        //     : moment(arg).format('MMM Do YY');

        // console.log(arg);

        let arg = moment().format(date_format);
        console.log(arg);

        let req = {
            'method': 'GET',
            'url': `http://data.nba.net/5s/prod/v1/${arg}/scoreboard.json`,
        }

        const resp = await axios(req);
        const games = resp.data.games;

        let embed = new discord.MessageEmbed();
        embed.setTitle(`Games for today`);

        games.forEach((game) => {
            let name = '';
            let value = '';

            if (game.statusNum === 1) {
                let time = new Date(game.startTimeUTC).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                name = `${game.hTeam.triCode} @ ${game.vTeam.triCode}`;
                value = "`" + time + "`";
            }

            else if (game.statusNum === 2) {
                name = `${game.hTeam.triCode} @ ${game.vTeam.triCode}`;
                value = `${game.hTeam.score} - ${game.vTeam.score}  `;

                value += game.period.isHalftime
                    ? ' HT'
                    : ` (Q${game.period.current}) ${game.clock} `;
            }

            else if (game.statusNum === 3) {
                name = `${game.hTeam.triCode} @ ${game.vTeam.triCode}`;
                value = `${game.hTeam.score} - ${game.hTeam.score} ` + "`FINAL`";
            }

            embed.addField(name, value, false);
        });

        return embed;
    }
}

function GetRelativeDates(dateStr) {
    let d1 = IsNullOrEmpty(dateStr)
        ? moment().format(date_format)
        : moment(dateStr).format(date_format);

    let d2 = moment(d1).add(1, 'days').format(date_format);

    return {
        'd1': d1,
        'd2': d2
    };
}

function IsNullOrEmpty(str) {
    return (!str || str === '');
}