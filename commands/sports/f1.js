require('dotenv').config();

const axios = require('axios');
const moment = require('moment-timezone');
const discord = require('discord.js');

module.exports = {
    GetDriversStanding: async function (season) {
        let embed = new discord.MessageEmbed();
        var request = {
            method: 'get',
            url: 'http://ergast.com/api/f1/current/driverStandings.json'
        };

        let resp = await axios(request);
        let seasonData = resp.data.MRData.StandingsTable.StandingsLists[0];

        embed.setTitle(`${seasonData.season} Standings - Rd. ${seasonData.round}`);
        for (const ds of seasonData.DriverStandings) {
            const driver = ds.Driver;
            let name = `#${ds.position} - ${driver.givenName} ${driver.familyName}`;
            let constructors = ds.Constructors

            value = constructors.length > 1
                ? constructors.map(d => d.name).join(', ')
                : constructors[0].name;

            embed.addField(name, value, false);
        }

        return embed;
    },
    GetTeamsStandings: async function (season) {
        let embed = new discord.MessageEmbed();
        var request = {
            method: 'get',
            url: 'http://ergast.com/api/f1/current/constructorStandings.json'
        };

        let resp = await axios(request);
        let seasonData = resp.data.MRData.StandingsTable.StandingsLists[0];
        embed.setTitle(`Constructors Round ${seasonData.round} (${seasonData.season})`);
        for (const cs of seasonData.ConstructorStandings) {
            const constructor = cs.Constructor;

            let name = `#${cs.position} - ${constructor.name}`;
            let value = `${cs.points} PTS, ${cs.wins} WINS`;
            embed.addField(name, value, false);
        }

        return embed;
    },
    GetFullSchedule: async function () {
        let embed = new discord.MessageEmbed();
        var request = {
            method: 'get',
            url: 'http://ergast.com/api/f1/current.json'
        };

        let resp = await axios(request);
        let scheduleData = resp.data.MRData.RaceTable;

        embed.setTitle(`${scheduleData.season} F1 Schedule`);
        for (const race of scheduleData.Races) {
            let name = `Round ${race.round} - ${race.raceName}`;
            const raceDate = moment(`${race.date}T${race.time}`).format('MMM D h:mma');
            embed.addField(name, raceDate, false);
        }

        return embed;
    },
    GetUpcomingSchedule: async function () {
        let embed = new discord.MessageEmbed();
        var request = {
            method: 'get',
            url: 'http://ergast.com/api/f1/current.json'
        };

        let resp = await axios(request);
        let race = GetClosestRace(resp.data.MRData.RaceTable.Races);

        embed.setTitle('Next Race');

        const raceDate = moment(`${race.date}T${race.time}`).format('MMM D h:mma');
        embed.setDescription(`${race.raceName} ${raceDate}`);

        return embed;
    }
}

function GetClosestRace(races) {
    const date = moment();
    for (const race of races) {
        let raceDate = moment(race.date);
        if (raceDate > date) {
            return race
        }
    }
}