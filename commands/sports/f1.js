require('dotenv').config();

const Axios = require('axios');
const Moment = require('moment-timezone');
const Discord = require('discord.js');
const Helper = require('../../helper');

module.exports = {
    GetDriversStanding: async function (interaction) {
        let embed = new Discord.MessageEmbed();

        var options = {
            method: 'GET',
            url: 'https://api-formula-1.p.rapidapi.com/rankings/drivers',
            params: { season: '2021' },
            headers: {
                'x-rapidapi-host': 'api-formula-1.p.rapidapi.com',
                'x-rapidapi-key': process.env.RAPID_API_KEY
            }
        };

        const resp = await Axios.request(options);
        const drivers = resp.data.response;
        
        let season = drivers[0].season;
        embed.setTitle(`${season} Standings`);
        for (const driver of drivers) {
            let name = `#${driver.position} - ${driver.driver.name}`;

            if (driver.points) {
                name += ` (${driver.points})`
            }
            let value = `${driver.team.name}`;
            embed.addField(name, value, false);
        }

        return Helper.CreateResponseObject({
            interaction: interaction,
            embeds: [embed]
        });
    },
    GetTeamsStandings: async function (interaction) {
        let embed = new Discord.MessageEmbed();
        var request = {
            method: 'get',
            url: 'http://ergast.com/api/f1/current/constructorStandings.json'
        };

        let resp = await Axios(request);
        let seasonData = resp.data.MRData.StandingsTable.StandingsLists[0];
        embed.setTitle(`Constructors Round ${seasonData.round} (${seasonData.season})`);
        for (const cs of seasonData.ConstructorStandings) {
            const constructor = cs.Constructor;

            let name = `#${cs.position} - ${constructor.name}`;
            let value = `${cs.points} PTS, ${cs.wins} WINS`;
            embed.addField(name, value, false);
        }

        return Helper.CreateResponseObject({
            interaction: interaction,
            embeds: [embed]
        });
    },
    GetFullSchedule: async function (interaction) {
        let embed = new Discord.MessageEmbed();
        var request = {
            method: 'get',
            url: 'http://ergast.com/api/f1/current.json'
        };

        let resp = await Axios(request);
        let scheduleData = resp.data.MRData.RaceTable;

        embed.setTitle(`${scheduleData.season} F1 Schedule`);
        for (const race of scheduleData.Races) {
            let name = `Round ${race.round} - ${race.raceName}`;
            const raceDate = Moment(`${race.date}T${race.time}`).tz("America/Toronto").format('MMM D h:mma');
            embed.addField(name, raceDate, false);
        }

        return Helper.CreateResponseObject({
            interaction: interaction,
            embeds: [embed]
        });
    },
    GetUpcomingSchedule: async function (interaction) {
        let embed = new Discord.MessageEmbed();
        var request = {
            method: 'get',
            url: 'http://ergast.com/api/f1/current.json'
        };

        let resp = await Axios(request);
        let race = GetClosestRace(resp.data.MRData.RaceTable.Races);

        embed.setTitle('Next Race');

        const raceDate = Moment(`${race.date}T${race.time}`).tz("America/Toronto").format('MMM D h:mma');
        embed.setDescription(`${race.raceName} ${raceDate}`);

        return Helper.CreateResponseObject({
            interaction: interaction,
            embeds: [embed]
        });
    }
}

function GetClosestRace(races) {
    const date = Moment();
    for (const race of races) {
        let raceDate = Moment(race.date);
        if (raceDate > date) {
            return race
        }
    }
}