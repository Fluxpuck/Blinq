//require packages
const moment = require('moment')
//setup database connection(s)
const database = require('../config/database');
//require utilities
const { Collection } = require('discord.js');
const { time } = require('../utils/functions');

/*------------------------------*/

//resolve messages
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

//resolve user messages
const getUserMessages = async (channel, member) => {
    if (!member) return

    //limit the amount to 2000 messages
    const amount = 2000

    //get last message from user in current channel
    let lastMessages = await channel.messages.fetch({ limit: 5 })
    let lastMessage = Array.from(lastMessages.first(1))

    //setup message collection & set first collected message
    let UserMessages = new Collection, duplicateArray = []
    UserMessages.set(lastMessage[0].id, lastMessage)

    //if no message was fetched, return error
    if (UserMessages.size < 1) return false

    //recursive function that keeps looking for user messages till amount is full
    while (UserMessages.size < amount) {

        //get last collection message
        lastMessage = Array.from(UserMessages.last(1))

        //keep track of lastMessage ids and prevent duplicates
        if (duplicateArray.includes(lastMessage[0].id)) break;
        duplicateArray.push(lastMessage[0].id);

        //break the loop if the last message is older than 1 day
        if (OlderThan(lastMessage[0].createdTimestamp) == true) break;

        //setup filter options
        const options = { before: lastMessage[0].id, limit: 100 }

        //collect the messages
        let MsgCollection = await channel.messages.fetch(options)
        //remove everything from collection that is not from target user
        MsgCollection.sweep(message => message.author.id != member.user.id);

        //create array of filtered messages
        let FilterCollection = Array.from(MsgCollection.values())

        //put every message in the collection
        await FilterCollection.map(message => { //add all filtered messages to collection
            if (OlderThan(message.createdTimestamp) == false
                && UserMessages.size < amount) UserMessages.set(message.id, message);
        });

    }

    //delete left over message(s) not from target user
    UserMessages.sweep(msg => msg.author != member.user)

    //return the user message collection!
    return UserMessages

    //small function to check if message timestamp is older than ...
    function OlderThan(timestamp) {
        //setup the times
        const inputTime = moment(timestamp)
        const currentTime = moment()
        //check if difference between dates is more than 2 weeks
        if (currentTime.diff(inputTime, 'days') > 1) { return true }
        else { return false }
    }
}

//resolve channel
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

//resolve role
const getRoles = async (guild, input, flag) => {

    //create return array
    let array_id = []

    //handle input (Array)
    let input_string = Array.isArray(input) ? input.toString() : input
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

//resolve user
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

//get command and guild permissions
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

//find command
const findCommand = async (client, input) => {
    //create commandInfo variable and get or find the command-name based on name or alias.
    let commandInfo = client.commands.get(input) || client.commands.find(cmd => cmd.info.alias && cmd.info.alias.includes(input));
    //if a command is found, return map
    if (commandInfo) return commandInfo.info
    else return false
}

//get input type for purge
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

//go over all channels and fetch messages
const userStats = async (channel, member) => {
    //get the message collection (all messages from the past 24 hours)
    var collection01 = await getUserMessages(channel, member)
    //convert all timestamps to hours and minutes and get all unique values
    var collection02 = await [...new Set(collection01.map(message => time(new Date(message.createdTimestamp))))];

    var total_messages = (collection01.size)
    var uniq_messages = (collection02.length)

    return [total_messages, uniq_messages]
}


module.exports = {
    getMessages,
    getUserMessages,
    getChannels,
    getRoles,
    getUser,
    getCommand,
    findCommand,
    inputType,
    userStats
}