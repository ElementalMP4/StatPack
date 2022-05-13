const consoleInterface = require("./console");
const databaseOps = require("./database_operations");
const express = require('express');
const config = require("./config.json");

const { createCanvas } = require('canvas');

const app = express();

//Image manipulation functions
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

    ctx.globalCompositeOperation = "screen";
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

    return canvas.toDataURL("image/png", 1);
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

//Handle incoming requests
function handleStatRequest(req, res) {
    const returnTextOrImage = req.query.mode ? req.query.mode : "image";
    const statName = req.query.name;

    if (!statName) res.status(400).send("No stat name provided!");

    if (returnTextOrImage != "text" && returnTextOrImage != "image")
        res.status(400).send("Invalid mode specified. Should be 'text' or 'image'");

    let stat = databaseOps.getStat(statName);

    if (stat == undefined) {
        if (config.remote_create) {
            databaseOps.createStat(statName);
            if (returnTextOrImage == "text") res.status(200).send("0");
            else sendImage(req.query.colour, "0", res);
        } else res.status(404).send("Statistics not found for name '" + statName + "' and remote_create has been disabled.");
    } else {
        stat.count += 1;
        databaseOps.updateStat(stat.name, stat.count);
        if (returnTextOrImage == "text") res.status(200).send(stat.count.toString());
        else sendImage(req.query.colour, stat.count, res);
    }
}

//Start the webserver and listen for console commands
function main() {
    app.get("/stat", handleStatRequest);
    app.listen(config.port);
    console.log("Listening on port " + config.port);
    consoleInterface.listenForCommands(databaseOps);
}

function createTable() {
    databaseOps.createTable();
    console.log("Created! Starting...");
    main();
}

function checkForTable() {
    console.log("Checking for stats table...");
    if (databaseOps.tableExists()) {
        console.log("Table found! Starting...");
        main();
    } else {
        console.log("No table found. Creating...");
        createTable();
    }
}

//The first thing to do is check for the database table.
checkForTable();