const database = require("./src/index.js")
const db = new database.Database("database.sql")

console.log(db.get("users", "kino", "test"))