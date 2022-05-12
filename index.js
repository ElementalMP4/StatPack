const db = require('better-sqlite3')('stats.db');
const express = require('express');
const { createCanvas } = require('canvas');
const config = require("./config.json");

const readline = require("readline");
const { stat } = require('fs');
const consoleInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const app = express();

const DB_TABLE_EXISTS = "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'StatPack'";
const CREATE_TABLE = "CREATE TABLE StatPack (name TEXT, count INTEGER)";
const GET_STATISTIC = "SELECT * FROM StatPack WHERE name = ?";
const UPDATE_STATISTIC = "UPDATE StatPack SET count = ? WHERE name = ?";
const CREATE_STATISTIC = "INSERT INTO StatPack VALUES (?, 0)";
const DELETE_STATISTIC = "DELETE FROM StatPack WHERE name = ?";
const GET_ALL_STATS = "SELECT * FROM StatPack";

//Database Funtions

function createStat(name) {
    db.prepare(CREATE_STATISTIC).run(name);
}

function statExists(name) {
    return db.prepare(GET_STATISTIC).get(name) != undefined;
}

function updateStat(stat, count) {
    db.prepare(UPDATE_STATISTIC).run(count, stat);
}

function getStat(name) {
    return db.prepare(GET_STATISTIC).get(name);
}

function roundedClipBox(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.clip();
}

function generateImage(colour, count) {
    const canvas = createCanvas(500, 75);
    const ctx = canvas.getContext('2d');

    roundedClipBox(ctx, 0, 0, canvas.width, canvas.height, 10);
    ctx.fillStyle = "#3A3C3D";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 50px Sans";
    ctx.textAlign = "left";
    ctx.fillText("Views", 10, 55);

    roundedClipBox(ctx, 175, 0, 325, canvas.height, 10);
    ctx.fillStyle = colour;
    ctx.fillRect(175, 0, 325, canvas.height);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 50px Sans";
    ctx.textAlign = "left";
    ctx.fillText(count, 185, 55);

    return canvas.toDataURL("image/jpeg", 1);
}

function sendImage(col, count, res) {
    const colour = col ? "#" + col : "#4793D1";
    const image = generateImage(colour, count);
    const buffer = Buffer.from(image.split(",")[1], "base64");
    res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': buffer.length
    });
    res.end(buffer);
}

function handleStatRequest(req, res) {
    const returnTextOrImage = req.query.mode ? req.query.mode : "image";
    const statName = req.query.name;

    if (!statName) res.status(400).send("No stat name provided!");

    if (returnTextOrImage != "text" && returnTextOrImage != "image")
        res.status(400).send("Invalid mode specified. Should be 'text' or 'image'");

    let stat = getStat(statName);

    if (stat == undefined) {
        if (config.remote_create) {
            createStat(statName);
            if (returnTextOrImage == "text") res.status(200).send("0");
            else sendImage(req.query.colour, "0", res);
        } else res.status(404).send("Statistics not found for name '" + statName + "' and remote_create has been disabled.");
    } else {
        stat.count += 1;
        updateStat(stat.name, stat.count);
        if (returnTextOrImage == "text") res.status(200).send(stat.count.toString());
        else sendImage(req.query.colour, stat.count, res);
    }
}

function main() {
    app.get("/stat", handleStatRequest);
    app.listen(config.port);
    console.log("Listening on port " + config.port);
}

function createTable() {
    db.exec(CREATE_TABLE);
    console.log("Created! Starting...");
    main();
}

function checkForTable() {
    console.log("Checking for stats table...");
    const table = db.prepare(DB_TABLE_EXISTS).get();
    if (table == undefined) {
        console.log("No table found. Creating...");
        createTable();
    } else {
        console.log("Table found! Starting...");
        main();
    }
}

//Console Commands

function handleDeleteCommand(args) {
    const statName = args[0];
    const exists = statExists(statName);

    if (exists) {
        db.prepare(DELETE_STATISTIC).run(statName);
        console.log("Deleted stat '" + statName + "'");
    } else console.log("Couldn't find stat with name '" + statName + "'");
}

function handleListCommand() {
    const stats = db.prepare(GET_ALL_STATS).all();

    stats.forEach(stat => {
        console.log(stat.name + " - " + stat.count);
    });
}

function handleCreateCommand(args) {
    const statName = args[0];
    const exists = statExists(statName);

    if (exists) console.log("A stat with that name already exists!");
    else {
        createStat(statName);
        console.log("Stat created with name '" + statName + "'");
    }
}

function handleUpdateCommand(args) {
    if (args.length < 2) console.log("This command needs 2 arguments!");
    const name = args[0];
    const newCount = args[1];
    const exists = statExists(name);
    const num = Number(newCount);

    if (!exists) console.log("Couldn't find stat with name '" + statName + "'");
    else if (!Number.isInteger(num)) console.log("Provided count is not an integer!");
    else {
        updateStat(name, num);
        console.log("Set stat '" + name + "' to " + newCount);
    }
}

function handleGetCommand(args) {
    const statName = args[0];
    const exists = statExists(statName);

    if (exists) {
        const stat = getStat(statName);
        console.log(stat.name + " - " + stat.count);
    } else console.log("Couldn't find stat with name '" + statName + "'");
}

function handleResetCommand(args) {
    const statName = args[0];
    const exists = statExists(statName);

    if (!exists) console.log("Couldn't find a stat with name '" + statName + "'");
    else {
        updateStat(statName, 0);
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
list - shows all stats
help - shows this message\n`);
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
        default:
            console.log("Unknown command '" + command + "' - Try 'help'");
            break;
    }
}

function question() {
    consoleInterface.question("> ", function(inputString) {
        handleConsoleCommand(inputString);
        question();
    });
};

checkForTable();
question();