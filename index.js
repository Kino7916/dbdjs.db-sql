const database = require("./src/index.js")
const db = new database.Database("database.sql")

db.set("users", "Kino", {hello:"World"})
console.log(db)