/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License
    For more information on the commands, please visit hyperbot.cc  */

//construct the command and export
module.exports.run = async (client, message, arguments, prefix) => {

    //return Client- and Discord Latency
    return message.reply('Pinging...').then(async (msg) => {
        msg.edit(`\`\`\`yaml
Bot:      ${msg.createdTimestamp - message.createdTimestamp}ms
Discord:  ${Math.round(client.ws.ping)}ms
\`\`\``);
    }).catch((err) => { });

}

//command information
module.exports.info = {
    name: 'ping',
    alias: ['latency'],
    category: 'misc',
    desc: 'Check client and Discord latency',
    usage: '{prefix}ping',
}
//slash setup
module.exports.slash = {
    slash: false,
    options: [],
    permission: [],
    defaultPermission: false,
}