//setup database connection(s)
const database = require('../config/database');
//require utilities
const GuildManager = require('../utils/GuildManager');

/*------------------------------*/

//update General Guild Information
const updateGuildinfo = async (guild) => {

    //get guild prefix
    const prefix = await GuildManager.getGuildPrefix(guild)

    //update general guild information
    const query = `SELECT * FROM guild_information WHERE guild_id = ${guild.id}`
    database.query(query, async function (err, result, fields) {
        if (err) { //if table doesn't exist, create one
            const create = `create table if not exists guild_information(
            guild_id VARCHAR(22) not null PRIMARY KEY,
            guild_name VARCHAR(50) not null,
            prefix VARCHAR(7) not null,
            active_flag TINYINT(1) not null,
            create_date TIMESTAMP not null default current_timestamp,
            join_date TIMESTAMP not null default current_timestamp on update current_timestamp
            )`;
            await database.query(create, function (err, result, fields) {
                if (err) return console.log(err);
                const insert = { 'guild_id': guild.id, 'guild_name': guild.name, 'prefix': prefix, 'active_flag': 1 }
                //insert into the database
                database.query(`INSERT INTO guild_information SET ?`, insert, function (err, result, fields) {
                    if (err) return console.log(err);
                })
            });
        } else { //select and update Guildinfo
            if (result.length < 1) { //insert new Server
                const insert = { 'guild_id': guild.id, 'guild_name': guild.name, 'prefix': prefix, 'active_flag': 1 }
                //insert into the database
                database.query(`INSERT INTO guild_information SET ?`, insert, function (err, result, fields) {
                    if (err) return console.log(err);
                });
            }
            if (result.length > 0) { //update returned server
                const insert = { 'guild_name': guild.name, 'active_flag': 1 }
                //insert into the database
                database.query(`UPDATE guild_information SET ? WHERE guild_id = ${database.escape(guild.id)}`, insert, function (err, result, fields) {
                    if (err) return console.log(err);
                });
            }
        }
    });
}

//update General Permissions
const updateGeneralPermissions = async (guild) => {
    const query = `create table if not exists guild_settings(
        guild_id VARCHAR(22) not null PRIMARY KEY,
        guild_name VARCHAR(50) not null,
        track_roles longtext not null,
        chnl_excl longtext not null,
        member_excl longtext not null,
        create_date timestamp not null default current_timestamp,
        update_date timestamp not null default current_timestamp on update current_timestamp
    )`;
    await database.query(query, function (err, result) {
        if (err) return console.log(err);
        let insert = { "guild_id": guild.id, "guild_name": guild.name, "track_roles": 0, "chnl_excl": 0, "member_excl": 0 }
        //insert into the database
        database.query(`INSERT IGNORE INTO guild_settings set ?`, insert, function (err, result) {
            if (err) return console.log(err)
        });
    });
}

//update Command Permissions
const updateCommandPermissions = async (guild, clientCommands) => {
    const query = `create table if not exists ${guild.id}_permissions(
        cmd_name VARCHAR(50) not null UNIQUE,
        role_access longtext not null,
        chnl_access longtext not null,
        dft_access longtext not null,
        create_date timestamp not null default current_timestamp,
        update_date timestamp not null default current_timestamp on update current_timestamp
    )`;
    await database.query(query, async function (err, result) {
        if (err) return console.log(err)
        clientCommands.forEach(Command => { //go through all modules and insert them into the database
            let insert = { "cmd_name": Command.info.name, "role_access": 0, "chnl_access": 0, "dft_access": Command.permissions.toString() }
            //insert into the database
            database.query(`INSERT IGNORE INTO ${guild.id}_permissions set ?`, insert, function (err, result) {
                if (err) return console.log(err)
            });
        });
    });
}

//update UserStats logging table
const updateUserStatsLogging = async (guild) => {
    const query = `create table if not exists ${guild.id}_userstats(
        ID int not null auto_increment PRIMARY KEY,
        user_id VARCHAR(22) not null,
        user_name VARCHAR(50) not null,
        total_messages VARCHAR(11) not null,
        uniq_messages VARCHAR(11) not null,
        create_date timestamp not null default current_timestamp
    )`;
    await database.query(query, function (err, result) {
        if (err) return console.log(err);
    });
}


/*------------------------------*/

//export all functions
module.exports = {
    updateGuildinfo,
    updateGeneralPermissions,
    updateCommandPermissions,
    updateUserStatsLogging
}