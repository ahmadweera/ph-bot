require('dotenv').config();
const discord = require('discord.js');
const client = new discord.Client();
const axios = require('axios');
const moment = require('moment-timezone');
const { performance } = require('perf_hooks');
const date_format = 'YYYY-MM-DD';

const Keys = {
    'DiscordAppToken': process.env.Discord_APP_TOKEN,
    'BotDevChannelId': process.env.BOT_DEV_CHANNEL_ID,
    'NbaApiUrl': 'https://api-nba-v1.p.rapidapi.com',
    'NbaApiKey': process.env.NBA_API_KEY,
    'SportsRadarApiUrl': 'http://api.sportradar.us/nba/trial/v7/en',
    'SportsRadarApiKey': process.env.SPORTS_RADAR_API_KEY
}

const APIHeaders = {
    'x-rapidapi-host': 'api-nba-v1.p.rapidapi.com',
    'x-rapidapi-key': Keys.NbaApiKey,
    'useQueryString': true
}

class SRReq {
    constructor(type, arg, endpoint) {
        this.method = 'GET'
        this.url = `${Keys.SportsRadarApiUrl}/${type}/${arg}/${endpoint}.json?api_key=${Keys.SportsRadarApiKey}`;
        this.endpoint = endpoint;
        this.arg = arg;
    }
}

class NBAReq {
    constructor(endpoint, arg) {
        this.method = 'GET'
        this.url = `${Keys.NbaApiUrl}/${endpoint}/${arg}`;
        this.headers = APIHeaders;
    }
}

var currentChannel = null;
client.once('ready', () => {
    console.log('client ready');
});

client.login(Keys.DiscordAppToken);

client.on('message', message => {
    currentChannel = message.channel;

    if (processMessage(message)) {
        console.log('command recieved');
        let content = message.content;
        let command = retrieveCommand(content);
        let arg = retrieveArgument(content);

        runCommand(command, arg);
    }
});


function processMessage(message) {
    content = message.content.toLowerCase();
    if (currentChannel && !message.author.bot && content.toLowerCase().startsWith('ph')) {
        return true;
    }

    return false;
}

function retrieveCommand(content) {
    let ret = null;

    content = content.toLowerCase();
    let words = content.split(' ');

    if (content && words[1]) {
        ret = words[1];
    }

    return ret;
}

function retrieveArgument(content) {
    let ret = null;

    if (content) {
        ret = content.split(' ').slice(2).join(' ');
    }

    return ret;
}

function runCommand(command, arg) {
    switch (command.toLowerCase()) {
        case 's':
            args = getRelativeDates(arg);
            getGamesForDate({ 'req1': new NBAReq('games/date', args.d1), 'req2': new NBAReq('games/date', args.d2), 'dates': args });
            break;
        case 'l':
            getLiveGames({ 'req': new NBAReq('games/live') });
            break;
    }
}

function isNullOrEmpty(str) {
    return (str === null || str === '');
}

function getRelativeDates(dateStr) {
    let d1 = isNullOrEmpty(dateStr) ? moment().format(date_format) : moment(dateStr).format(date_format);
    let d2 = moment(d1).add(1, 'days').format(date_format);

    return {
        'd1': d1,
        'd2': d2
    };
}

sendRequest = (req) => axios(req);

async function getGamesForDate(opts) {
    var t0 = performance.now();

    let embed = new discord.MessageEmbed();
    let trueDate = opts.dates.d1;

    // send requests 
    let resp1 = await sendRequest(opts.req1);
    let resp2 = await sendRequest(opts.req2);

    // combine request responses into single games array
    let games = resp1.data.api.games.concat(resp2.data.api.games);

    // remove games not actually played today
    games = games.filter(g => moment.utc(g.startTimeUTC).tz("America/Toronto").format(date_format) === trueDate);

    let date = trueDate === moment().format(date_format) ? 'Today' : trueDate;
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

    var t1 = performance.now();
    embed.setFooter(`${Math.round(t1 - t0)}ms`)
    currentChannel.send(embed);
}