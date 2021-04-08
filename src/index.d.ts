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
export declare type SQLDataValue = any;
export declare class Database {
  filename: string;
  options: LocalSqlite.Options;
  sqlite: LocalSqlite.Database;
  constructor(filename: string, options: LocalSqlite.Options);
  /**
   * Creating/Updating the value of an existing data with key
   * @method
   * @param {String} table - The name of the table
   * @param {String} key - The name of the data
   * @param {any} value - The value of the data with key
   */
  set(table: string, key: string, value: any): void;
  /**
   * Returns a data from Database
   * @method
   * @param {String} table - The name of the table
   * @param {String} key - The name of the data
   */
  get(table: string, key: string): any;
  /**
   * Deletes a data from Database
   * @method
   * @param {String} table - The name of the table
   * @param {String} key - The name of the data
   */
  delete(table: string, key: string): void;
  /**
   * Returns an Array of data from the Table
   * @method
   * @param {String} table - The name of the Table
   * @returns {SQLData[]}
   */
  fetchAll(table: string): SQLData[];
  /**
   * Deletes the entire Tables with its contents from the Database
   */
  clearDatabase(): void;
  /**
   * Deletes the entire data from the Table
   * @method
   * @param {String} table - The name of the table
   */
  clearTable(table: string): void;
  /**
   * Returns Information about all the created Tables in the Database
   */
  getTables(): TableInformation[];
  _expected(expected: string, received: string): void;
  _insertInto(table: string, column: string, value: any): void;
  _createTable(table: string): void;
  _insertIntoWithWhere(table: string, column: string, value: any): void;
  _parseValue(value: string | number | any): any;
}
