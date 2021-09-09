//construct packages
const { Collection } = require('discord.js');

//require utilities
const { getRoles, collectAllMessages } = require('../../utils/Resolver');
const { getLoggingChannel, getStatsRoles, getStatsMembers, getStatChannels, filterMessages } = require('../../utils/StatsManager');
const { time } = require('../../utils/functions');

//setup database connection
const database = require('../../config/database');

/*------------------------------*/

//construct the command and export
module.exports.run = async (client, message, arguments, prefix, permissions) => {

    //collect the members from specified role(s)
    const roles = await getStatsRoles(message.guild); //get all roleIDs from Database
    const rolesInfo = await getRoles(message.guild, roles, 'all'); //get all role information
    if (rolesInfo === false) return; //if there are no roles to track, stop and return
    const members = await getStatsMembers(message.guild, rolesInfo); //get all members from Roles

    //collect channels
    const channels = await getStatChannels(message.guild); //get all text-channels and (active) threads

    //setup the message collection & userStatsMap
    let perChannelCollection = new Collection; //collection with ALL messages per channel

    //collect messages from each channel (within 24 hrs)
    for (let i = 0; i < channels.length; i++) {
        //collect all messages within 24 hours from channel
        const channelMsgCollection = await collectAllMessages(channels[i])
        perChannelCollection.set(channels[i], channelMsgCollection)
    };

    //process messages per channel, per member
    for (let i = 0; i < members.length; i++) {
        //filter all messages per channel, per member
        let memberMessages = await filterMessages(perChannelCollection, members[i])

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
            await database.query(`INSERT INTO ${message.guild.id}_perchannelstats set ?`, insert, function (err, result) {
                if (err) return console.log(err)
            });

        }

        /**
         * Saving User statistics to Database
         */
        let insert = { "user_id": members[i].user.id, "user_name": members[i].user.username, "total_messages": total_messages, "uniq_messages": unique_messages }
        await database.query(`INSERT INTO ${message.guild.id}_userstats set ?`, insert, function (err, result) {
            if (err) return console.log(err)
        });

        console.log(insert) //log the insertion

    }
}


//command information
module.exports.info = {
    name: 'logging',
    category: '',
    alias: [],
    usage: '[prefix]logging',
    desc: 'Forcefully starts logging statistics',
}

//command permission groups
module.exports.permissions = [
    "ADMINISTRATOR"
]