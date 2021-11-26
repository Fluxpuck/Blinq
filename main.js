/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License  
    Blinq is a Discord bot, running on the DiscordJS Library and the Discord Gateway (API).
    Contact info@fluxpuck.com for any information   */

console.log(`
...........................................
...........................................
...██████..██......██.███....██..██████....
...██...██.██......██.████...██.██....██...
...██████..██......██.██.██..██.██....██...
...██...██.██......██.██..██.██.██.▄▄.██...
...██████..███████.██.██...████..██████....
....................................▀▀.....
...........................................
`)

//require packages
require("dotenv").config();
var cron = require('node-cron');

//setup DiscordJS Client
const { Client, Collection, Intents } = require('discord.js');
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS],
    ws: { properties: { $browser: 'Discord Android' } }
});

//set Client dependencies 
client.commands = new Collection();
client.dependencies = require('./package.json').dependencies
client.version = require('./package.json').version

//listen to Client events
const events = require('./utils/EventManager');
events.run(client);

//setup database connection
const database = require('./config/database');

//require utilities
const { getGuildPrefix } = require('./utils/GuildManager');
const { getRoles, collectAllMessages } = require('./utils/Resolver');
const { getLoggingChannel, getStatsRoles, getStatsMembers, getStatChannels, filterMessages } = require('./utils/StatsManager');

/** UserStats Module */
cron.schedule('0 1 * * *', () => {
    //for each guild, track member data
    Array.from(client.guilds.cache.values()).forEach(async guild => {

        await guild.members.fetch({ force: true }) //fetch members forcefully

        //collect the members from specified role(s)
        const roles = await getStatsRoles(guild); //get all roleIDs from Database
        const rolesInfo = await getRoles(guild, roles, 'all'); //get all role information
        if (rolesInfo === false) return; //if there are no roles to track, stop and return
        const members = await getStatsMembers(guild, rolesInfo); //get all members from Roles

        //collect channels
        const channels = await getStatChannels(guild); //get all text-channels and (active) threads

        //check for loggingChannel & start logging process
        let loggingChannel, counter = 1 //setup loggingChannel and initiate counter
        const loggingChannelData = await getLoggingChannel(guild); //get logging channelId's
        if (loggingChannelData != false) loggingChannel = await guild.channels.cache.get(loggingChannelData[0]);
        if (loggingChannel) loggingChannel.send(`*Start collecting messages from channels... (${counter}/${channels.length})*`);

        //setup the message collection & userStatsMap
        let perChannelCollection = new Collection; //collection with ALL messages per channel

        //collect messages from each channel (within 24 hrs)
        for (let i = 0; i < channels.length; i++) {

            counter++ //update counter (+1) and update logging message
            if (counter <= channels.length && loggingChannel) { await loggingChannel.edit(`*Collecting messages from __${channels[i].name}__... (${counter}/${channels.length})*`) }

            //collect all messages within 24 hours from channel
            const channelMsgCollection = await collectAllMessages(channels[i]);
            perChannelCollection.set(channels[i], channelMsgCollection);

        };

        //update logging message
        if (loggingChannel) { await loggingChannel.edit(`*Finished collecting messages... (${counter}/${channels.length})*`) }

        //process messages per channel, per member
        for (let i = 0; i < members.length; i++) {
            //filter all messages per channel, per member
            let memberMessages = await filterMessages(perChannelCollection, members[i]);

            //setup total count values
            let total_messages = 0
            let unique_messages = 0

            //go over all channels and calculate message count
            for (const [key, value] of memberMessages.entries()) {
                var collection01 = value //member message collection
                var collection02 = await [...new Set(value.map(message => time(new Date(message.createdTimestamp))))];

                //add to total
                total_messages += collection01.size
                unique_messages += collection02.length

                /**
                 * Saving per Channel statistics to Database
                 */
                let insert = { "user_id": members[i].user.id, "user_name": members[i].user.username, "channel_id": key.id, "channel_name": key.name, "total_messages": collection01.size, "uniq_messages": collection02.length }
                await database.query(`INSERT INTO ${guild.id}_perchannelstats set ?`, insert, function (err, result) {
                    if (err) return console.log(err)
                });

            }

            /**
             * Saving User statistics to Database
             */
            let insert = { "user_id": members[i].user.id, "user_name": members[i].user.username, "total_messages": total_messages, "uniq_messages": unique_messages }
            await database.query(`INSERT INTO ${guild.id}_userstats set ?`, insert, function (err, result) {
                if (err) return console.log(err)
            });

            console.log(insert) //log the insertion

        }

        //finish logging message
        if (loggingChannel) { await loggingChannel.edit(`*Finished! Saved all statistics to Database*`) }

    })

}, {
    scheduled: true,
    timezone: "Europe/Amsterdam"
});

//keep the connection alive!
setInterval(async () => {
    Array.from(client.guilds.cache.values()).forEach(async guild => {
        const prefix = await getGuildPrefix(guild);
    })
    const state = database.state
}, 5 * 60 * 1000)

//connect to Discord gateway
client.login(process.env.TOKEN);