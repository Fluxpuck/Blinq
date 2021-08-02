//load required modules
const { readdirSync } = require('fs');
const { join } = require('path');

//construct Sero utilities
const { logEventTable } = require('../utils/ConsoleManager');

//run and export module
module.exports.run = (client) => {

    //set directory path to events and read files
    const filePath = join(__dirname, '..', 'events');
    const eventFiles = readdirSync(filePath);

    //go through all events and bind to Client
    for (const file of eventFiles) {
        const event = require(`${filePath}/${file}`);
        const eventName = file.split('.').shift()
        client.on(eventName, event.bind(null, client))
    }
    logEventTable(eventFiles)

    //log on Client launch
    console.log(` > Loaded ${eventFiles.length} events sucessfully.`)
}