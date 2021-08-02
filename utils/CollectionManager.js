
//resolve messages
const getMessages = async (numOfMessages, timeToWait, message, customFilter = 0) => {
    //check if custom_filter is set, else filter by message author
    let filter = (customFilter != 0) ? customFilter : m => m.author.id == message.author.id // Improved filtering.
    let retValue = 0; //create empty return value
    // Collect the messages
    await message.channel.awaitMessages(filter, { max: numOfMessages, time: timeToWait, errors: ['time'] })
        .then(collectedMessages => { //fill return value
            retValue = Array.from(collectedMessages.values())
        }).catch(err => { throw err }) //throw error
    return retValue
}

// Custom getComponentInteraction function
const getComponentInteraction = async (message, timeToWait, customFilter = 0) => {
    // Check if there's a custom filter
    let filter = (customFilter != 0) ? customFilter : i => i.user.id == message.author.id
    let returnValue = 0;
    // Await the interaction
    await message.awaitMessageComponent({ filter, time: timeToWait })
        .then(interaction => {
            returnValue = interaction
        })
        .catch(err => { returnValue = false })
    // Check for returnValues and update 
    if (returnValue != false) { await returnValue.deferUpdate(); }
    return returnValue
}

/*------------------------------*/

//export all functions
module.exports = {
    getMessages,
    getComponentInteraction
}