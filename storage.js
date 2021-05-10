const sqlite3 = require('sqlite3').verbose();

module.exports = {
    InitDB: async function (db) {
        db.serialize(() => {
            db.run("CREATE TABLE IF NOT EXISTS " +
                "servers (id TEXT PRIMARY KEY)");

            db.run("CREATE TABLE IF NOT EXISTS " +
                "users (id TEXT PRIMARY KEY," +
                "username TEXT," +
                "server TEXT," +
                "FOREIGN KEY (server) REFERENCES servers(id))");

            db.run("CREATE TABLE IF NOT EXISTS " +
                "commands (id INTEGER PRIMARY KEY AUTOINCREMENT," +
                "command TEXT," +
                "argument TEXT," +
                "date INTEGER," +
                "user TEXT," +
                "server TEXT," +
                "FOREIGN KEY (user) REFERENCES users(id)," +
                "FOREIGN KEY (server) REFERENCES servers(id))");
        });
    },
    SaveCommand: async function (db, serverId, user, command, argument) {
        db.serialize(() => {
            db.run("INSERT OR IGNORE INTO servers (id) VALUES (?)", [serverId]);
            db.run("INSERT OR IGNORE INTO users (id, username, server) VALUES (?,?,?)", [user.id, user.username, serverId]);
            db.run("INSERT INTO commands (server,user,command,argument,date) VALUES (?,?,?,?,?)", [serverId, user.id, command, argument, Date.now()]);
        });
    },
}