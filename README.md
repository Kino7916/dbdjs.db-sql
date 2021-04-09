  <br />
    <p>
    <a href="https://dbd.leref.ga"><img src="https://cdn.discordapp.com/attachments/804505335397744650/816746774571515914/dbdjs.png" alt="dbd.js" /></a>
  </p>

[![NPM Downloads](https://img.shields.io/npm/dt/dbd.js.svg?maxAge=3600)](https://www.npmjs.com/package/dbd.js)
[![Discord Server](https://img.shields.io/discord/773352845738115102?color=7289da&logo=discord&logoColor=white)](https://dbd.js.org/invite)
[![Repo License](https://img.shields.io/github/license/Kino7916/dbdjs.db-sql)](https://github.com/Kino7916/dbdjs.db-sql)
[![Package Version](https://img.shields.io/npm/v/dbdjs.db-sql)](https://npmjs.com/package/dbd.js-sql)
# dbdjs.db-sql
A SQLite version of dbdjs.db, wrapper of better-sqlite3

## Table of Contents
- [Changelog](#changelog)
- [About](#about)
  - [Setup](#setup)
  - [API](#api)
  - [Interfaces](#interfaces)
- [License](#license)

## Changelog
- Fixed `clearDatabase` and `clearTable` not running
- Changed `_parseValue` system
- Added `Database.deleteTable(table: string)`

## About
[dbdjs.db-sql](https://npmjs.com/package/dbd.js-sql) is a SQLite version of [dbdjs.db](https://npmjs.com/package/dbdjs.db), which was a database for [dbd.js](https://npmjs.com/package/dbd.js) version 3.0.0+. 
This package is a wrapper of [better-sqlite3](https://npmjs.com/package/better-sqlite3), a better version of [node-sqlite3](https://npmjs.com/package/sqlite3).
This package was made with TypeScript and was compiled with [typescript](https://npmjs.com/package/typescript) to JavaScript ES5, which it's JavaScript code was operateable in old browsers ( typescript package explanation ).

## Setup
```js
const Package = require("dbdjs.db-sql")
const db = new Package.Database("database.sql", { timeout: 5000 })
```

## API
- Package.Database(filename: string[, [Interfaces.Options](#interfaces)]): Database - Initializing class Database
- Database.set(table: string, key: string, value: any): none - Creating/Updating the value of a created/existing data
- Database.get(table: string, key: string): SQLData - Return a data with matching key from the Database
- Database.delete(table:string, key: string): none - Remove a data with matching key from the Database
- Database.fetchAll(table: string): [Interfaces.SQLData[]](#interfaces) - Returns an Array of data in the Table
- Database.getTables(): [Interfaces.TableInformation[]](#interfaces) - Returns an Array of Information about Tables from the Database
- Database.clearTable(table: string): none - Removes the entire data of the Table
- Database.clearDatabase(): none - Removes the entire table from the Database with it's contents
- Database.deleteTable(table: string): none - Remove table from the database

## Interfaces
### Options ( [BetterSqlite3.Options](https://github.com/JoshuaWise/better-sqlite3/blob/HEAD/docs/api.md#new-databasepath-options) )
  - readonly?: boolean - open the database connection in readonly mode (default: `false`).
  - fileMustExist?: boolean - if the database does not exist, an Error will be thrown instead of creating a new file. This option does not affect in-memory or readonly database connections (default: `false`).
  - timeout?: number - the number of milliseconds to wait when executing queries on a locked database, before throwing a SQLITE_BUSY error (default: `5000`).
  - verbose?: function | null - provide a function that gets called with every SQL string executed by the database connection (default: `null`).
### SQLData
  - key: string - The key of data
  - value: any - The value of data
### TableInformation
  - type: string - The type of information
  - name: string - The table name
  - tbl_name: string - The table name
  - rootpage: number
  - sql: string - The query which creates the table

## License
See [LICENSE](https://github.com/Kino7916/dbdjs.db-sql/blob/master/LICENSE) file in the Github Repository for License.
