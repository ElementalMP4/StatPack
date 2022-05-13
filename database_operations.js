const db = require('better-sqlite3')('stats.db');

const DB_TABLE_EXISTS = "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'StatPack'";
const CREATE_TABLE = "CREATE TABLE StatPack (name TEXT, count INTEGER)";
const GET_STATISTIC = "SELECT * FROM StatPack WHERE name = ?";
const UPDATE_STATISTIC = "UPDATE StatPack SET count = ? WHERE name = ?";
const CREATE_STATISTIC = "INSERT INTO StatPack VALUES (?, 0)";
const DELETE_STATISTIC = "DELETE FROM StatPack WHERE name = ?";
const GET_ALL_STATS = "SELECT * FROM StatPack";

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

function createTable() {
    db.exec(CREATE_TABLE);
}

function tableExists() {
    return db.prepare(DB_TABLE_EXISTS).get() != undefined;
}

function deleteStat(statName) {
    db.prepare(DELETE_STATISTIC).run(statName);
}

function getAllStats() {
    return db.prepare(GET_ALL_STATS).all();
}

module.exports = {
    DB_TABLE_EXISTS: DB_TABLE_EXISTS,
    CREATE_TABLE: CREATE_TABLE,
    GET_STATISTIC: GET_STATISTIC,
    UPDATE_STATISTIC: UPDATE_STATISTIC,
    CREATE_STATISTIC: CREATE_STATISTIC,
    DELETE_STATISTIC: DELETE_STATISTIC,
    GET_ALL_STATS: GET_ALL_STATS,
    createStat: createStat,
    statExists: statExists,
    updateStat: updateStat,
    getStat: getStat,
    createTable: createTable,
    tableExists: tableExists,
    deleteStat: deleteStat,
    getAllStats: getAllStats,
    db: db
};