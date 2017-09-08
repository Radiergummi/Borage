'use strict';

/*
 global module,
 require
 */
const fs = require('fs');

/**
 * Mock for browser localStorage object. Needs to be initialized with a file
 */
class LocalStorage {

  /**
   * creates a new localStorage cache
   *
   * @param {string} filePath
   */
  constructor(filePath) {

    /**
     * path to cache file
     *
     * @type {string}
     * @private
     */
    this._path = filePath;

    try {

      /**
       * holds the localStorage data
       *
       * @type {object}
       * @private
       */
      this._cache = this.__read();
    }
    catch (error) {
      this._cache = {};
      this.__write();
    }
  }

  /**
   * fetches an item from localStorage
   *
   * @param   {string}      key
   * @returns {string|null}
   */
  getItem(key) {
    return this._cache.hasOwnProperty(key) ? this._cache[ key ] : null;
  }

  /**
   * sets an item to localStorage
   *
   * @param {string} key
   * @param {string} value
   * @throws If any other input than strings is supplied
   */
  setItem(key, value) {
    if (typeof key !== 'string' || typeof value !== 'string') {
      throw new Error('Invalid argument: setItem only accepts strings as key and value');
    }

    // prevent unnecessary writes
    if (this._cache[ key ] !== value) {
      this._cache[ key ] = value;
      this.__write();
    }
  }

  /**
   * removes an item from localStorage
   * @param {string} key
   */
  removeItem(key) {

    // prevent unnecessary writes
    if (this._cache.hasOwnProperty(key)) {
      delete this._cache[ key ];
      this.__write();
    }
  }

  /**
   * clears the entire localStorage
   */
  clear() {

    // prevent unnecessary writes
    if (this.length) {
      this._cache = {};
      this.__write();
    }
  }

  /**
   * reads the localStorage from disk
   *
   * @private
   * @throws If the cache file does not exists or isn't writable
   */
  __read() {
    if (! fs.existsSync(this._path)) {
      throw new Error('Cache file does not exist and must be created');
    }

    let fileContent = fs.readFileSync(this._path);

    if (fileContent === '') {
      return {};
    }

    try {
      return JSON.parse(fileContent);
    }
    catch (error) {
      throw new Error('Cache file seems to be corrupt and must be recreated');
    }
  }

  /**
   * writes the localStorage to disk
   *
   * @private
   */
  __write() {
    fs.writeFileSync(this._path, JSON.stringify(this._cache));
  }

  /**
   * retrieves the localStorage length
   *
   * @returns {Number}
   */
  get length() {
    return Object.keys(this._cache).length;
  }

  /**
   * proxy to cache hasOwnProperty
   *
   * @returns {boolean}
   */
  hasOwnProperty(key) {
    return this._cache.hasOwnProperty(key);
  }
}

module.exports = LocalStorage;
