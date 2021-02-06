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

client.once('ready', () => {
    console.log('client ready\n');
});

client.login(process.env.DISCORD_APP_TOKEN);

client.ws.on("INTERACTION_CREATE", async interaction => {
    const channel = client.channels.cache.get(interaction.channel_id);
    const option = interaction.data.options[0];

    let message = "";
    switch (interaction.data.name) {
        case 'nba':
            message = await nba.GetGamesForDate(option.value);
            break;
        case 'new':
            message = await spotify.GetArtistNewRelease(option.value);
            break;
        case 'track':
            message = await spotify.GetItemByTitle(interaction.data.name, option.value);
            break;
        case 'album':
            message = await spotify.GetItemByTitle(interaction.data.name, option.value);
            break;
    }

    channel.send(`${interaction.data.name}: ${option.value}\n${message}`)
        .catch(console.error);
});

client.on('message', async (message) => {
    if (ProcessMessage(message)) {
        let content = message.content;
        let command = RetrieveCommand(content);
        let arg = RetrieveArgument(content);

        console.log('user: ' + message.author.username);
        console.log('command: ' + command);
        console.log('argument: ' + arg + '\n');

        await RunCommand(command, arg, message.channel);
        VerifySuccess(message);
    }
});

function ProcessMessage(message) {
    content = message.content.toLowerCase();
    if (!message.author.bot) {
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

async function RunCommand(command, arg, channel) {
    let message = await GenerateMessage(command, arg);

    if (message) {
        switch (command.toLowerCase()) {
            case 'nba':
                await channel.send(message, { files: ['screenshots/scores.png'] });
                break;
            case 'new':
                await channel.send(message).then(async msg => {
                    await msg.pin();
                    await ManagePins(channel);
                });
                break;
            default:
                await channel.send(message);
                break;
        }
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

    if (botPins.length > limit) {
        let messagesToUnpin = botPins.slice(limit, botPins.length);

        for (let index = 0; index < messagesToUnpin.length; index++) {
            await messagesToUnpin[index].unpin();
        }
    }
}

function VerifySuccess(message) {
    if (Math.random() < 0.02) {
        message.reply(process.env.SUCCESS)
            .then(msg => {
                console.log('Sucessfully Sent.')
                msg.delete({ timeout: 1250 });
            }).catch(e => console.log(e));
    }
}


