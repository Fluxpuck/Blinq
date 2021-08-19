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
const { getRoles, userStats } = require('./utils/Resolver');
const { getStatsRoles, getStatsMembers, getGuildPrefix } = require('./utils/GuildManager');
const { millisecondsUntilMidnight } = require('./utils/functions');

/** UserStats Module
 */ let timer = millisecondsUntilMidnight()
setTimeout(async function run() {
    // Fetch and write userStats for each guild
    let promise = new Promise((resolve, reject) => {
        //for each guild, track member data
        Array.from(client.guilds.cache.values()).forEach(async guild => {

            await guild.members.fetch({ force: true }) //fetch members forcefully
            await guild.channels.fetch() //fetch all channels 

            const roles = await getStatsRoles(guild); //get all roleIDs from Database
            const rolesInfo = await getRoles(guild, roles, 'all'); //get all role information
            const members = await getStatsMembers(guild, rolesInfo); //get all members from Roles
            const channels = textchannels.filter(channel => channel.type == 'GUILD_TEXT').map(channel => channel)
            const threads = threadchannels.threads.filter(channel => channel.deleted == false).map(channel => channel)

            const channelcollection = channels.concat(threads)

            //log the userStats for each member 
            //throughout each guild text-channel
            let count = 0
            members.forEach(async function (member) {
                let total_messages = 0
                let uniq_messages = 0

                for (let i = 0; i < channelcollection.length; i++) {
                    const UserStats = await userStats(channelcollection[i], member)
                    total_messages += UserStats[0]
                    uniq_messages += UserStats[1]
                };

                //write userStats forEach user to Database
                let insert = { "user_id": member.user.id, "user_name": member.user.username, "total_messages": total_messages, "uniq_messages": uniq_messages }
                // insert into the database
                database.query(`INSERT INTO ${guild.id}_userstats set ?`, insert, function (err, result) {
                    if (err) return console.log(err)
                });

                console.log(insert) //log the insertation

                count++ //foreach add to count and if count match length, resolve the promise
                if (members.length === count) resolve(true);

            });
        })
    }).then(function (resolve) {
        return resolve
    })

    //await the promise
    await promise;

    //reset the ms-to-midnight (next day)
    timer = millisecondsUntilMidnight()
    setTimeout(run, timer);
}, timer);

//keep the connection alive!
setInterval(async () => {
    Array.from(client.guilds.cache.values()).forEach(async guild => {
        const prefix = await getGuildPrefix(guild);
    })
    const state = database.state
}, 5 * 60 * 1000)

//connect to Discord gateway
client.login(process.env.TOKEN);