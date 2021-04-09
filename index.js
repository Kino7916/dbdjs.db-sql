const database = require("./src/index.js")
const db = new database.Database("database.sql")

db.set("users", "kino", "123")
console.log(db.get("users", "kino"))