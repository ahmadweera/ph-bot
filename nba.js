/**
 * Imports
 */
const axios = require('axios');
const moment = require('moment-timezone');
const discord = require('discord.js');

const date_format = 'YYYYMMDD';
const user_date_format = 'MMM Do YYYY';

class Request {
    constructor(arg) {
        this.method = 'GET';
        this.url = `http://data.nba.net/prod/v1/${arg}/scoreboard.json`;
    }
}

module.exports = {
    GetGamesForDate: async function (arg) {
        let embed = new discord.MessageEmbed();
        let date = arg
            ? moment(new Date(arg))
            : moment().tz("America/Toronto");

        if (date.isValid()) {
            const resp = await axios(new Request(date.format(date_format)))
                .catch(async function (error) {
                    embed.setDescription('API Error, Couldn\'t Process Date');
                });

            let games = resp
                ? resp.data.games
                : [];

            embed = new discord.MessageEmbed();
            embed.setTitle(`Games for ${date.format(user_date_format)}`);

            games.forEach((game) => {
                let name = '';
                let value = '';

                var hSeriesW = "";
                var vSeriesW = "";
                if (game.playoffs) {
                    hSeriesW = game.playoffs.hTeam.seriesWin;
                    vSeriesW = game.playoffs.vTeam.seriesWin;
                }

                var icon = game.statusNum === 3
                    ? game.hTeam.score > game.vTeam.score
                        ? "arrow_left"
                        : "arrow_right"
                    : "white_small_square";

                name = `${game.hTeam.triCode} - ${hSeriesW} \t:${icon}:\t ${vSeriesW} - ${game.vTeam.triCode} `;

                if (game.statusNum === 1) {
                    value = "`" + game.startTimeEastern + "`";
                }

                else if (game.statusNum === 2) {
                    value = `${game.hTeam.score} - ${game.vTeam.score}\t`;

                    if (game.period.isHalftime) { value += '\tHT'; }
                    else {
                        value += game.clock
                            ? `\`Q${game.period.current} ${game.clock}\``
                            : `\`End of Q${game.period.current}\``;
                    }
                }

                else if (game.statusNum === 3) {
                    value = `${game.hTeam.score} - ${game.vTeam.score}  ` + "`FINAL`";
                }

                embed.addField(name, value, false);
            });

            if (games.length === 0) {
                embed.setDescription('No games scheduled');
            }

            return embed;
        }

        embed.setDescription('Invalid Date');
        return embed;
    }
}