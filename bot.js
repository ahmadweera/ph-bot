require('dotenv').config();

/**
 * Imports
 */
const discord = require('discord.js');
const nba = require('./nba')
const spotify = require('./spotify')
const yt = require('./youtube.js');

const client = new discord.Client();
const commands = ['help', 'new', 'nba', 'track', 'album'];

var currentChannel = null;
client.once('ready', () => {
    console.log('client ready\n');
});

client.login(process.env.DISCORD_APP_TOKEN);

client.on('message', async (message) => {
    currentChannel = message.channel;

    if (ProcessMessage(message)) {
        let content = message.content;
        let command = RetrieveCommand(content);
        let arg = RetrieveArgument(content);

        console.log('user: ' + message.author.username);
        console.log('command: ' + command);
        console.log('argument: ' + arg + '\n');

        await RunCommand(command, arg);
        VerifySuccess(message);
    }
});

function ProcessMessage(message) {
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

function RetrieveCommand(content) {
    let ret = null;
    content = content.toLowerCase();
    let words = content.split(' ');

    if (content && words[0]) {
        ret = words[0];
    }

    return ret;
}

function RetrieveArgument(content) {
    let ret = null;
    content = content.trim();

    if (content && content.split(' ').length > 1) {
        ret = content.substr(content.indexOf(" ") + 1);
    }

    return ret;
}

async function RunCommand(command, arg) {
    let message = await GenerateMessage(command, arg);

    if (message) {
        currentChannel.send(message).then(async msg => {
            if (command === 'new') {
                await msg.pin();
                await ManagePins(currentChannel);
            }
        });
    }
}

async function GenerateMessage(command, arg) {
    switch (command.toLowerCase()) {
        case 'nba':
           return await nba.GetGamesForDate(arg);
        case 'new':
            return await spotify.GetArtistNewRelease(arg);
        case 'track':
            return await spotify.GetItemByTitle(command, arg);
        case 'album':
            return await spotify.GetItemByTitle(command, arg);
        case 'yt':
            return await yt.GetVideoByKeyword(arg);
    }
}

async function AddReactions(message, command) {
    switch (command.toLowerCase()) {
        case 'new':
            message.react('👍');
            message.react('👎');
            break;
    }
}

async function ManagePins(channel) {
    const limit = 3;
    let pinnedMap = await channel.messages.fetchPinned();
    let botPins = Array.from(pinnedMap.values()).filter(msg => msg.author.bot);

    if (botPins.length > limit ) {
        let messagesToUnpin = botPins.slice(limit, botPins.length);

        for (let index = 0; index < messagesToUnpin.length; index++) {
            await messagesToUnpin[index].unpin();
        }
    }
}

function VerifySuccess(message) {
    if (Math.random() < 0.05) {
        message.reply(process.env.SUCCESS)
            .then(msg => {
                console.log('Sucessfully Sent.')
                msg.delete({ timeout: 1250 });
            }).catch(e => console.log(e));
    }
}


