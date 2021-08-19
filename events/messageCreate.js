//require ownerIDs from configuration file
const { ownerIDs } = require('../config/config.json')
//construct utilities
const GuildManager = require('../utils/GuildManager');

//exports event
module.exports = async (client, message) => {

    //ignore private messages and messages from other bots
    if (message.author.bot) return
    if (message.channel.type === 'dm') return

    //get Guild Prefix
    const prefix = await GuildManager.getGuildPrefix(message.guild);

    //reply with Guild Prefix on bot mention
    let bot_mention = new RegExp('<@!([0-9]+)>', 'g').exec(message.content) || new RegExp('<@([0-9]+)>', 'g').exec(message.content)
    if (bot_mention != null && bot_mention[1] == client.user.id) {
        message.channel.send(`> Current server prefix: \`${prefix}\``).then(msg => { msg.delete({ timeout: 10000, reason: 'Guild prefix' }); })
    }

    //filter message content into workable elements
    const messageArray = message.content.split(' ')
    const messagePrefix = messageArray[0]
    const messageCommand = messagePrefix.replace(prefix, '').trim()
    const messageArgs = messageArray.slice(1)

    //check if content starts with prefix, else return
    if (messagePrefix.startsWith(prefix)) {

        //check if it is regular command (plus check for aliasses)
        let commandFile = (client.commands.get(messageCommand)) ? client.commands.get(messageCommand) : client.commands.find(cmd => cmd.info.alias.includes(messageCommand));
        //if commandfile has been found
        if (commandFile) {

            //get Command Permissions for this Guild
            const permissions = await GuildManager.getGuildCommandPermissions(message.guild, commandFile.info.name)
            if (permissions != false) {

                //set refuseArray for false items
                let refuseArray = []

                //check role access permissions
                const role_access = permissions.role_access.split(',')
                role_access.forEach(role => {
                    if (message.member.roles.cache.has(role) == false) refuseArray.push(false)
                });
                //check channel access permissions
                const chnl_access = permissions.chnl_access.split(',')
                chnl_access.forEach(channel => {
                    if (message.channel.id === channel) refuseArray.push(false)
                });
                //check default access permissions
                const dft_access = permissions.dft_access.split(',')
                dft_access.forEach(perm => {
                    if (message.member.permissions.has(perm.trim()) == false) refuseArray.push(false)
                });

                /*  check if the refuse array does not have any false permissions
                    and if the message author is bot owner  */
                if (!refuseArray.includes(false) || ownerIDs.includes(message.member.id)) {
                    if (commandFile) commandFile.run(client, message, messageArgs, prefix, permissions);
                }
            }
        }
    }
}