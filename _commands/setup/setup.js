//construct packages
const { MessageEmbed, MessageActionRow, MessageButton,
    MessageSelectMenu, InteractionCollector } = require('discord.js');
const Database = require('../../config/database');

//require embed structures
const { getComponentInteraction } = require('../../utils/CollectionManager');

//require embed structures
const { failure_emote, sero_emote_white,
    setup_one, setup_two, setup_three, setup_four } = require('../../config/embed.json')

/*------------------------------*/

//construct the command and export
module.exports.run = async (client, message, arguments, prefix, permissions) => {

    //setup where you are able to select or choose the roles you want to track! :)

}


//command information
module.exports.info = {
    name: 'setup',
    category: 'setup',
    alias: [],
    usage: '[prefix]setup',
    desc: 'Interactive module to setup the roles you want to track',
}

//command permission groups
module.exports.permissions = [
    "ADMINISTRATOR "
]