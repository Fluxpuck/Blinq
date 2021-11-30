module.exports = {

    /**
    * Table log all Commands
    * @param {Collection} commands 
    */
    logCommandTable(commands) {
        function Command(commandName, commandCategory) {
            this.commandName = commandName;
            this.commandCategory = commandCategory;
        }
        //go over all commands
        tableArray = []
        commands.forEach(command => {
            let item = new Command(command.info.name, command.info.category)
            tableArray.push(item)
        });
        //log all commands in table
        console.table(tableArray);
    },

    /**
     * Table log all Events
     * @param {Collection} events 
     */
    logEventTable(events) {
        function Event(eventName) {
            this.event = eventName;
        }
        //go over all events
        tableArray = []
        events.forEach(event => {
            let item = new Event(event)
            tableArray.push(item)
        });
        //log all events in table
        console.table(tableArray);
    }

};