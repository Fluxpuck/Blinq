/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License
    For more information on the commands, please visit hyperbot.cc  */

//require utilities
const { filterMessagePool } = require("../../utils/Resolver")

//construct the command and export
module.exports.run = async (client, message, arguments, prefix) => {







}


//command information
module.exports.info = {
    name: 'fetch',
    alias: ['collect'],
    category: '',
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