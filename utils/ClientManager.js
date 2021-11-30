//require packages
const fs = require('fs');

/*------------------------------*/

//set Sero Activity
const setSeroActivity = async (client) => {
    //set bot presence/activity
    client.user.setPresence({ status: `online`, activity: { type: `PLAYING`, name: `Pink Fluffy Unicorn` } })
}

//check if filepath is a directory
function isDir(filePath) {
    return (fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory())
} //find all Commands, through all folders
const getSeroCommands = async (filePath, options = {}) => {

    if (!options.hasOwnProperty("dealerFunction")) Object.assign(options, { dealerFunction: 0 })
    if (!options.hasOwnProperty("initialDirectoryCheck")) Object.assign(options, { initialDirectoryCheck: true })
    if (!options.hasOwnProperty("print")) Object.assign(options, { print: false })

    if (options.dealerFunction == 0 && options.print == false) throw new Error(`No file dealer function provided`)
    if (typeof (options.dealerFunction) != "function" && options.print == false) throw new Error(`Dealer function provided is not a function`)

    let initCheck = isDir(filePath);

    if (options.initialDirectoryCheck && !initCheck) throw new Error(`File path provided (${filePath}) is not a folder / directory.`)

    if (initCheck) // Checks whether the path is a folder
    {
        fs.readdirSync(filePath).forEach(file_in_folder => { // Through each file in the folder
            let new_path = `${filePath}/${file_in_folder}` // Construct a new path
            let secondaryCheck = isDir(new_path)
            if (secondaryCheck) module.exports.getSeroCommands(new_path, { dealerFunction: options.dealerFunction, initialDirectoryCheck: false, print: options.print })
            else {
                if (options.print) console.log(new_path)
                else options.dealerFunction(new_path)
            }
        })
    }
    else // If not, fileLoader
    {
        if (options.print) console.log(filePath)
        else options.dealerFunction(filePath)
    }

}

/*------------------------------*/

//export all functions
module.exports = {
    setSeroActivity,
    getSeroCommands
}