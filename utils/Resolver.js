//require packages
const moment = require('moment')
//setup database connection(s)
const database = require('../config/database');
//require utilities
const { Collection } = require('discord.js');
const { convertSnowflake, olderThan, time } = require('../utils/functions');

/*------------------------------*/

/**
 * Fetch all messages (within 24 hours) from a channel
 * @param {Object} channel 
 * @returns 
 */
const collectAllMessages = async (channel) => {

    if (!channel) return //if there are no channels, return

    //setup the message collection
    let messageCollection = new Collection

    //get last message from the channel
    let FetchMessages = 0, LastMessage = 0, LastMessageTimestamp = 0
    FetchMessages = await channel.messages.fetch({ limit: 1, force: true });
    if ([...FetchMessages.values()].length > 0) {
        LastMessage = Array.from(FetchMessages)[FetchMessages.size - 1][1];
        LastMessageTimestamp = convertSnowflake(LastMessage.id);
    }

    // console.log(channel.name)
    // console.log(LastMessageTimestamp, olderThan(LastMessageTimestamp))

    //keep fetching messages, as long as last message is not older than timestamp
    while (olderThan(LastMessageTimestamp) == false) {

        //collect messages in chunks of 100
        const options = { before: LastMessage.id, limit: 100 } //set filter options
        FetchMessages = await channel.messages.fetch(options) //collect messages
        FetchMessages.map(message => { messageCollection.set(message.id, message) })

        // console.log(messageCollection.last())
        console.log(Array.from(messageCollection.last(1))[0].id) // ERRORS OUT ON GIVEAWAY-30plus CHANNEL?? NO IDEA WHY
        console.log(Array.from(messageCollection)[messageCollection.size - 1][1].id)

        //check for and set LastMessage values
        if (messageCollection.last(1)) {
            LastMessage = Array.from(messageCollection)[messageCollection.size - 1][1]
            LastMessageTimestamp = convertSnowflake(LastMessage.id);
        }

        console.log(channel.name, LastMessage.id, LastMessageTimestamp)
        console.log(`https://discord.com/channels/${channel.guild.id}/${channel.id}/${LastMessage.id}`)

        //if last message is older than 24 hours, break the loop
        if (olderThan(LastMessageTimestamp) == true) break;

    }

    //remove spilled messages, older than 24 hours
    messageCollection.sweep(message => olderThan(convertSnowflake(message.id)) == true)

    //return the message collection
    return messageCollection
}

/**
 * Resolve messages
 * @param {Number} numOfMessages 
 * @param {Time} timeToWait 
 * @param {Map} message 
 * @param {Object} customFilter 
 * @returns 
 */
const getMessages = async (numOfMessages, timeToWait, message, customFilter = 0) => {
    //check if custom_filter is set, else filter by message author
    let filter = (customFilter != 0) ? customFilter : m => m.author.id == message.author.id // Improved filtering.
    let retValue = 0; //create empty return value
    // Collect the messages
    await message.channel.awaitMessages(filter, { max: numOfMessages, time: timeToWait, errors: ['time'] })
        .then(collectedMessages => { //fill return value
            retValue = Array.from(collectedMessages.values())
        }).catch(err => { throw err }) //throw error
    return retValue
}

/**
 * Resolve channel
 * @param {Object} guild 
 * @param {Array} input 
 * @param {String} flag 
 * @returns 
 */
const getChannels = async (guild, input, flag) => {

    //create return array
    let array_id = []

    //handle input (Array)
    let input_string = Array.isArray(input) ? input.toString() : input
    let input_array = input_string.split(',')

    /*----------*/

    //go through all input channels
    input_array.forEach(channel => {

        //filter input [1]
        let mention = new RegExp('<#([0-9]+)>', 'g').exec(channel)
        let item = mention != null ? mention[1] : channel.trim()

        //filter input [2]
        let filter = database.escape(item.replace(',', ''))
        let filter_item = filter.substring(1).slice(0, -1).trim()

        //get channel information
        let targetChannel = filter_item.match(/^[0-9]+$/) != null ? guild.channels.cache.get(filter_item) : guild.channels.cache.find(channel => channel.name.toLowerCase() == filter_item.toLowerCase())

        //check what flag is present
        switch (flag) {
            case "tag": //if user asked for channel tags, return channel tags
                if (targetChannel) array_id.push(`<#${targetChannel.id}>`)
                break;
            case "name": //if user asked for channel names, return channel names
                if (targetChannel) array_id.push(targetChannel.name)
                break;
            case "all": //if user requests all channel information
                if (targetChannel) array_id.push(targetChannel)
                break;
            default:
                if (targetChannel) array_id.push(targetChannel.id)
        }
    });

    //check if any result and return
    if (array_id.length >= 1) return array_id
    else return false
}

/**
 * Resolve role
 * @param {Object} guild 
 * @param {Array} input 
 * @param {String} flag 
 * @returns 
 */
const getRoles = async (guild, input, flag) => {

    //create return array
    let array_id = []

    //handle input (Array)
    // let input_string = Array.isArray(input) ? input.toString() : input
    let input_string = (typeof input == 'object') ? input.toString() : input
    let input_array = input_string.split(',')

    //go through every input
    input_array.forEach(role => {

        //filter input [1]
        let mention = new RegExp('<@&([0-9]+)>', 'g').exec(role)
        let item = mention != null ? mention[1] : role.trim()

        //filter input [2]
        let filter = database.escape(item.replace(',', ''))
        let filter_item = filter.substring(1).slice(0, -1).trim()

        //get role information
        let targetRole = filter_item.match(/^[0-9]+$/) != null ? guild.roles.cache.get(filter_item) : guild.roles.cache.find(role => role.name.toLowerCase() == filter_item.toLowerCase())

        //check what flag is present
        switch (flag) {
            case "tag": //if user asked for rp;e ids, return role ids
                if (targetRole) array_id.push(`<@&${targetRole.id}>`)
                break;
            case "name": //if user asked for role names, return role names
                if (targetRole) array_id.push(targetRole.name)
                break;
            case "all": //if user requests all role information
                if (targetRole) array_id.push(targetRole)
                break;
            default:
                if (targetRole) array_id.push(targetRole.id)
        }

    });

    //check if any result and return
    if (array_id.length >= 1) return array_id
    else return false

}

/**
 * Resolve user
 * @param {Object} guild 
 * @param {String} input 
 * @returns 
 */
const getUser = async (guild, input) => {
    if (!input) return

    let member //setup member value

    //filter input [1]
    let mention = new RegExp('<@!?([0-9]+)>', 'g').exec(input)
    let item = mention != null ? mention[1] : input.trim()

    //filter input [2]
    let filter = database.escape(item.replace(',', ''))
    let filter_item = filter.substring(1).slice(0, -1).trim()

    //get user by id
    if (filter_item.match(/^[0-9]+$/)) {
        member = await guild.members.cache.get(filter_item) //get user straight from member cache
        if (!member) { member = await guild.members.cache.find(member => member.id == filter_item) } //find user in member cache
        else if (!member) { member = await guild.members.fetch(filter_item); } //fetch member straight from guild
        //if member is found (by id) return member
        if (member) return member;
    }

    //get user by username#discriminator
    if (filter_item.indexOf('#') > -1) {
        let [name, discrim] = filter_item.split('#') //split the into username and (#) discriminator
        member = await guild.members.cache.find(u => u.user.username === name && u.user.discriminator === discrim);
        //if member is found (by username and discriminator) return member
        if (member) return member;
    }

    //if member value is still empty, return false
    if (!member) return false;
}

/**
 * Get command and guild permissions
 * @param {Object} client 
 * @param {Map} message 
 * @param {String} input 
 * @returns 
 */
const getCommand = async (client, message, input) => {
    //create commandInfo variable and get or find the command-name based on name or alias.
    let commandInfo = client.commands.get(input) || client.commands.find(cmd => cmd.info.alias && cmd.info.alias.includes(input));
    if (commandInfo) { //if a command is found, get permissions
        return new Promise(async function (resolve) {
            const query = (`SELECT * FROM ${message.guild.id}_permissions WHERE cmd_name = "${commandInfo.info.name}"`)
            database.query(query, async function (err, result) { resolve(result) })
        }).then(async function (result) {

            //check if there is any result, else return false
            let commandPermissions = (result.length < 1) ? false : result[0]
            if (commandPermissions == false) return false

            //construct command role access
            let commandRoleA = result[0].role_access
            commandRoleA = commandRoleA.split(',');

            //construct command channel access
            let commandChannelA = result[0].chnl_access
            commandChannelA = commandChannelA.split(',');

            //construct command disabled
            const commandDisabled = result[0].disabled

            //set returnArray to return
            let returnArray = ({ name: commandInfo.info.name, alias: commandInfo.info.alias, usage: commandInfo.info.usage, desc: commandInfo.info.desc, role_access: commandRoleA, chnl_access: commandChannelA, disabled: commandDisabled })
            return returnArray
        });
    } //if command is not found, return false
    else return false
}

/**
 * Find command
 * @param {Object} client 
 * @param {String} input 
 * @returns 
 */
const findCommand = async (client, input) => {
    //create commandInfo variable and get or find the command-name based on name or alias.
    let commandInfo = client.commands.get(input) || client.commands.find(cmd => cmd.info.alias && cmd.info.alias.includes(input));
    //if a command is found, return map
    if (commandInfo) return commandInfo.info
    else return false
}

/**
 * Get input type for purge
 * @param {Object} guild 
 * @param {String} input 
 * @returns 
 */
const inputType = async (guild, input) => {

    //create return array
    let typeArray = { "member": [], "amount": [] }

    //handle input (Array)
    let input_string = Array.isArray(input) ? input.toString() : input
    let input_array = input_string.split(',')

    //await for the loop to finish
    await input_array.forEach(async item => {
        if (item.length > 10) { //get member value
            let target = await getUser(guild, item) //get member value
            typeArray.member.push(target) //push member into user
        }
        if (item.length < 5) { //get amount value
            typeArray.amount.push(item) //push amount into amount
        }
    });

    return typeArray //return to outcome
}

/**
 * Go over all channels and fetch messages
 * @param {Map} channel 
 * @param {Array} members 
 */
const userStats = async (channel, members) => {
    //get the message collection (all messages from the past 24 hours)
    // var collection01 = await getUserMessages(channel, members)
    //convert all timestamps to hours and minutes and get all unique values
    // var collection02 = await [...new Set(collection01.map(message => time(new Date(message.createdTimestamp))))];

    // var total_messages = (collection01.size)
    // var uniq_messages = (collection02.length)

    // return [total_messages, uniq_messages]
}



module.exports = {
    collectAllMessages,
    getMessages,
    getChannels,
    getRoles,
    getUser,
    getCommand,
    findCommand,
    inputType,
    userStats
}