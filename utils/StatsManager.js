//construct packages
const { Collection } = require('discord.js');
//setup database connection
const database = require('../config/database');

/*------------------------------*/

/**
 * 
 * @param {*} guild 
 * @returns 
 */
const getStatsRoles = async (guild) => {
    return new Promise(async function (resolve) {
        const query = (`SELECT * FROM guild_settings WHERE guild_id = "${guild.id}"`)
        database.query(query, async function (err, result) { resolve(result) })
    }).then(async function (result) {
        //return if no guild was found in the Database
        if (!result || result.length < 1) return false
        //get the guild_roles to track
        const guild_roles = result[0].track_roles
        return guild_roles.split(',')
    })
}

/**
 * 
 * @param {*} guild 
 * @param {*} roles 
 * @returns 
 */
const getStatsMembers = async (guild, roles) => {
    //go over all roles
    let roleMembers_array = []
    roles.forEach(async role => {
        const roleMembers = guild.roles.cache.get(role.id).members.map(m => m)
        for (let i = 0; i < roleMembers.length; i++) {
            roleMembers_array.push(roleMembers[i])
        }
    });

    //return unique members
    return [...new Set(roleMembers_array)]
}

/**
 * 
 * @param {*} guild 
 * @returns 
 */
const getStatChannels = async (guild) => {
    //fetch all channels & (active) threads from guild
    const textchannels = await guild.channels.fetch()
    const threadchannels = await guild.channels.fetchActiveThreads()

    //filter out all non text-channels & deleted threads
    const channels = textchannels.filter(channel => channel.type == 'GUILD_TEXT').map(channel => channel)
    const threads = threadchannels.threads.filter(channel => channel.deleted == false).map(channel => channel)

    //merge collections
    const channelcollection = channels.concat(threads)

    //return collection
    return channelcollection
}

const processStats = async (perChannelCollection, member) => {

    let perMemberCollection = new Collection; //collection with messages per member

    //go over all channel message collections
    for (const [key, value] of perChannelCollection.entries()) {

        // console.log(key.name)
        // console.log(value.size)

        //create array of filtered messages
        let FilterCollection = Array.from(value.values());
        let tempCollection = new Collection;

        //put every message in the collection
        await FilterCollection.map(message => { //filter messages on target member
            if (message.author.id == member.user.id) tempCollection.set(message.id, message);
        });

        //set collection per member
        // perMemberCollection.set(key, tempCollection)
        perMemberCollection.set(key.name, tempCollection.size)

    }

    //return the collection
    return perMemberCollection

}

/*------------------------------*/

//export all functions
module.exports = {
    getStatsRoles,
    getStatsMembers,
    getStatChannels,
    processStats
}