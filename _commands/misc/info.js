//construct packages
const { MessageEmbed } = require('discord.js');
//require package
const { version } = require('../../package.json')

/*------------------------------*/

//construct the command and export
module.exports.run = async (client, message, arguments, prefix, permissions) => {

    //get client uptime
    let totalSeconds = (client.uptime / 1000);
    let days = Math.floor(totalSeconds / 86400);
    totalSeconds %= 86400;
    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);

    //setup the embedded message
    const embedMessage = new MessageEmbed()
        .setTitle(`${client.user.username} - Info`)
        .addFields(
            { name: `Version`, value: `${version}`, inline: true },
            { name: `Server Count`, value: `${client.guilds.cache.size}`, inline: true },
            { name: `Uptime`, value: `${days} days, ${hours} hrs and ${minutes} min.`, inline: false },
        )
        .setThumbnail('https://cdn.discordapp.com/emojis/605943682734096394.png')
        .setColor('#f6bf21')
        .setFooter(`${client.user.username} | Made by Fluxpuck#0001`)

    //reply to user command
    message.reply({ embeds: [embedMessage] })

}


//command information
module.exports.info = {
    name: 'info',
    category: 'misc',
    alias: ['botinfo', 'seroinfo'],
    usage: '[prefix]info',
    desc: 'Get status information about the Blinq',
    options: []
}

//command permission groups
module.exports.permissions = [
    "MANAGE_GUILD",
    "VIEW_GUILD_INSIGHTS"
]