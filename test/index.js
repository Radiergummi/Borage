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

    expect(borage).to.be.a(Borage);
  });

  it('should set a single key', () => {
    const borage = new Borage(Date.now());

    borage.set('foo', 'bar');
    expect(borage.get('foo')).to.equal('bar');
  });

  it('should set a nested key', () => {
    const borage  = new Borage(Date.now());

    borage.set('this:did:not:exist:before', 'test');
    expect(borage.get('this:did:not:exist:before')).to.equal('test');
  })

  after(() => {
    window.localStorage.clear();
  });
});
