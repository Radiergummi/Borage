/*
 global module,
 require,
 describe,
 it,
 after
 */

const assert = require('assert'),
      expect = require('chai').expect;

const LocalStorage = require('./localStorageMock');
const Borage       = require('../dist/borage').default;

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

    expect(borage).to.be.an.instanceof(Borage);
  });

  it('should set a single key', () => {
    const borage = new Borage(Date.now());

    borage.set('foo', 'bar');
    expect(borage.has('foo')).to.be.true;
  });

  it('should set a nested key', () => {
    const borage = new Borage(Date.now());

    borage.set('this:did:not:exist:before', 'test');
    expect(borage.has('this:did:not:exist:before')).to.be.true;
  });

  it('should get a single key', () => {
    const borage = new Borage(Date.now());

    borage.set('foo', 'bar');

    expect(borage.get('foo')).to.equal('bar');
  });

  it('should get a nested key', () => {
    const borage = new Borage(Date.now());

    borage.set('this:did:not:exist:before', 'test');
    expect(borage.get('this:did:not:exist:before')).to.equal('test');
  });

  it('should overwrite a key', () => {
    const borage = new Borage(Date.now());

    borage.set('foo', 'bar');
    borage.set('foo', 1e42);

    expect(borage.get('foo')).to.equal(1e42);
  });

  it('should overwrite a nested key', () => {
    const borage = new Borage(Date.now());

    borage.set('did:not:exists:yet', 'bar');
    borage.set('did:not:exists:yet', 1e42);

    expect(borage.get('did:not:exists:yet')).to.equal(1e42);
  });

  it('should return undefined for a nonexistent key', () => {
    const borage = new Borage(Date.now());

    expect(borage.get('foo')).to.be.an('undefined');
  });

  it('should return undefined for a nonexistent nested key', () => {
    const borage = new Borage(Date.now());

    expect(borage.get('foo:bar:baz')).to.be.an('undefined');
  });

  it('should return a fallback for a nonexistent key, if supplied', () => {
    const borage = new Borage(Date.now());

    expect(borage.get('foo', 'fallback')).to.equal('fallback');
  });

  it('should return a fallback for a nonexistent nested key, if supplied', () => {
    const borage = new Borage(Date.now());

    expect(borage.get('foo:bar:baz', 'fallback')).to.equal('fallback');
  });

  it('should return all keys in a group', () => {
    const borage = new Borage(Date.now());

    borage.set('test:a', 10);
    borage.set('test:b', 20);
    borage.set('test:c', 30);

    expect(borage.get('test:*')).to.have.members([10, 20, 30]);
  });

  it('should store obscure keys correctly', () => {
    const borage = new Borage(Date.now());

    borage.set('\\__§R$!§"∑€©[][|{⁄∞!?E`"$`)"`"%', 'test');

    expect(borage.get('\\__§R$!§"∑€©[][|{⁄∞!?E`"$`)"`"%')).to.equal('test');
  });

  describe('key values', () => {
    const borage = new Borage(Date.now());

    it('should store a string', () => {
      borage.set('values:string', 'foobar');

      expect(borage.get('values:string')).to.equal('foobar');
    });

    it('should store a number', () => {
      borage.set('values:string', 42);

      expect(borage.get('values:string')).to.equal(42);
    });

    it('should store a boolean', () => {
      borage.set('values:string', true);

      expect(borage.get('values:string')).to.be.true;
    });

    it('should store null', () => {
      borage.set('values:string', null);

      expect(borage.get('values:string')).to.be.null;
    });

    it('should store an array', () => {
      borage.set('values:string', ['foo', 10, 'bar']);

      expect(borage.get('values:string')).to.have.members([
        'foo',
        10,
        'bar'
      ]);
    });

    it('should store an object', () => {
      borage.set('values:string', {
        foo: 'sometimes while testing',
        bar: '...i question my life decisions'
      });

      expect(borage.get('values:string')).to.deep.equal({
        foo: 'sometimes while testing',
        bar: '...i question my life decisions'
      });
    });
  });

  after(() => {
    window.localStorage.clear();
  });
});
