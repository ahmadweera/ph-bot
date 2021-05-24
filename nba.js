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
     GetGamesForDate: async function (arg) {
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
 
                 if (game.statusNum === 1) {
                     name = `${game.hTeam.triCode} \t:white_small_square:\t ${game.vTeam.triCode} `;
                     value = "`" + game.startTimeEastern + "`";
                 }
 
                 else if (game.statusNum === 2) {
                     name = `${game.hTeam.triCode} \t:white_small_square:\t ${game.vTeam.triCode}`;
                     value = `${game.hTeam.score} - ${game.vTeam.score}\t`;
 
 
                     if (game.period.isHalftime) {
                         value += '\tHT';
                     }
                     else {
                         if (game.clock) {
                             value += `\`Q${game.period.current} ${game.clock}\``;
                         }
                         else {
                             value += `\`End of Q${game.period.current}\``;
                         }
                     }
                 }
 
                 else if (game.statusNum === 3) {
                     var icon = game.hTeam.score > game.vTeam.score
                        ? "arrow_left"
                        : "arrow_right";
                        
                     name = `${game.hTeam.triCode} \t:${icon}:\t ${game.vTeam.triCode}`;
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