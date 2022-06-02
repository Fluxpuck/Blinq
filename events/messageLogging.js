/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License  
    This custom event is triggers on a timer and collects and processes data  */

//require utilities
const { getTrackingRoles, saveTrackingData } = require("../database/QueryManager")
const { filterMessagePool, getMembersFromRole } = require("../utils/Resolver")

//require config
module.exports = async (client, guild) => {
    //collect tracking roles
    const trackingRoles = await getTrackingRoles(guild.id);
    if (trackingRoles.length <= 0) return;
    //collect members from role(s)
    const memberCollection = await getMembersFromRole(guild, trackingRoles);
    if (memberCollection.size <= 0) return;

    //setup new collection & first/last messages
    const messageCollection = guild.messagePool;
    const firstMessage = messageCollection.first();
    const lastMessage = messageCollection.last();

    //delete entire message collection, to start-over
    guild.messagePool.sweep(m => m);

    //collect message details for each member
    for await (const [key, value] of memberCollection.entries()) {
        function memberMessageLogs(activeMinutes, messageCount, editCount, channelCount, mentionCount, attachCount, stickerCount, gifCount, commandCount) {
            this.activeMinutes = activeMinutes;
            this.messageCount = messageCount;
            this.editCount = editCount;
            this.channelCount = channelCount;
            this.mentionCount = mentionCount;
            this.attachCount = attachCount;
            this.stickerCount = stickerCount;
            this.gifCount = gifCount;
            this.commandCount = commandCount;
        }
        //collect message details from member
        const memberMessageDetails = await filterMessagePool(key, messageCollection);
        //get counters for each detail
        const memberMessageCounters = new memberMessageLogs(
            memberMessageDetails.activeMinutes.length,
            memberMessageDetails.messageCount.length,
            memberMessageDetails.editCount.length,
            memberMessageDetails.channelCount.length,
            memberMessageDetails.mentionCount.length,
            memberMessageDetails.attachCount.length,
            memberMessageDetails.stickerCount.length,
            memberMessageDetails.gifCount.length,
            memberMessageDetails.commandCount.length
        )

        //save to database
        await saveTrackingData(guild.id, user = { id: key, username: value.user.tag }, memberMessageCounters)
    }
    return;
}