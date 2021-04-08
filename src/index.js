"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
var LocalSqlite = require("better-sqlite3");
var JSON = globalThis.JSON;
var Database = /** @class */ (function () {
    function Database(filename, options) {
        this.filename = filename;
        this.options = options;
        this.sqlite = new LocalSqlite(this.filename, this.options);
    }
    /**
     * Creating/Updating the value of an existing data with key
     * @method
     * @param {String} table - The name of the table
     * @param {String} key - The name of the data
     * @param {any} value - The value of the data with key
     */
    Database.prototype.set = function (table, key, value) {
        this._createTable(table);
        var check = this.get(table, key);
        if (check) {
            this._insertIntoWithWhere(table, key, value);
        }
        else {
            this._insertInto(table, key, value);
        }
    };
    /**
     * Returns a data from Database
     * @method
     * @param {String} table - The name of the table
     * @param {String} key - The name of the data
     */
    Database.prototype.get = function (table, key) {
        if (typeof table !== 'string')
            this._expected('string', typeof table);
        if (typeof key !== 'string')
            this._expected('string', typeof key);
        var data = this.sqlite.prepare("SELECT * FROM " + table + " WHERE MAIN_KEY = ?").get(key);
        return this._parseValue(data.VALUE);
    };
    /**
     * Deletes a data from Database
     * @method
     * @param {String} table - The name of the table
     * @param {String} key - The name of the data
     */
    Database.prototype.delete = function (table, key) {
        if (typeof table !== 'string')
            this._expected('string', typeof table);
        if (typeof key !== 'string')
            this._expected('string', typeof key);
        this.sqlite.prepare("DELETE FROM " + table + " WHERE MAIN_KEY = ? LIMIT 1").run(key);
    };
    /**
     * Returns an Array of data from the Table
     * @method
     * @param {String} table - The name of the Table
     * @returns {SQLData[]}
     */
    Database.prototype.all = function (table) {
        var _this = this;
        if (typeof table !== 'string')
            this._expected('string', typeof table);
        var data = this.sqlite
            .prepare("SELECT * FROM " + table)
            .all()
            .map(function (f) {
            var sqldata = f;
            var obj = { key: '', value: '' };
            obj.key = sqldata.MAIN_KEY;
            obj.value = _this._parseValue(sqldata.VALUE);
            return obj;
        });
        return data;
    };
    /**
     * Deletes the entire Tables with its contents from the Database
     */
    Database.prototype.clearDatabase = function () {
        var tables = this.sqlite
            .prepare('SELECT name FROM sqlite_master WHERE type=?')
            .all('table')
            .map(function (d) { return d.name; });
        for (var _i = 0, tables_1 = tables; _i < tables_1.length; _i++) {
            var t = tables_1[_i];
            this.sqlite.prepare("DROP TABLE " + t);
        }
    };
    /**
     * Deletes the entire data from the Table
     * @method
     * @param {String} table - The name of the table
     */
    Database.prototype.clearTable = function (table) {
        if (typeof table !== 'string')
            this._expected('string', typeof table);
        this.sqlite.prepare("DELETE FROM " + table);
    };
    /**
     * Returns Information about all the created Tables in the Database
     */
    Database.prototype.getTables = function () {
        var tables = this.sqlite.prepare("SELECT * FROM sqlite_master WHERE type='table'").all();
        return tables;
    };
    Database.prototype._expected = function (expected, received) {
        throw new TypeError("Expected \u001B[32;1m" + expected + "\u001B[0m, instead received \u001B[31;1m" + received + "\u001B[31;1m.");
    };
    Database.prototype._insertInto = function (table, column, value) {
        if (typeof table !== 'string')
            this._expected('string', typeof table);
        if (typeof column !== 'string')
            this._expected('string', typeof column);
        this.sqlite
            .prepare("INSERT INTO " + table + " VALUES (?, ?)")
            .run(column, typeof value === 'object' || Array.isArray(value) ? JSON.stringify(value) : value);
    };
    Database.prototype._createTable = function (table) {
        if (typeof table !== 'string')
            this._expected('string', typeof table);
        this.sqlite.prepare("CREATE TABLE IF NOT EXISTS " + table + " (MAIN_KEY TEXT, VALUE BLOB)").run();
    };
    Database.prototype._insertIntoWithWhere = function (table, column, value) {
        if (typeof table !== 'string')
            this._expected('string', typeof table);
        if (typeof column !== 'string')
            this._expected('string', typeof column);
        this.sqlite
            .prepare("UPDATE " + table + "  SET VALUE = ? WHERE MAIN_KEY = ?")
            .run(typeof value === 'object' || Array.isArray(value) ? JSON.stringify(value) : value, column);
    };
    Database.prototype._parseValue = function (value) {
        if (!value)
            return null;
        if (typeof value === 'string') {
            return JSON.parse(value);
        }
        else {
            return value;
        }
    };
    return Database;
}());
exports.Database = Database;
