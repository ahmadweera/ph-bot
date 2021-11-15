require('dotenv').config();

/**
 * Imports
 */
const commands = require('./commands/commands');
const discord = require('discord.js');
const handler = require('./handler.js');

const client = new discord.Client();
const { Client } = require('pg');

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
    try {
        const response = await commands.GenerateResponse(interaction, emojis);
        client.api.interactions(interaction.id, interaction.token).callback.post(response);
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
}, 1250);
