/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License  
    This custom event is triggers on a timer and collects and processes data  */

//require utilities
const { getTrackingMembers, saveTrackingData, updateMemberTC } = require("../database/QueryManager")
const { filterMessagePool } = require("../utils/Resolver")

//require config
module.exports = async (client, guild) => {

    //collect targetted tracking roles
    const trackingMembers = await getTrackingMembers(guild.id)
    if (trackingMembers.length <= 0) return;

    //setup new collection & first/last messages
    const messageCollection = guild.messagePool;
    const firstMessage = messageCollection.first();
    const lastMessage = messageCollection.last();

    //delete entire message collection, to start-over
    guild.messagePool.sweep(m => m);

    //go through every member that needs to be tracked
    for await (member of trackingMembers) {
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
        const memberMessageDetails = await filterMessagePool(member.userId, messageCollection);
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
        await saveTrackingData(guild.id, user = { id: member.userId, username: member.userName }, memberMessageCounters)
        await updateMemberTC(guild.id, member.userId);

    }

    return;
}