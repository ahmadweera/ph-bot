require('dotenv').config();

const axios = require('axios');
const moment = require('moment-timezone');
const discord = require('discord.js');

const date_format = 'YYYY-MM-DD';
const user_date_format = 'MMM Do YYYY';

module.exports = {
    GetMatches: async function (arg, emojis) {
        let embed = new discord.MessageEmbed();
        let date = arg
            ? moment(new Date(arg))
            : moment().tz("America/Toronto");

        if (date.isValid()) {
            date = moment(date).utc();
            embed.setTitle(`Matches for ${date.format(user_date_format)}`);

            const req = {
                method: 'GET',
                url: 'https://api-football-v1.p.rapidapi.com/v3/fixtures',
                params: { league: '4', date: date.format(date_format), league: 4, season: '2020' },
                headers: {
                    'x-rapidapi-key': process.env.RAPID_API_KEY,
                    'x-rapidapi-host': 'api-football-v1.p.rapidapi.com'
                }
            };

            const resp = await axios(req).catch(async function (error) {
                embed.setDescription('API Error, Couldn\'t Process Date');
            });

            let matches = resp.data.results > 0
                ? resp.data.response
                : [];

            if (matches.length) {
                matches.forEach(match => {
                    const gameStatus = match.fixture.status;
                    const homeTeam = match.teams.home;
                    const awayTeam = match.teams.away;
                    const hlogo = emojis.cache.find(emoji => emoji.name == homeTeam.name.replace(/ /g, ''));
                    const vlogo = emojis.cache.find(emoji => emoji.name == awayTeam.name.replace(/ /g, ''));
                    const left = emojis.cache.find(emoji => emoji.name === "left");
                    const right = emojis.cache.find(emoji => emoji.name === "right");
                    const gametime = moment(match.fixture.date).tz("America/Toronto").format('h:mma');

                    const directionIcon = match.teams.home.winner
                        ? `<:${left.name}:${left.id}>`
                        : `<:${right.name}:${right.id}>`;

                    let name = "";
                    let value = "";
                    if (gameStatus.short == 'NS') {
                        name = `${hlogo} ${homeTeam.name} vs ${awayTeam.name} ${vlogo}`;
                        value = "`" + gametime + "`";
                    }
                    else if (gameStatus.short == 'FT' || gameStatus.short == 'AET') {
                        name = `${hlogo} ${homeTeam.name}\t${match.goals.home}\t${directionIcon}\t${match.goals.away}\t${awayTeam.name} ${vlogo}`;
                        value = "`" + gameStatus.short + "`";
                    }
                    else if (gameStatus.short == 'PEN') {
                        name = `${hlogo} ${homeTeam.name}\t${match.goals.home} _(+${match.score.penalty.home})_\t${directionIcon}\t${match.goals.away} _(+${match.score.penalty.away})_ \t${awayTeam.name} ${vlogo}`;
                        value = "`" + gameStatus.short + "`";
                    }
                    else {
                        name = `${hlogo} ${homeTeam.name}\t${match.goals.home}\tvs\t${match.goals.away}\t${awayTeam.name} ${vlogo}`;
                        value = "`" + gameStatus.elapsed + "'`";
                    }

                    embed.addField(name, value, false);
                });
            } else {
                embed.setDescription('No matches scheduled.')
            }
        }
        return embed;
    }
}
