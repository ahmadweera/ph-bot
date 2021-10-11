/**
 * Imports
 */
const Axios = require('axios');
const Moment = require('moment-timezone');
const Discord = require('discord.js');
const Helper = require('../../helper');

const date_format = 'YYYYMMDD';
const user_date_format = 'MMM Do YYYY';

class Request {
    constructor(arg) {
        this.method = 'GET';
        this.url = `http://data.nba.net/prod/v1/${arg}/scoreboard.json`;
    }
}

module.exports = {
    GetGames: async function (interaction, emojis) {
        let arg = Helper.GetInteractionArgs(interaction);
        let embed = new Discord.MessageEmbed();

        let date = arg
            ? Moment(arg)
            : Moment().tz("America/Toronto");

        if (date.isValid()) {
            const resp = await Axios(new Request(date.format(date_format)))
                .catch(async function (error) {
                    embed.setDescription('API Error, Couldn\'t Process Date');
                });

            let games = resp
                ? resp.data.games
                : [];

            embed = new Discord.MessageEmbed();
            embed.setTitle(`Games for ${date.format(user_date_format)}`);

            games.forEach((game) => {
                let name = '';
                let value = '';

                const hlogo = emojis.cache.find(emoji => emoji.name === game.hTeam.triCode);
                const vlogo = emojis.cache.find(emoji => emoji.name === game.vTeam.triCode);
                const left = emojis.cache.find(emoji => emoji.name === "left");
                const right = emojis.cache.find(emoji => emoji.name === "right");
                const vs = emojis.cache.find(emoji => emoji.name === "vs");

                let hteam = `<:${hlogo.name}:${hlogo.id}>`;
                let vteam = `<:${vlogo.name}:${vlogo.id}>`;
                if (game.playoffs) {
                    hteam = `${hteam}`;
                    vteam = `${vteam}`;
                }

                const icon = game.statusNum === 3
                    ? game.hTeam.score > game.vTeam.score
                        ? `<:${left.name}:${left.id}>`
                        : `<:${right.name}:${right.id}>`
                    : `<:${vs.name}:${vs.id}>`;

                if (!game.hTeam.score) {
                    game.hTeam.score = " -";
                }

                if (!game.vTeam.score) {
                    game.vTeam.score = "- ";
                }

                let summary = game.playoffs 
                ? ` (${game.playoffs.seriesSummaryText})`
                : '';

                name = `${hteam}\t${game.hTeam.score}\t\t${icon}\t\t${game.vTeam.score}\t${vteam}`;

                if (game.statusNum === 1) {
                    value = "`" + game.startTimeEastern + summary + "`";
                }

                else if (game.statusNum === 2) {
                    value = game.period.isHalftime
                        ? '\t\`HT\`'
                        : game.clock
                            ? `\`Q${game.period.current} ${game.clock} ${summary}\``
                            : `\`End of Q${game.period.current} ${summary}\``;
                }

                else if (game.statusNum === 3) {
                    value = `\`FINAL\``;
                    if (summary) {
                        value += `${summary}\``
                    }
                }

                embed.addField(name, value, false);
            });

            if (games.length === 0) {
                embed.setDescription('No games scheduled');
            }
        } else {
            embed.setDescription('Invalid Date');
        }

        let today = date.format('YYYY-MM-DD');
        let yesterday = Moment(date, date_format).subtract(1, 'days').format('YYYY-MM-DD');
        let tommorow = Moment(date, date_format).add(1, 'days').format('YYYY-MM-DD')
        let components = [
            Helper.AddRefreshComponent(today),
            {
                type: 2,
                emoji: {
                    name: "left",
                    id: "846394816601522226"
                },
                style: 2,
                custom_id: yesterday,
            },
            {
                type: 2,
                emoji: {
                    name: "right",
                    id: "846394816706773022"
                },
                style: 2,
                custom_id: tommorow,
            }
        ];

        return Helper.CreateResponseObject({
            interaction: interaction,
            embeds: [embed],
            components: components
        });
    }
}