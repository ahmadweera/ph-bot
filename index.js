require('dotenv').config();
const Discord = require('discord.js');
const Client = new Discord.Client();
const Axios = require('axios');

const Keys = {
    'DiscordAppToken': process.env.DISCORD_APP_TOKEN,
    'RapidApiKey': process.env.RAPID_API_KEY,
    'BotDevChannelId': process.env.BOT_DEV_CHANNEL_ID,
    'NbaApiUrl': 'https://api-nba-v1.p.rapidapi.com/'
}

const APIHeaders = {
    'x-rapidapi-host': 'api-nba-v1.p.rapidapi.com',
    'x-rapidapi-key': Keys.RapidApiKey,
    'useQueryString': true
}

class APIReq {
    constructor(endpoint, arg) {
        this.method = 'GET'
        this.url = Keys.NbaApiUrl + endpoint + arg;
        this.headers = APIHeaders;
    }
}

var currentChannel = null;

Client.once('ready', () => {
    console.log('client ready');
});

Client.login(Keys.DiscordAppToken);

Client.on('message', message => {
    currentChannel = message.channel;

    if (processMessage(message)) {
        let content = message.content;
        let command = retrieveCommand(content);
        let arg = retrieveArgument(content);

        runCommand(command, arg);
    }

    let lower = message.content.toLowerCase();

    if (lower.includes('blocked')) {
        channel.send('https://tenor.com/view/monkey-locomonkey-gif-16038015');
    } else if (lower === 'bet') {
        channel.send('https://tenor.com/view/bet-button-press-gif-12337917');
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
            let date = arg ? arg : getCurrentDate();
            let today = (date === getCurrentDate());
            let req = new APIReq('games/date/', date);
            getGamesForDate(req, date, today);
            break;
        case 'l':
            break;
    }
}

async function getGamesForDate(req, date, today) {
    let embed = new Discord.MessageEmbed();

    if (today) {
        embed.setTitle(`Games on today (${date})`);
    } else {
        embed.setTitle(`Games on ${date}`);
    }

    await Axios(req)
        .then((response) => {
            let games = response.data.api.games;

            games.forEach((game) => {
                let quarter = `Q${game.currentPeriod[0]}`;
                let time = new Date(game.startTimeUTC).toLocaleTimeString();
                let name = `${game.vTeam.fullName} @ ${game.hTeam.fullName}`;
                let value = '';

                if (game.statusShortGame === '1') {
                    value += "`" + time + "`";
                }
                if (game.statusShortGame === '2') {
                    value += `${game.hTeam.score.points} - ${game.vTeam.score.points} ` + "`" + quarter + "|" + game.clock + "`";
                }
                if (game.statusShortGame === '3') {
                    value += `${game.hTeam.score.points} - ${game.vTeam.score.points} ` + "`FINAL`";
                }

                embed.addField(name, value, false);
            });

        }).catch((error) => {
            console.log(error)
        });

    currentChannel.send(embed);
}

function getCurrentDate() {
    let date = new Date();
    let dd = date.getDate();
    let mm = date.getMonth() + 1;
    let yyyy = date.getFullYear();

    dd = dd > 10 ? dd : `0${dd}`;
    mm = mm > 10 ? mm : `0${mm}`;

    date = `${yyyy}-${mm}-${dd}`;
    return date;
}

function checkForCommand(message) {
    let content = message.content;
    content = content.toLowerCase();
    return content.startsWith('ph');
}

function getCommand(content) {
    let arr = content.split(' ');
    return arr[1];
}

