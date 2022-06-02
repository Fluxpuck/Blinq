/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License  
    This event is triggers by Discord and does processing of data  */

//load required config
const { ownerIds } = require('../config/config.json');

//exports "message" event
module.exports = async (client, message) => {

    //ignore private messages and messages from other bots
    if (message.channel.type === 'dm') return;
    if (message.author.bot) return;

    //get prefix  
    const prefix = message.guild.prefix;

    //log message to Collection
    if (message.guild.messagePool) {
        message.guild.messagePool.set(message.id, message);
    }

    /** Message Handler
     * filter message content into workable elements */
    const messageArray = message.content.split(' ')
    const messagePrefix = messageArray[0]
    const messageCommand = messagePrefix.replace(prefix, '').trim()
    const messageArgs = messageArray.slice(1)

    //check if content starts with prefix, else return
    if (messagePrefix.startsWith(prefix)) {
        //check for regular command (including alliasses)
        const commandFile = (client.commands.get(messageCommand)) ?
            client.commands.get(messageCommand) :
            client.commands.find(cmd => cmd.info.alias.includes(messageCommand));

        //if a commandFile has been found and message author has permissions
        if (commandFile && ownerIds.includes(message.author.id)) {
            //execute commandfile
            commandFile.run(client, message, messageArgs, prefix); //execute command
        }
    }

    //check if message starts with
    if (message.content.startsWith('<@')
        && message.content.endsWith('>')
        && message.member.permissions.has("MANAGE_GUILD")) {
        const users = message.content.match(/[a-z\d]+/ig);
        if (users[0] === client.user.id) {
            //reply with server info
            message.reply(`Hello :wave:   Your current server prefix is \`${prefix}\``)
                .then(msg => { setTimeout(() => msg.delete().catch((err) => { }), 4800) })
                .catch((err) => { });
        }
    }

    return;
}