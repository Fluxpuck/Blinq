/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License  
    Hyper is a comprehensive Discord moderation bot, developed for private use.
    Developed on Discord.js v13.3.1 and Discord Rest API v9 */

//get credentials through dot envoirement
require('dotenv').config({ path: './config/.env' });
var cron = require('node-cron');

//get Intents BitField from config
const { INTENTS_BITFIELD } = require('./config/Intents');

//setup DiscordJS Client
const { Client, Collection } = require('discord.js');
const client = new Client({
    intents: INTENTS_BITFIELD,
    ws: { properties: { $browser: 'Discord Android' } }
});

//set Client information 
client.commands = new Collection();
client.events = new Collection();
client.dependencies = require('./package.json').dependencies
client.version = require('./package.json').version

//listen to Client events
const events = require('./utils/EventManager');
events.run(client); //run the events

//save user statistics to database, every day
cron.schedule('0 0 1 * * *', () => {
    const guilds = Array.from(client.guilds.cache.values())
    for (let guild of guilds) {
        client.emit('messageLogging', guild)
    }
})

//client login to discord
client.login(process.env.TOKEN);