import LocalSqlite = require('better-sqlite3');

/* Time to Live update */
export interface TimeToLive {
  START: Date | number;
  END: Date | number;
}
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
export type SQLDataValue = any;

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
  set(table: string, key: string, value: any) {
    this._createTable(table);
    const check: SQLData = this.get(table, key);
    if (check) {
      this._insertIntoWithWhere(table, key, value);
    } else {
      this._insertInto(table, key, value);
    }
  }

  /**
   * Returns a data from Database
   * @method
   * @param {String} table - The name of the table
   * @param {String} key - The name of the data
   */
  get(table: string, key: string) {
    if (typeof table !== 'string') this._expected('string', typeof table);
    if (typeof key !== 'string') this._expected('string', typeof key);

    this._createTable(table);
    const data: SQLRawData = this.sqlite.prepare(`SELECT * FROM ${table} WHERE MAIN_KEY = ?`).get(key);
    return this._parseValue(data);
  }

  /**
   * Remove a data from Database
   * @method
   * @param {String} table - The name of the table
   * @param {String} key - The name of the data
   */
  delete(table: string, key: string) {
    if (typeof table !== 'string') this._expected('string', typeof table);
    if (typeof key !== 'string') this._expected('string', typeof key);

    this._createTable(table);
    this.sqlite.prepare(`DELETE FROM ${table} WHERE MAIN_KEY = ? LIMIT 1`).run(key);
  }

  /**
   * Returns an Array of data from the Table
   * @method
   * @param {String} table - The name of the Table
   * @returns {SQLData[]}
   */
  all(table: string) {
    if (typeof table !== 'string') this._expected('string', typeof table);
    this._createTable(table);
    const data: SQLData[] = this.sqlite
      .prepare(`SELECT * FROM ${table}`)
      .all()
      .map((f) => {
        const sqldata: SQLRawData = f;
        const obj: SQLData = { key: '', value: '' };
        obj.key = sqldata.MAIN_KEY;
        obj.value = this._parseValue(sqldata);
        return obj;
      });

    if (!data.length) this._deleteTableIfEmpty(table);

    return data;
  }

  /**
   * Removes the entire Tables with its contents from the Database
   */
  clearDatabase() {
    const tables = this.sqlite
      .prepare('SELECT name FROM sqlite_master WHERE type=?')
      .all('table')
      .map((d) => d.name);

    for (const t of tables) {
      this.sqlite.prepare(`DROP TABLE ${t}`).run();
    }
  }

  /**
   * Removes the entire data from the Table
   * @method
   * @param {String} table - The name of the table
   */
  clearTable(table: string) {
    if (typeof table !== 'string') this._expected('string', typeof table);
    this.sqlite.prepare(`DELETE FROM ${table}`).run();
  }

  /**
   * Remove the table from the database
   * @method
   * @param {String} table - The name of the table
   */
  deleteTable(table: string) {
    if (typeof table !== 'string') this._expected('string', typeof table);
    this.sqlite.prepare(`DROP TABLE ${table}`).run();
  }

  /**
   * Returns Information about all the created Tables in the Database
   */
  getTables() {
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
    this.sqlite
      .prepare(`INSERT INTO ${table} VALUES (?, ?)`)
      .run(column, typeof value === 'object' || Array.isArray(value) ? JSON.stringify(value) : value);
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
    this.sqlite
      .prepare(`UPDATE ${table}  SET VALUE = ? WHERE MAIN_KEY = ?`)
      .run(typeof value === 'object' || Array.isArray(value) ? JSON.stringify(value) : value, column);
  }

  _parseValue(value: SQLRawData) {
    if (!value) return null;

    if (typeof value.VALUE === 'string') {
      return JSON.parse(value.VALUE);
    } else {
      return value.VALUE;
    }
  }
}
