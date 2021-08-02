//require DiscordJS
const { MessageEmbed } = require('discord.js');

//require embed structures
const { failure_emote } = require('../config/embed.json')

/*------------------------------*/

module.exports = {

    /**
     * 
     * @param {Map} message 
     * @param {MessageEmbed} message_embed 
     * @param {Object} bot_message 
     * @param {String} time 
     * @returns 
     */
    async InteractiveTextModule(message, message_embed, bot_message, time) {
        //fetch response
        let messages = await Resolver.getMessages(1, time, message).catch(e => {
            //update message embed
            message_embed.fields = []
            message_embed.setThumbnail()
            message_embed.setColor("#D51414")
            message_embed.setDescription(`\`\`\`diff\nYou took too long to reply. Please reply withing ${(time / 60000)} minutes.\`\`\``)
            message_embed.setFooter(``)
            //send message embed and return false
            bot_message.edit({ embeds: [message_embed] })
            return false
        })

        //set response
        let msg_response = messages[0] ? messages[0].content : false

        //check if people stop the interactive setup
        if (msg_response != false) {
            if (msg_response.toLowerCase() == 'exit' || msg_response.toLowerCase() == 'cancel' || msg_response.toLowerCase() == 'stop') {
                //update message embed
                message_embed.fields = []
                message_embed.setThumbnail()
                message_embed.setColor("#D51414")
                message_embed.setDescription(`${failure_emote} You stopped the interactive setup.`)
                message_embed.setFooter(``)
                //send message embed and return false
                bot_message.edit(message_embed)
                return msg_response = false
            }
            //remove user message
            message.channel.messages.fetch(messages[0].id).then(msg => { msg.delete({ timeout: 1000, reason: 'Remove Command Input' }); })
        }

        //return response
        return msg_response
    },

    /**
     * 
     * @param {Map} message_embed 
     * @param {MessageEmbed} bot_message 
     * @param {String} error_message 
     * @param {String} timer 
     */
    async InteractiveTextError(message_embed, bot_message, error_message, timer) {
        //update message error embed
        message_embed.fields = []
        message_embed.setThumbnail()
        message_embed.setColor("#D51414")
        message_embed.setDescription(`${failure_emote} ${error_message}`)
        message_embed.setFooter(``)
        //check if a remove timer is set!
        if (timer) { //if timer is set edit message and remove
            bot_message.edit({ embeds: [message_embed] }).then(msg => { msg.delete({ timeout: timer, reason: 'Removed setup error message, Sero' }); })
        } else { //if no timer is set, just edit message
            bot_message.edit({ embeds: [message_embed] })
        }
    },

};