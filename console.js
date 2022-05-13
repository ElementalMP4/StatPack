const databaseOps = require("./database_operations");
const readline = require("readline");
const consoleInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function handleDeleteCommand(args) {
    const statName = args[0];
    const exists = databaseOps.statExists(statName);

    if (exists) {
        databaseOps.deleteStat(statName);
        console.log("Deleted stat '" + statName + "'");
    } else console.log("Couldn't find stat with name '" + statName + "'");
}

function handleListCommand() {
    const stats = databaseOps.getAllStats();

    stats.forEach(stat => {
        console.log(stat.name + " - " + stat.count);
    });
}

function handleCreateCommand(args) {
    const statName = args[0];
    const exists = databaseOps.statExists(statName);

    if (exists) console.log("A stat with that name already exists!");
    else {
        databaseOps.createStat(statName);
        console.log("Stat created with name '" + statName + "'");
    }
}

function handleUpdateCommand(args) {
    if (args.length < 2) console.log("This command needs 2 arguments!");
    const name = args[0];
    const newCount = args[1];
    const exists = databaseOps.statExists(name);
    const num = Number(newCount);

    if (!exists) console.log("Couldn't find stat with name '" + statName + "'");
    else if (!Number.isInteger(num)) console.log("Provided count is not an integer!");
    else {
        databaseOps.updateStat(name, num);
        console.log("Set stat '" + name + "' to " + newCount);
    }
}

function handleGetCommand(args) {
    const statName = args[0];
    const exists = databaseOps.statExists(statName);

    if (exists) {
        const stat = databaseOps.getStat(statName);
        console.log(stat.name + " - " + stat.count);
    } else console.log("Couldn't find stat with name '" + statName + "'");
}

function handleResetCommand(args) {
    const statName = args[0];
    const exists = databaseOps.statExists(statName);

    if (!exists) console.log("Couldn't find a stat with name '" + statName + "'");
    else {
        databaseOps.updateStat(statName, 0);
        console.log("Reset stat '" + statName + "' to 0");
    }
}

function handleHelpCommand() {
    console.log(`StatPack Help\n
delete [stat] - Deletes a statistic
create [stat]- Creates a statistic
update [stat] [count] - Changes a statistic value
reset [statistic] - Resets a statistic
get [stat] - Shows a stat
list - Shows all stats
help - Shows this message
quit - Shuts down StatPack\n`);
}

function handleConsoleCommand(input) {
    let args = input.split(/ |\n+/g);
    let command = args.shift().toLowerCase();

    switch (command) {
        case "help":
            handleHelpCommand();
            break;
        case "delete":
            handleDeleteCommand(args);
            break;
        case "create":
            handleCreateCommand(args);
            break;
        case "update":
            handleUpdateCommand(args);
            break;
        case "reset":
            handleResetCommand(args);
            break;
        case "get":
            handleGetCommand(args);
            break;
        case "list":
            handleListCommand();
            break;
        case "quit":
            process.exit(0);
            break;
        default:
            console.log("Unknown command '" + command + "' - Try 'help'");
            break;
    }
}

function question(dbOps) {
    //databaseOps = dbOps;
    consoleInterface.question("> ", function(inputString) {
        handleConsoleCommand(inputString);
        question();
    });
};

module.exports = {
    listenForCommands: question
};