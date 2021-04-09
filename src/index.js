'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g;
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === 'function' &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError('Generator is already executing.');
      while (_)
        try {
          if (
            ((f = 1),
            y &&
              (t = op[0] & 2 ? y['return'] : op[0] ? y['throw'] || ((t = y['return']) && t.call(y), 0) : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (!((t = _.trys), (t = t.length > 0 && t[t.length - 1])) && (op[0] === 6 || op[0] === 2)) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.PromisedDatabase = exports.Database = exports.Data = void 0;
/* eslint-disable no-unreachable */
/* eslint-disable no-unused-vars */
var LocalSqlite = require('better-sqlite3');
var Data = /** @class */ (function () {
  function Data(db, key, value) {
    this.db = db;
    this.key = key;
    this.value = value;
  }
  return Data;
})();
exports.Data = Data;
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
    try {
      if (check) {
        this._insertIntoWithWhere(table, key, value);
      } else {
        this._insertInto(table, key, value);
      }
      return true;
    } catch (error) {
      return false;
    }
  };
  /**
   * Returns a data from Database
   * @method
   * @param {String} table - The name of the table
   * @param {String} key - The name of the data
   */
  Database.prototype.get = function (table, key) {
    if (typeof table !== 'string') this._expected('string', typeof table);
    if (typeof key !== 'string') this._expected('string', typeof key);
    this._createTable(table);
    var data = this.sqlite.prepare('SELECT * FROM ' + table + ' WHERE MAIN_KEY = ?').get(key);
    return this._parseValue(data) !== null ? new Data(this, data.MAIN_KEY, this._parseValue(data)) : null;
  };
  /**
   * Remove a data from Database
   * @method
   * @param {String} table - The name of the table
   * @param {String} key - The name of the data
   */
  Database.prototype.delete = function (table, key) {
    if (typeof table !== 'string') this._expected('string', typeof table);
    if (typeof key !== 'string') this._expected('string', typeof key);
    this._createTable(table);
    try {
      this.sqlite.prepare('DELETE FROM ' + table + ' WHERE MAIN_KEY = ? LIMIT 1').run(key);
      return true;
    } catch (error) {
      return false;
    }
  };
  /**
   * Returns an Array of data from the Table
   * @method
   * @param {String} table - The name of the Table
   * @returns {AllSQLData[]}
   */
  Database.prototype.all = function (table) {
    var _this = this;
    if (typeof table !== 'string') this._expected('string', typeof table);
    this._createTable(table);
    var data = this.sqlite
      .prepare('SELECT * FROM ' + table)
      .all()
      .map(function (f) {
        var sqldata = f;
        var obj = {
          key: sqldata.MAIN_KEY,
          data: { key: sqldata.MAIN_KEY, value: _this._parseValue(sqldata) },
        };
        return obj;
      });
    if (!data.length) this._deleteTableIfEmpty(table);
    return data;
  };
  /**
   * Removes the entire Tables with its contents from the Database
   */
  Database.prototype.clearDatabase = function () {
    var tables = this.sqlite
      .prepare('SELECT name FROM sqlite_master WHERE type=?')
      .all('table')
      .map(function (d) {
        return d.name;
      });
    try {
      for (var _i = 0, tables_1 = tables; _i < tables_1.length; _i++) {
        var t = tables_1[_i];
        this.sqlite.prepare('DROP TABLE ' + t).run();
      }
      return true;
    } catch (_) {
      return false;
    }
  };
  /**
   * Removes the entire data from the Table
   * @method
   * @param {String} table - The name of the table
   */
  Database.prototype.clearTable = function (table) {
    if (typeof table !== 'string') this._expected('string', typeof table);
    this.sqlite.prepare('DELETE FROM ' + table).run();
  };
  /**
   * Remove the table from the database
   * @method
   * @param {String} table - The name of the table
   */
  Database.prototype.deleteTable = function (table) {
    if (typeof table !== 'string') this._expected('string', typeof table);
    this.sqlite.prepare('DROP TABLE ' + table).run();
  };
  /**
   * Returns Information about all the created Tables in the Database
   */
  Database.prototype.getTables = function () {
    var tables = this.sqlite.prepare("SELECT * FROM sqlite_master WHERE type='table'").all();
    return tables;
  };
  Database.prototype._expected = function (expected, received) {
    throw new TypeError(
      'Expected \u001B[32;1m' + expected + '\u001B[0m, instead received \u001B[31;1m' + received + '\u001B[31;1m.',
    );
  };
  Database.prototype._insertInto = function (table, column, value) {
    if (typeof table !== 'string') this._expected('string', typeof table);
    if (typeof column !== 'string') this._expected('string', typeof column);
    this.sqlite.prepare('INSERT INTO ' + table + ' VALUES (?, ?)').run(column, JSON.stringify(value));
  };
  Database.prototype._createTable = function (table) {
    if (typeof table !== 'string') this._expected('string', typeof table);
    this.sqlite.prepare('CREATE TABLE IF NOT EXISTS ' + table + ' (MAIN_KEY TEXT, VALUE BLOB)').run();
  };
  Database.prototype._deleteTableIfEmpty = function (table) {
    if (typeof table !== 'string') this._expected('string', typeof table);
    this.sqlite.prepare('DROP TABLE IF EXISTS ' + table).run();
  };
  Database.prototype._insertIntoWithWhere = function (table, column, value) {
    if (typeof table !== 'string') this._expected('string', typeof table);
    if (typeof column !== 'string') this._expected('string', typeof column);
    this.sqlite.prepare('UPDATE ' + table + ' SET VALUE = ? WHERE MAIN_KEY = ?').run(JSON.stringify(value), column);
  };
  Database.prototype._parseValue = function (value) {
    if (!value) return null;
    try {
      return JSON.parse(value.VALUE);
    } catch (_a) {
      return value.VALUE;
    }
  };
  return Database;
})();
exports.Database = Database;
/* Promised Database Version */
var PromisedDatabase = /** @class */ (function () {
  function PromisedDatabase(filename, options) {
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
  PromisedDatabase.prototype.set = function (table, key, value) {
    return __awaiter(this, void 0, void 0, function () {
      var check;
      return __generator(this, function (_a) {
        this._createTable(table);
        check = this.sqlite.prepare('SELECT * FROM ' + table + ' WHERE MAIN_KEY = ?').get(key);
        try {
          if (check) {
            this._insertIntoWithWhere(table, key, value);
          } else {
            this._insertInto(table, key, value);
          }
          return [2 /*return*/, true];
        } catch (error) {
          return [2 /*return*/, false];
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Returns a data from Database
   * @method
   * @param {String} table - The name of the table
   * @param {String} key - The name of the data
   */
  PromisedDatabase.prototype.get = function (table, key) {
    return __awaiter(this, void 0, void 0, function () {
      var data;
      return __generator(this, function (_a) {
        if (typeof table !== 'string') this._expected('string', typeof table);
        if (typeof key !== 'string') this._expected('string', typeof key);
        this._createTable(table);
        data = this.sqlite.prepare('SELECT * FROM ' + table + ' WHERE MAIN_KEY = ?').get(key);
        return [
          2 /*return*/,
          this._parseValue(data) !== null ? new Data(this, data.MAIN_KEY, this._parseValue(data)) : null,
        ];
      });
    });
  };
  /**
   * Remove a data from Database
   * @method
   * @param {String} table - The name of the table
   * @param {String} key - The name of the data
   */
  PromisedDatabase.prototype.delete = function (table, key) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        if (typeof table !== 'string') this._expected('string', typeof table);
        if (typeof key !== 'string') this._expected('string', typeof key);
        this._createTable(table);
        try {
          this.sqlite.prepare('DELETE FROM ' + table + ' WHERE MAIN_KEY = ? LIMIT 1').run(key);
          return [2 /*return*/, true];
        } catch (error) {
          return [2 /*return*/, false];
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Returns an Array of data from the Table
   * @method
   * @param {String} table - The name of the Table
   * @returns {AllSQLData[]}
   */
  PromisedDatabase.prototype.all = function (table) {
    return __awaiter(this, void 0, void 0, function () {
      var data;
      var _this = this;
      return __generator(this, function (_a) {
        if (typeof table !== 'string') this._expected('string', typeof table);
        this._createTable(table);
        data = this.sqlite
          .prepare('SELECT * FROM ' + table)
          .all()
          .map(function (f) {
            var sqldata = f;
            var obj = {
              key: sqldata.MAIN_KEY,
              data: { key: sqldata.MAIN_KEY, value: _this._parseValue(sqldata) },
            };
            return obj;
          });
        if (!data.length) this._deleteTableIfEmpty(table);
        return [2 /*return*/, data];
      });
    });
  };
  /**
   * Removes the entire Tables with its contents from the Database
   */
  PromisedDatabase.prototype.clearDatabase = function () {
    return __awaiter(this, void 0, void 0, function () {
      var tables, _i, tables_2, t;
      return __generator(this, function (_a) {
        tables = this.sqlite
          .prepare('SELECT name FROM sqlite_master WHERE type=?')
          .all('table')
          .map(function (d) {
            return d.name;
          });
        try {
          for (_i = 0, tables_2 = tables; _i < tables_2.length; _i++) {
            t = tables_2[_i];
            this.sqlite.prepare('DROP TABLE ' + t).run();
          }
          return [2 /*return*/, true];
        } catch (_) {
          return [2 /*return*/, false];
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Removes the entire data from the Table
   * @method
   * @param {String} table - The name of the table
   */
  PromisedDatabase.prototype.clearTable = function (table) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        if (typeof table !== 'string') this._expected('string', typeof table);
        this.sqlite.prepare('DELETE FROM ' + table).run();
        return [2 /*return*/];
      });
    });
  };
  /**
   * Remove the table from the database
   * @method
   * @param {String} table - The name of the table
   */
  PromisedDatabase.prototype.deleteTable = function (table) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        if (typeof table !== 'string') this._expected('string', typeof table);
        this.sqlite.prepare('DROP TABLE ' + table).run();
        return [2 /*return*/];
      });
    });
  };
  /**
   * Returns Information about all the created Tables in the Database
   */
  PromisedDatabase.prototype.getTables = function () {
    return __awaiter(this, void 0, void 0, function () {
      var tables;
      return __generator(this, function (_a) {
        tables = this.sqlite.prepare("SELECT * FROM sqlite_master WHERE type='table'").all();
        return [2 /*return*/, tables];
      });
    });
  };
  PromisedDatabase.prototype._expected = function (expected, received) {
    throw new TypeError(
      'Expected \u001B[32;1m' + expected + '\u001B[0m, instead received \u001B[31;1m' + received + '\u001B[31;1m.',
    );
  };
  PromisedDatabase.prototype._insertInto = function (table, column, value) {
    if (typeof table !== 'string') this._expected('string', typeof table);
    if (typeof column !== 'string') this._expected('string', typeof column);
    this.sqlite.prepare('INSERT INTO ' + table + ' VALUES (?, ?)').run(column, JSON.stringify(value));
  };
  PromisedDatabase.prototype._createTable = function (table) {
    if (typeof table !== 'string') this._expected('string', typeof table);
    this.sqlite.prepare('CREATE TABLE IF NOT EXISTS ' + table + ' (MAIN_KEY TEXT, VALUE BLOB)').run();
  };
  PromisedDatabase.prototype._deleteTableIfEmpty = function (table) {
    if (typeof table !== 'string') this._expected('string', typeof table);
    this.sqlite.prepare('DROP TABLE IF EXISTS ' + table).run();
  };
  PromisedDatabase.prototype._insertIntoWithWhere = function (table, column, value) {
    if (typeof table !== 'string') this._expected('string', typeof table);
    if (typeof column !== 'string') this._expected('string', typeof column);
    this.sqlite.prepare('UPDATE ' + table + ' SET VALUE = ? WHERE MAIN_KEY = ?').run(JSON.stringify(value), column);
  };
  PromisedDatabase.prototype._parseValue = function (value) {
    if (!value) return null;
    try {
      return JSON.parse(value.VALUE);
    } catch (_a) {
      return value.VALUE;
    }
  };
  return PromisedDatabase;
})();
exports.PromisedDatabase = PromisedDatabase;
