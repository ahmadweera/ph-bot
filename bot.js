require('dotenv').config();

/**
 * Imports
 */
const discord = require('discord.js')
const commands = require('./commands/commands.js')
const handler = require('./handler.js');

const client = new discord.Client();
const { Client } = require('pg')

// create db
const db = new Client({
    connectionString: process.env.PGURI
});

var emojis;
var mediaChannel;
client.once('ready', async () => {
    await handler.Init(db);

    emojis = client.emojis;
    mediaChannel = client.channels.cache.get(process.env.MEDIA_CHANNEL);
    console.log('client ready.\n');
});

client.login(process.env.DISCORD_APP_TOKEN);
client.ws.on("INTERACTION_CREATE", async interaction => {
    const command = interaction.data.name;
    const argument = interaction.data.options
        ? interaction.data.options[0].value
        : null;

    let message = '';
    switch (interaction.data.name) {
        case 'new':
            message = await commands.GetNewRelease(argument);
            break;
        case 'track':
            message = await commands.GetItem(command, argument);
            break;
        case 'album':
            message = await commands.GetItem(command, argument);
            break;
        case 'nba':
            message = await commands.GetGames(argument, emojis);
            break;
        case 'futbol':
            message = await commands.GetMatches(argument, emojis);
            break;
    }

    let res = {
        data: {
            type: 4,
            data: {
                content: '',
                embeds: [],
                tts: false
            }
        }
    };

    try {
        if (typeof message === "string") { res.data.data.content = message; }
        else { res.data.data.embeds = [message]; }
        client.api.interactions(interaction.id, interaction.token).callback.post(res);
    } catch (error) {
        console.error(error.message);
    }
});

client.on('message', async (message) => {
    // todo something
});

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

setInterval(async () => {
    if (mediaChannel) {
        try {
            let res = await handler.CheckForNewRelease(db);
            for (const release of res) {
                mediaChannel.send(`${release.name} - ${release.artist_name}\n${release.url}`)
            }
        } catch (error) {
            console.error(error.message);
        }
    }
}, 30000);
