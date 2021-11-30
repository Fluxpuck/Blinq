//does not need any requirements or utilities

/*------------------------------*/

//construct the command and export
module.exports.run = async (client, message, arguments, prefix, permissions) => {

    //return Sero- and Discord Latency
    return message.reply('Pinging...').then(async (msg) => {
        msg.edit(`${client.user.username} ${msg.createdTimestamp - message.createdTimestamp}ms\nDiscord ${Math.round(client.ws.ping)}ms`);
    })

}


//command information
module.exports.info = {
    name: 'ping',
    category: 'misc',
    alias: ['latency'],
    usage: '[prefix]ping',
    desc: 'Check bot and Discord latency',
    options: []
}

//command permission groups
module.exports.permissions = [
    "VIEW_CHANNEL",
    "SEND_MESSAGES"
]