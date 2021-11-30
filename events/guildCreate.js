//construct utilities
const DataManager = require('../utils/DataManager');

//exports event
module.exports = async (client, guild) => {

    //update Databases for new Guild
    await DataManager.updateGuildinfo(guild);
    await DataManager.updateCommandPermissions(guild, client.commands);
    await DataManager.updateUserStatsLogging(guild);
    await DataManager.updateGeneralPermissions(guild);

    /*------------------------------*/

}