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
    const command = interaction.data.name;
    const argument = interaction.data.options
        ? interaction.data.options[0].value
        : null;

    let message = '';
    switch (interaction.data.name) {
        case 'nba':
            message = await nba.GetGamesForDate(argument);
            break;
        case 'new':
            message = await spotify.GetArtistNewRelease(argument);
            break;
        case 'track':
            message = await spotify.GetItemByTitle(command, argument);
            break;
        case 'album':
            message = await spotify.GetItemByTitle(command, argument);
            break;
    }

    let username = interaction.user
        ? interaction.user.username
        : interaction.member.user.username;

    console.log('user: ' + username);
    console.log('command: ' + interaction.data.name);
    console.log('argument: ' + argument + '\n');

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

    if (typeof message === "string") { res.data.data.content = message; }
    else { res.data.data.embeds = [message]; }
    client.api.interactions(interaction.id, interaction.token).callback.post(res);
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


