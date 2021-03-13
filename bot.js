require('dotenv').config();

/**
 * Imports
 */
const discord = require('discord.js');
const nba = require('./nba')
const spotify = require('./spotify')

const client = new discord.Client();

client.once('ready', () => {
    console.log('client ready\n');
});

client.login(process.env.DISCORD_APP_TOKEN);

client.ws.on("INTERACTION_CREATE", async interaction => {
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

    console.log('user: ' + interaction.member.user.username);
    console.log('command: ' + interaction.data.name);
    console.log('argument: ' + option.value + '\n');

    client.api.interactions(interaction.id, interaction.token).callback.post({ 
        data: { 
            type: 4, 
            data: {
                tts: false,
                content: `<@${interaction.member.user.id}> **${interaction.data.name}** ${message}`
            }
        } 
    });
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

function VerifySuccess(message) {
    if (Math.random() < 0.02) {
        message.reply(process.env.SUCCESS)
            .then(msg => {
                console.log('Sucessfully Sent.')
                msg.delete({ timeout: 1250 });
            }).catch(e => console.log(e));
    }
}


