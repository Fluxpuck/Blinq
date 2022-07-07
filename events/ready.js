/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License  
    This event is triggers by Discord and does processing of data  */

//load required modules
const { join } = require('path');
const commandFolder = join(__dirname, '..', 'commands');
const { Collection } = require('discord.js');

//require Managers
const ClientConsole = require('../utils/ConsoleManager');
const ClientManager = require('../utils/ClientManager');
const DataManager = require('../database/DbManager');

//require Queries
const { loadGuildPrefixes } = require('../database/QueryManager');

//exports "ready" event
module.exports = async (client) => {

    //find all client commandfiles
    async function fileLoader(fullFilePath) {
        if (fullFilePath.endsWith(".js")) {
            let props = require(fullFilePath)
            client.commands.set(props.info.name, props)
        }
    }

    //get and initialize client commands
    await ClientManager.getClientCommands(commandFolder, { dealerFunction: fileLoader })

    //check and update all database tables
    const guilds = Array.from(client.guilds.cache.values())
    for await (let guild of guilds) {
        //update client/guild table(s)
        await DataManager.UpdateGuildTable();
        await DataManager.UpdateTrackingTable(guild.id);
        await DataManager.UpdateMembersTable(guild.id);
        //load guild specific values
        await loadGuildPrefixes(guild);
        //setup guild collection(s)
        guild.messagePool = await new Collection;
    }

    //set client activity
    await ClientManager.setClientActivity(client);

    //finalize with the Console Messages
    ClientConsole.WelcomeMessage();
    ClientConsole.EventMessage(client.events);
    ClientConsole.CommandMessage(client.commands);

    return;
}