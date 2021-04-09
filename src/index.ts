/* eslint-disable no-unreachable */
/* eslint-disable no-unused-vars */
import LocalSqlite = require('better-sqlite3');

export interface SQLData {
  key: string;
  value: string | number | any;
}
export interface SQLRawData {
  MAIN_KEY: string;
  VALUE: string | number | any;
}
export interface TableInformation {
  type: string;
  name: string;
  tbl_name: string;
  rootpage: number;
  sql: string;
}
export interface AllSQLData {
  key: string;
  data: SQLData;
}
export type SQLDataValue = any;

export class Data {
  db: PromisedDatabase | Database;
  key: string;
  value: any;

  constructor(db: PromisedDatabase | Database, key: string, value: any) {
    this.db = db;
    this.key = key;
    this.value = value;
  }
}

export class Database {
  filename: string;
  options: LocalSqlite.Options;
  sqlite: LocalSqlite.Database;
  constructor(filename: string, options: LocalSqlite.Options) {
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
  set(table: string, key: string, value: any): Boolean {
    this._createTable(table);
    const check: Data | null = this.get(table, key);
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
  }

  /**
   * Returns a data from Database
   * @method
   * @param {String} table - The name of the table
   * @param {String} key - The name of the data
   */
  get(table: string, key: string): Data | null {
    if (typeof table !== 'string') this._expected('string', typeof table);
    if (typeof key !== 'string') this._expected('string', typeof key);

    this._createTable(table);
    const data: SQLRawData = this.sqlite.prepare(`SELECT * FROM ${table} WHERE MAIN_KEY = ?`).get(key);
    return this._parseValue(data) !== null ? new Data(this, data.MAIN_KEY, this._parseValue(data)) : null;
  }

  /**
   * Remove a data from Database
   * @method
   * @param {String} table - The name of the table
   * @param {String} key - The name of the data
   */
  delete(table: string, key: string): Boolean {
    if (typeof table !== 'string') this._expected('string', typeof table);
    if (typeof key !== 'string') this._expected('string', typeof key);

    this._createTable(table);
    try {
      this.sqlite.prepare(`DELETE FROM ${table} WHERE MAIN_KEY = ? LIMIT 1`).run(key);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Returns an Array of data from the Table
   * @method
   * @param {String} table - The name of the Table
   * @returns {AllSQLData[]}
   */
  all(table: string): AllSQLData[] {
    if (typeof table !== 'string') this._expected('string', typeof table);
    this._createTable(table);
    const data: AllSQLData[] = this.sqlite
      .prepare(`SELECT * FROM ${table}`)
      .all()
      .map((f) => {
        const sqldata: SQLRawData = f;
        const obj: AllSQLData = {
          key: sqldata.MAIN_KEY,
          data: { key: sqldata.MAIN_KEY, value: this._parseValue(sqldata) },
        };
        return obj;
      });

    if (!data.length) this._deleteTableIfEmpty(table);

    return data;
  }

  /**
   * Removes the entire Tables with its contents from the Database
   */
  clearDatabase(): Boolean {
    const tables = this.sqlite
      .prepare('SELECT name FROM sqlite_master WHERE type=?')
      .all('table')
      .map((d) => d.name);

    try {
      for (const t of tables) {
        this.sqlite.prepare(`DROP TABLE ${t}`).run();
      }
      return true;
    } catch (_) {
      return false;
    }
  }

  /**
   * Removes the entire data from the Table
   * @method
   * @param {String} table - The name of the table
   */
  clearTable(table: string): void {
    if (typeof table !== 'string') this._expected('string', typeof table);
    this.sqlite.prepare(`DELETE FROM ${table}`).run();
  }

  /**
   * Remove the table from the database
   * @method
   * @param {String} table - The name of the table
   */
  deleteTable(table: string): void {
    if (typeof table !== 'string') this._expected('string', typeof table);
    this.sqlite.prepare(`DROP TABLE ${table}`).run();
  }

  /**
   * Returns Information about all the created Tables in the Database
   */
  getTables(): TableInformation[] {
    const tables: TableInformation[] = this.sqlite.prepare("SELECT * FROM sqlite_master WHERE type='table'").all();

    return tables;
  }

  _expected(expected: string, received: string) {
    throw new TypeError(
      `Expected \u001b[32;1m${expected}\u001b[0m, instead received \u001b[31;1m${received}\u001b[31;1m.`,
    );
  }

  _insertInto(table: string, column: string, value: any) {
    if (typeof table !== 'string') this._expected('string', typeof table);
    if (typeof column !== 'string') this._expected('string', typeof column);
    this.sqlite.prepare(`INSERT INTO ${table} VALUES (?, ?)`).run(column, JSON.stringify(value));
  }

  _createTable(table: string) {
    if (typeof table !== 'string') this._expected('string', typeof table);
    this.sqlite.prepare(`CREATE TABLE IF NOT EXISTS ${table} (MAIN_KEY TEXT, VALUE BLOB)`).run();
  }

  _deleteTableIfEmpty(table: string) {
    if (typeof table !== 'string') this._expected('string', typeof table);
    this.sqlite.prepare(`DROP TABLE IF EXISTS ${table}`).run();
  }

  _insertIntoWithWhere(table: string, column: string, value: any) {
    if (typeof table !== 'string') this._expected('string', typeof table);
    if (typeof column !== 'string') this._expected('string', typeof column);
    this.sqlite.prepare(`UPDATE ${table} SET VALUE = ? WHERE MAIN_KEY = ?`).run(JSON.stringify(value), column);
  }

  _parseValue(value: SQLRawData) {
    if (!value) return null;

    try {
      return JSON.parse(value.VALUE);
    } catch {
      return value.VALUE;
    }
  }
}

/* Promised Database Version */

export class PromisedDatabase {
  filename: string;
  options: LocalSqlite.Options;
  sqlite: LocalSqlite.Database;
  constructor(filename: string, options: LocalSqlite.Options) {
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
  async set(table: string, key: string, value: any): Promise<Boolean> {
    this._createTable(table);
    const check: SQLRawData = this.sqlite.prepare(`SELECT * FROM ${table} WHERE MAIN_KEY = ?`).get(key);
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
  }

  /**
   * Returns a data from Database
   * @method
   * @param {String} table - The name of the table
   * @param {String} key - The name of the data
   */
  async get(table: string, key: string): Promise<Data | null> {
    if (typeof table !== 'string') this._expected('string', typeof table);
    if (typeof key !== 'string') this._expected('string', typeof key);

    this._createTable(table);
    const data: SQLRawData = this.sqlite.prepare(`SELECT * FROM ${table} WHERE MAIN_KEY = ?`).get(key);
    return this._parseValue(data) !== null ? new Data(this, data.MAIN_KEY, this._parseValue(data)) : null;
  }

  /**
   * Remove a data from Database
   * @method
   * @param {String} table - The name of the table
   * @param {String} key - The name of the data
   */
  async delete(table: string, key: string): Promise<Boolean> {
    if (typeof table !== 'string') this._expected('string', typeof table);
    if (typeof key !== 'string') this._expected('string', typeof key);

    this._createTable(table);
    try {
      this.sqlite.prepare(`DELETE FROM ${table} WHERE MAIN_KEY = ? LIMIT 1`).run(key);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Returns an Array of data from the Table
   * @method
   * @param {String} table - The name of the Table
   * @returns {AllSQLData[]}
   */
  async all(table: string): Promise<AllSQLData[]> {
    if (typeof table !== 'string') this._expected('string', typeof table);
    this._createTable(table);
    const data: AllSQLData[] = this.sqlite
      .prepare(`SELECT * FROM ${table}`)
      .all()
      .map((f) => {
        const sqldata: SQLRawData = f;
        const obj: AllSQLData = {
          key: sqldata.MAIN_KEY,
          data: { key: sqldata.MAIN_KEY, value: this._parseValue(sqldata) },
        };
        return obj;
      });

    if (!data.length) this._deleteTableIfEmpty(table);

    return data;
  }

  /**
   * Removes the entire Tables with its contents from the Database
   */
  async clearDatabase(): Promise<Boolean> {
    const tables = this.sqlite
      .prepare('SELECT name FROM sqlite_master WHERE type=?')
      .all('table')
      .map((d) => d.name);

    try {
      for (const t of tables) {
        this.sqlite.prepare(`DROP TABLE ${t}`).run();
      }
      return true;
    } catch (_) {
      return false;
    }
  }

  /**
   * Removes the entire data from the Table
   * @method
   * @param {String} table - The name of the table
   */
  async clearTable(table: string): Promise<void> {
    if (typeof table !== 'string') this._expected('string', typeof table);
    this.sqlite.prepare(`DELETE FROM ${table}`).run();
  }

  /**
   * Remove the table from the database
   * @method
   * @param {String} table - The name of the table
   */
  async deleteTable(table: string): Promise<void> {
    if (typeof table !== 'string') this._expected('string', typeof table);
    this.sqlite.prepare(`DROP TABLE ${table}`).run();
  }

  /**
   * Returns Information about all the created Tables in the Database
   */
  async getTables(): Promise<TableInformation[]> {
    const tables: TableInformation[] = this.sqlite.prepare("SELECT * FROM sqlite_master WHERE type='table'").all();

    return tables;
  }

  _expected(expected: string, received: string) {
    throw new TypeError(
      `Expected \u001b[32;1m${expected}\u001b[0m, instead received \u001b[31;1m${received}\u001b[31;1m.`,
    );
  }

  _insertInto(table: string, column: string, value: any) {
    if (typeof table !== 'string') this._expected('string', typeof table);
    if (typeof column !== 'string') this._expected('string', typeof column);
    this.sqlite.prepare(`INSERT INTO ${table} VALUES (?, ?)`).run(column, JSON.stringify(value));
  }

  _createTable(table: string) {
    if (typeof table !== 'string') this._expected('string', typeof table);
    this.sqlite.prepare(`CREATE TABLE IF NOT EXISTS ${table} (MAIN_KEY TEXT, VALUE BLOB)`).run();
  }

  _deleteTableIfEmpty(table: string) {
    if (typeof table !== 'string') this._expected('string', typeof table);
    this.sqlite.prepare(`DROP TABLE IF EXISTS ${table}`).run();
  }

  _insertIntoWithWhere(table: string, column: string, value: any) {
    if (typeof table !== 'string') this._expected('string', typeof table);
    if (typeof column !== 'string') this._expected('string', typeof column);
    this.sqlite.prepare(`UPDATE ${table} SET VALUE = ? WHERE MAIN_KEY = ?`).run(JSON.stringify(value), column);
  }

  _parseValue(value: SQLRawData) {
    if (!value) return null;

    try {
      return JSON.parse(value.VALUE);
    } catch {
      return value.VALUE;
    }
  }
}
