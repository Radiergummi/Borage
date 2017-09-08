const assert = require('assert'),
      expect = require('expect.js');

const LocalStorage = require('./localStorageMock');
const Borage = require('../dist/borage').default;

/**
 * define a global window stub
 *
 * @type {{localStorage: LocalStorage}}
 */
window = {
  localStorage: new LocalStorage(__dirname + '/fixtures/storage.json')
};

describe('Borage', () => {
  it('should create a new instance', () => {
    const borage = new Borage(Date.now());

    expect(borage).to.be.an(Borage);
  });

  it('should set a key', () => {
    const borage = new Borage(Date.now());

    expect(borage).to.be.an(Borage);
  });

  after(() => {
    window.localStorage.clear();
  });
});
