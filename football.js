require('dotenv').config();

const axios = require('axios');
const moment = require('moment-timezone');
const discord = require('discord.js');

const date_format = 'YYYY-MM-DD';
const user_date_format = 'MMM Do YYYY';

module.exports = {
    GetScores: async function (arg, emojis) {
        let embed = new discord.MessageEmbed();
        let date = arg
            ? moment(new Date(arg))
            : moment().tz("America/Toronto");

        if (date.isValid()) {
            embed.setTitle(`Matches for ${date.format(user_date_format)}`);

            const req = {
                method: 'GET',
                url: 'https://api-football-v1.p.rapidapi.com/v3/fixtures',
                params: { league: '4', date: date.format(date_format),  league: 4, season: '2020' },
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

            matches.forEach(match => {
                let gameStatus = match.fixture.status;
                let homeTeam = match.teams.home;
                let awayTeam = match.teams.away;
                const hlogo = emojis.cache.find(emoji => emoji.name == homeTeam.name.replace(/ /g, ''));
                const vlogo = emojis.cache.find(emoji => emoji.name == awayTeam.name.replace(/ /g, ''));

                let name = "";
                let value = "";
                if (gameStatus.short == 'NS') {
                    name = `${hlogo} ${homeTeam.name}\tvs\t${awayTeam.name} ${vlogo}`;
                    value = "`" + gameStatus.long + "`";
                }
                else if (gameStatus.short == 'FT') {
                    name = `${hlogo} ${homeTeam.name}\t${match.goals.home}\tvs\t ${match.goals.away}\t${awayTeam.name} ${vlogo}`;
                    value = "`" + gameStatus.long + "`";
                }
                else {
                    name = `${hlogo} ${homeTeam.name}\t${match.goals.home}\tvs\t ${match.goals.away}\t${awayTeam.name} ${vlogo}`;
                    value = "`" + gameStatus.elapsed;
                }

                embed.addField(name, value, false);
            });
        }

        return embed;
    }
}
