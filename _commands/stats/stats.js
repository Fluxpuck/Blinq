//construct packages
const { MessageEmbed } = require('discord.js');
const Database = require('../../config/database');

/*------------------------------*/

//construct the command and export
module.exports.run = async (client, message, arguments, prefix, permissions) => {

    //set switch key value
    let key = arguments[0]

    switch (key) {
        case 'day':

            break;
        case 'week':

            break;

        default:

            break;
    }



    //get all distrinct users from database
    let distinct_users
    const query = `SELECT DISTINCT user_id FROM ${message.guild.id}_userstats`
    await Database.query(query, async function (err, result, fields) {

        distinct_users = result

        // result.forEach((r, i) => {
        // const query_2 = `SELECT *, (DATE(NOW()) - INTERVAL 7 DAY) AS diff
        // FROM ${message.guild.id}_userstats 
        // WHERE user_id = ${r.user_id} AND create_date >= (DATE(NOW()) - INTERVAL 7 DAY)
        // ORDER BY create_date DESC;`
        // Database.query(query_2, async function (err, result, fields) {

        //     console.log(result)

        // })
        // });

        console.log(distinct_users)

    })

    console.log(distinct_users)


    // const query = `SELECT * FROM ${message.guild.id}_userstats
    // WHERE create_date >= CURDATE()
    // AND create_date < CURDATE()`
    // Database.query(query, async function (err, result, fields) {

    //     console.log(result)

    // })


    // const query_2 = `SELECT *, (DATE(NOW()) - INTERVAL 7 DAY) AS diff
    // FROM ${message.guild.id}_userstats 
    // WHERE create_date >= (DATE(NOW()) - INTERVAL 7 DAY)
    // ORDER BY create_date DESC;`
    // Database.query(query_2, async function (err, result, fields) {

    //     console.log(result)

    // })






}

//command information
module.exports.info = {
    name: 'stats',
    category: 'stats',
    alias: ['modstats'],
    usage: '[prefix]stats',
    desc: 'Check the message and unique minutes stats',
}

//command permission groups
module.exports.permissions = [
    "ADMINISTRATOR "
]