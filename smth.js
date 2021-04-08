const dbd = require("dbdjs.db")
const db = new dbd.Database({path:"./database", tables:[{name:"test"}]});

db.on("ready", () => console.log("db ready"))