require('dotenv').config();

/**
 * Imports
 */
const nba = require('./nba')
const spotify = require('./spotify')
const discord = require('discord.js');

const client = new discord.Client();
const commands = ['help', 'new', 'nba', 'track', 'album']

var currentChannel = null;
client.once('ready', () => {
    console.log('client ready');
});

client.login(process.env.DISCORD_APP_TOKEN);

client.on('message', async (message) => {
    currentChannel = message.channel;

    if (ProcessMessage(message)) {
        let content = message.content;
        let command = RetrieveCommand(content);
        let arg = RetrieveArgument(content);

        console.log('\ncommand: ' + command);
        console.log('argument: ' + arg);

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
    let message;

    switch (command.toLowerCase()) {
        case 'nba':
            //message = await nba.GetGamesForDate(arg);
            message = 'This endpoint is off right now, Ill be back on when next season starts'
            break;
        case 'new':
            message = await spotify.GetArtistNewRelease(arg);
            break;
        case 'track':
            message = await spotify.GetItemByTitle(command, arg);
            break;
        case 'album':
            message = await spotify.GetItemByTitle(command, arg);
            break;
    }

    if (message) {
        currentChannel.send(message);
    }
}

function VerifySuccess(message) {
    if (Math.random() < 0.05) {
        message.reply(process.env.SUCCESS)
        .then(msg => {
            msg.delete({ timeout: 1250 });
        }).catch(e => console.log(e));
    }
}


