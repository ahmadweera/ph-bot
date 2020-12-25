require('dotenv').config();

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
    GetGamesForDate: async function (arg, emojis) {
        let embed = new discord.MessageEmbed();
        let date = arg
            ? moment(new Date(arg))
            : moment().tz("America/Toronto");

        if (date.isValid()) {
            const resp = await axios(new Request(date.format(date_format)))
                .catch(async function (error) {
                    console.log('API Error, Couldnt Process Date');
                });

            let games = resp
                ? resp.data.games
                : [];

            embed = new discord.MessageEmbed();
            embed.setTitle(`Games for ${date.format(user_date_format)}`);

            games.forEach((game) => {
                let name = '';
                let value = '';

                let hTeamLogo = GetEmojiIdByName(game.hTeam.triCode, emojis);
                let vTeamLogo = GetEmojiIdByName(game.vTeam.triCode, emojis);

                if (game.statusNum === 1) {
                    name = `${game.hTeam.triCode} ${hTeamLogo}\t:white_small_square:\t${vTeamLogo} ${game.vTeam.triCode} `;
                    value = "`" + game.startTimeEastern + "`";
                }

                else if (game.statusNum === 2) {
                    name = `${game.hTeam.triCode} ${hTeamLogo}\t:white_small_square:\t${vTeamLogo} ${game.vTeam.triCode}`;
                    value = `${game.hTeam.score} - ${game.vTeam.score}\t`;


                    if (game.period.isHalftime) {
                        value += '\tHT';
                    }
                    else {
                        if (game.clock) {
                            value += `\`Q${game.period.current} ${game.clock}\``;
                        }
                        else {
                            value += `\`End of Q${game.period.current}\``;
                        }
                    }
                }

                else if (game.statusNum === 3) {
                    name = `${game.hTeam.triCode} ${hTeamLogo}\t:white_small_square:\t${vTeamLogo} ${game.vTeam.triCode}`;
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

function GetEmojiIdByName(name, emojis) {
    return emojis.cache.find(emoji => emoji.name == name.toLowerCase());
}
