require('dotenv').config();

const main = require('./main')
const nba = require('./nba')
const spotify = require('./spotify')

const discord = require('discord.js');
const client = new discord.Client();

const Keys = {
    'DiscordAppToken': process.env.Discord_APP_TOKEN,
    'BotDevChannelId': process.env.BOT_DEV_CHANNEL_ID,
}

var currentChannel = null;
client.once('ready', () => {
    console.log('client ready');
});

client.login(Keys.DiscordAppToken);

client.on('message', message => {
    currentChannel = message.channel;

    if (processMessage(message)) {
        let content = message.content;
        let command = retrieveCommand(content);
        let arg = retrieveArgument(content);

        console.log('\ncommand: ' + command);
        console.log('argument: ' + arg);

        runCommand(command, arg);
    }
});

function processMessage(message) {
    const commands = ['nba', 'new', 'search'];
    content = message.content.toLowerCase();
    if (currentChannel && !message.author.bot) {
        for (let i = 0; i <= commands.length; i++) {
            let command = commands[i];
            if (content.startsWith(command)) {
                return true;
            }
        }

        return false;
    }

    return false;
}

function retrieveCommand(content) {
    let ret = null;
    content = content.toLowerCase();
    let words = content.split(' ');

    if (content && words[0]) {
        ret = words[0];
    }

    return ret;
}

function retrieveArgument(content) {
    let ret = null;
    content = content.trim();

    if (content && content.split(' ').length > 1) {
        ret = content.substr(content.indexOf(" ") + 1);
    }

    return ret;
}

async function runCommand(command, arg) {
    let message;

    switch (command.toLowerCase()) {
        case 'nba':
            //message = await nba.getGamesForDate(arg);
            message = 'This endpoint is off right now, Ill be back on when next season starts'
            break;
        case 'new':
            message = await spotify.GetArtistNewRelease(arg);
            break;
        case 'search':
            //message = await spotify.SearchMusic(arg);
            break;
    }

    if (message) {
        currentChannel.send(message);
    }
}
