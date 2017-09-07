'use strict';

/*
 global window,
 document
 */

/**
 * Wrapper class for localStorage
 */
class Borage {

  /**
   * Retrieves an existing or creates a new localStorage handle using a unique ID.
   * This ID will be prepended to all keys
   *
   * @param {string} uniqueStorageId unique ID to identify app storage keys by
   */
  constructor(uniqueStorageId) {
    this._uniqueStorageId = uniqueStorageId;

    if (typeof window.localStorage.getItem(uniqueStorageId) === 'undefined') {
      window.localStorage.setItem(uniqueStorageId, {});
    }
  }

  /**
   * checks if the key exists in storage
   *
   * @param   {string}  key item to check
   * @returns {boolean}     whether the key exists
   */
  has(key) {
    return window.localStorage.hasOwnProperty(`${this._uniqueStorageId}:${key}`);
  }

  /**
   * retrieves a key from storage. optionally returns a fallback value, if given.
   *
   * @param   {string} key        item to retrieve
   * @param   {*}      [fallback] optional fallback value if the key does not exist
   * @returns {*}                 stored item value or fallback value
   */
  get(key, fallback = undefined) {

    // check if the key exists at all
    if (this.has(key)) {

      // if the key ends in an asterisk, a wildcard key is requested
      if (key.slice(- 1) === '*') {

        // so we fetch the index key and additionally its content: keys within the given index
        return JSON.parse(window.localStorage.getItem(`${this._uniqueStorageId}:${key}`))
            .map(subKey => JSON.parse(window.localStorage.getItem(`${this._uniqueStorageId}:${subKey}`)));
      }

      // this is a normal key, so just fetch its value
      return JSON.parse(window.localStorage.getItem(`${this._uniqueStorageId}:${key}`));
    }

    // nothing found, return the fallback value if given
    return fallback;
  }

  /**
   * sets an item to storage
   *
   * @param {string} key   item to set
   * @param {*}      value item value to set. Will be stored as JSON
   */
  set(key, value) {
    if (key.slice(- 1) === '*') {
      throw new TypeError('invalid key format: keys may not end in an asterisk')
    }

    Borage._updateIndexKey(`${this._uniqueStorageId}`, key);

    // split the key on ":" signs and create a wildcard entry (*) for all subkeys. That serves
    // as a kind of index for all stored keys:
    // For example, 'app:config:templates:my-navigation-template' will be split into
    // 'app', 'config' and 'templates'. The last key is sliced since it holds a value, not
    // further subkeys.
    // Then, 'app:*', 'app:config:*' and 'app:config:templates:*' are created and the current
    // key is appended to them.
    key.split(':').slice(0, - 1).reduce((previous, current) => {
      Borage._updateIndexKey(`${previous}:${current}`, key);

      return previous + ':' + current;
    }, this._uniqueStorageId);

    window.localStorage.setItem(`${this._uniqueStorageId}:${key}`, JSON.stringify(value));
  }

  /**
   * removes a key from storage
   *
   * @param {string} key item to remove
   */
  remove(key) {

    // remove the key itself
    window.localStorage.removeItem(`${this._uniqueStorageId}:${key}`);

    // remove the key from the global index
    Borage._removeIndexKey(this._uniqueStorageId, key);

    // remove the key from all indexes
    key.split(':').reduce((previous, current) => {
      Borage._removeIndexKey(`${previous}:${current}`, key);

      return `${previous}:${current}`;
    }, this._uniqueStorageId);
  }

  /**
   * clears either the whole storage or all subkeys of a specific index.
   * if an index is given, all subkeys will be deleted
   *
   * @example storage.clear('app:config') will delete all keys starting with 'app:config:'
   *
   * @param {string} [index] index to clear. if omitted, will clear the whole storage
   */
  clear(index) {
    if (index) {
      return Borage._getIndex(index).forEach(key => this.remove(key));
    }

    return window.localStorage.clear();
  }

  /**
   * updates an index key
   *
   * @param {string} index index to update
   * @param {string} key   key to update
   * @private
   */
  static _updateIndexKey(index, key) {
    let indexKeys = Borage._getIndex(index);

    indexKeys.push(key);
    window.localStorage.setItem(`${index}:*`, JSON.stringify(Array.from(new Set(indexKeys))));
  }

  /**
   * retrieves a specific index key
   *
   * @param   {string} key index key to retrieve
   * @returns {Array}      array containing all found item keys, not the items themselves
   * @private
   */
  static _getIndex(key) {
    return JSON.parse(window.localStorage.getItem(`${key}:*`)) || [];
  }

  /**
   * sets an index key
   *
   * @param {string} index index to set
   * @param {Array}  keys  keys to set on the index
   * @private
   */
  static _setIndex(index, keys) {
    window.localStorage.setItem(`${index}:*`, JSON.stringify(Array.from(new Set(keys))));
  }

  /**
   * removes a key from an index
   *
   * @param {string} index index to remove a key from
   * @param {string} key   key to remove from the index
   * @private
   */
  static _removeIndexKey(index, key) {
    let indexKeys   = Borage._getIndex(index),
        keyPosition = indexKeys.indexOf(key);

    if (keyPosition > - 1) {
      indexKeys.splice(keyPosition, 1);
      Borage._setIndex(index, indexKeys);
    }
  }

  /**
   * retrieves the number of all stored keys
   *
   * @returns {number}
   */
  get length() {
    return this.get('*').length;
  }

  /**
   * iterator interface
   *
   * @returns {*}
   */
  get [Symbol.iterator]() {
    return this.get('*')[ Symbol.iterator ];
  }
}

export default Borage;
