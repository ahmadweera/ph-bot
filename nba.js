/**
 * Imports
 */
 const axios = require('axios');
 const moment = require('moment-timezone');
 const discord = require('discord.js');
 
 const date_format = 'YYYYMMDD';
 const user_date_format = 'MMM Do YYYY';
 
 class Request {
     constructor(arg) {
         this.method = 'GET';
         this.url = `http://data.nba.net/prod/v1/${arg}/scoreboard.json`;
     }
 }
 
 module.exports = {
     GetGamesForDate: async function (arg, emojis) {
         let embed = new discord.MessageEmbed();
         let date = arg
             ? moment(new Date(arg))
             : moment().tz("America/Toronto");
 
         if (date.isValid()) {
             const resp = await axios(new Request(date.format(date_format)))
                 .catch(async function (error) {
                     embed.setDescription('API Error, Couldn\'t Process Date');
                 });
 
             let games = resp
                 ? resp.data.games
                 : [];
 
             embed = new discord.MessageEmbed();
             embed.setTitle(`Games for ${date.format(user_date_format)}`);
 
             games.forEach((game) => {
                 let name = '';
                 let value = '';
 
                 const hlogo = emojis.cache.find(emoji => emoji.name === game.hTeam.triCode);
                 const vlogo = emojis.cache.find(emoji => emoji.name === game.vTeam.triCode);
                 const hseriesw = emojis.cache.find(emoji => emoji.name === game.playoffs.hTeam.seriesWin + "_");
                 const vseriesw = emojis.cache.find(emoji => emoji.name === game.playoffs.vTeam.seriesWin + "_");
                 const left = emojis.cache.find(emoji => emoji.name === "left");
                 const right = emojis.cache.find(emoji => emoji.name === "right");
                 const vs = emojis.cache.find(emoji => emoji.name === "vs");
 
                 let hteam = `<:${hlogo.name}:${hlogo.id}>`;
                 let vteam = `<:${vlogo.name}:${vlogo.id}>`;
                 if (game.playoffs) {
                     hteam = `${hteam} <:${hseriesw.name}:${hseriesw.id}>`;
                     vteam = `<:${vseriesw.name}:${vseriesw.id}> ${vteam}`;
                 }
 
                 const icon = game.statusNum === 3
                     ? game.hTeam.score > game.vTeam.score
                         ? `<:${left.name}:${left.id}>`
                         : `<:${right.name}:${right.id}>`
                     : `<:${vs.name}:${vs.id}>`;
 
                 name = `${hteam} \t${icon}\t ${vteam}`;
 
                 if (game.statusNum === 1) {
                     value = "`" + game.startTimeEastern + "`";
                 }
 
                 else if (game.statusNum === 2) {
                     value = `${game.hTeam.score} - ${game.vTeam.score}\t`;
 
                     if (game.period.isHalftime) { value += '\t\`HT\`'; }
                     else {
                         value += game.clock
                             ? `\`Q${game.period.current} ${game.clock}\``
                             : `\`End of Q${game.period.current}\``;
                     }
                 }
 
                 else if (game.statusNum === 3) {
                     value = `${game.hTeam.score} - ${game.vTeam.score}  ` + "`FINAL`";
                 }
 
                 embed.addField(name, value, false);
             });
 
             if (games.length === 0) {
                 embed.setDescription('No games scheduled');
             }
 
             return embed;
         }
 
         embed.setDescription('Invalid Date');
         return embed;
     }
 }