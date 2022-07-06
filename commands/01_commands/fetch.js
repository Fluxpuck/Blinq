/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License
    For more information on the commands, please visit hyperbot.cc  */

//require utilities
const { MessageEmbed, SnowflakeUtil } = require("discord.js");
const { convertSnowflake, convertMsToTime } = require("../../utils/functions");
const { filterMessagePool, getUserFromInput } = require("../../utils/Resolver");

//construct the command and export
module.exports.run = async (client, message, arguments, prefix) => {
    //if there are no arguments, no target has been defined
    if (arguments.length < 1) return message.reply('@user was not provided');

    //get target user
    const member = await getUserFromInput(message.guild, arguments[0]);
    if (member == false) return message.reply('@user was not found');

    //setup new collection & first/last messages
    const messageCollection = message.guild.messagePool;
    const firstMessage = messageCollection.first();
    const lastMessage = messageCollection.last();

    //calculate active time in hrs
    const firstMessageDate = convertSnowflake(firstMessage.id);
    const lastMessageDate = convertSnowflake(lastMessage.id);

    //calculate time difference between dates
    const timeDiff = Math.floor(lastMessageDate - firstMessageDate);

    //collect message details from member
    const memberMessageDetails = await filterMessagePool(member.id, messageCollection);

    //construct Embedded Message
    const messageEmbed = new MessageEmbed()
        .setTitle(`Member statistics :     ${member.user.tag}`)
        .setDescription(`*${firstMessageDate.toUTCString()}* - *${lastMessageDate.toUTCString()}* → **${convertMsToTime(timeDiff)}**`)
        .addFields(
            { name: `Total Messages`, value: `\`\`\`${memberMessageDetails.messageCount.length}\`\`\``, inline: true },
            { name: `Active Minutes`, value: `\`\`\`${memberMessageDetails.activeMinutes.length}\`\`\``, inline: true },
            { name: `Messages Editted`, value: `\`\`\`${memberMessageDetails.editCount.length}\`\`\``, inline: true },
            { name: `Commands Used`, value: `\`\`\`${memberMessageDetails.commandCount.length}\`\`\``, inline: true },
            { name: `Attachments send`, value: `\`\`\`${memberMessageDetails.attachCount.length}\`\`\``, inline: true },
            { name: `Users Mentioned`, value: `\`\`\`${memberMessageDetails.mentionCount.length}\`\`\``, inline: true },
            { name: `Stickers Used`, value: `\`\`\`${memberMessageDetails.stickerCount.length}\`\`\``, inline: true },
            { name: `Gifs Send`, value: `\`\`\`${memberMessageDetails.gifCount.length}\`\`\``, inline: true },
            { name: `Channels Used (${memberMessageDetails.channelCount.length})`, value: `${memberMessageDetails.channelCount.length >= 1 ? memberMessageDetails.channelCount.map(c => `<#${c}>`).join(',') : 'None'}`, inline: false },
        )
        .setThumbnail(member.user.avatarURL())
        .setColor()
        .setTimestamp()
        .setFooter({ text: `${member.id}`, iconURL: member.user.displayAvatarURL() })

    //send message
    return message.reply({ embeds: [messageEmbed] })
}

//command information
module.exports.info = {
    name: 'fetch',
    alias: ['collect'],
    category: 'main',
    desc: 'Fetch member statistics',
    usage: '{prefix}fetch @member',
}

//slash setup
module.exports.slash = {
    slash: false,
    options: [],
    permission: [],
    defaultPermission: false,
    ephemeral: true
}