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
//noinspection JSUnresolvedVariable
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

  it('should remove a key', () => {
    const borage = new Borage(Date.now());

    borage.set('foo', 123);
    borage.remove('foo');

    expect(borage.get('foo', 'fallback')).to.equal('fallback');
  });

  it('should remove a nested key', () => {
    const borage = new Borage(Date.now());

    borage.set('foo:bar', 123);
    borage.remove('foo:bar');

    expect(borage.get('foo:bar', 'fallback')).to.equal('fallback');
  });

  it('should clear the storage', () => {
    const borage = new Borage(Date.now());

    borage.set('level0:level1:level2:level3:first', 'foo');
    borage.set('level0:level1:level2:level3:second', 'bar');

    borage.clear();

    expect(borage.length).to.equal(0);
  });

  it('should report the length correctly', () => {
    const borage = new Borage(Date.now());

    borage.set('foo:bar:baz', 123);
    borage.set('foo:xyz', true);
    borage.set('foo:another', {nested: 'value', with: 'sub', properties: 'that should be ignored'});
    borage.set('foo:it gets', 'pretty pointless from here on');
    borage.set('foo:but you need to fill this somehow, you know?', 10);

    expect(borage).to.have.length(5);
  });

  it('should be iteratable', () => {
    const borage = new Borage(Date.now());

    borage.set('foo:bar:baz', 123);
    borage.set('foo:xyz', true);
    borage.set('foo:another', {nested: 'value', with: 'sub', properties: 'that should be ignored'});
    borage.set('foo:it gets', 'pretty pointless from here on');
    borage.set('foo:but you need to fill this somehow, you know?', 10);

    const seen = [];

    for (let value of borage) {
      seen.push(value);
    }

    expect(seen).to.have.length(5);
  });

  it('should store obscure keys correctly', () => {
    const borage = new Borage(Date.now());

    borage.set('\\__§R$!§"∑€©[][|{⁄∞!?E`"$`)"`"%', 'test');

    expect(borage.get('\\__§R$!§"∑€©[][|{⁄∞!?E`"$`)"`"%')).to.equal('test');
  });

  it('should bail on key names with an asterisk', () => {
    const borage = new Borage(Date.now());

    expect(() => borage.set('*bar')).to.throw('invalid key format: keys may not end in an asterisk');
    expect(() => borage.set('foo*bar')).to.throw('invalid key format: keys may not end in an asterisk');
    expect(() => borage.set('foo*')).to.throw('invalid key format: keys may not end in an asterisk');
  });

  it('should bail on circular references', () => {
    const borage      = new Borage(Date.now());
    const circle      = {key: {}};
    circle.key.circle = circle;

    expect(() => borage.set('circle', circle)).to.throw('Converting circular structure to JSON');
  });

  describe('nesting', () => {
    const borage = new Borage(Date.now());

    it('should add a key in the same nesting depth', () => {
      borage.set('nesting1:level0:level1:level2:level3:first', 'foo');
      borage.set('nesting1:level0:level1:level2:level3:second', 'bar');

      expect(borage.get('nesting1:level0:level1:level2:level3:*')).to.have.members(['foo', 'bar']);
    });

    it('should add a key in a level above', () => {
      borage.set('nesting2:level0:level1:level2:level3:first', 'foo');
      borage.set('nesting2:level0:level1:level2:first', 'bar');

      expect(borage.get('nesting2:level0:level1:level2:level3:first')).to.equal('foo');
      expect(borage.get('nesting2:level0:level1:level2:level3:*')).to.have.members(['foo']);
      expect(borage.get('nesting2:level0:level1:level2:first')).to.equal('bar');
      expect(borage.get('nesting2:level0:level1:level2:*')).to.have.members(['foo', 'bar']);
    });

    it('should remove a nested key and all index references', () => {
      borage.set('nesting3:foo:bar:baz', 123);
      borage.remove('nesting3:foo:bar:baz');

      expect(borage.get('nesting3:foo:bar:baz', 'fallback')).to.equal('fallback');
      expect(borage.get('nesting3:foo:bar:*')).to.eql([]);
      expect(borage.get('nesting3:foo:*')).to.eql([]);
    });

    it('should remove a nested key and all index references but leave other indices intact', () => {
      borage.set('nesting3:foo:bar:baz', 123);
      borage.set('nesting3:foo:test', 42);
      borage.remove('nesting3:foo:bar:baz');

      expect(borage.get('nesting3:foo:bar:baz', 'fallback')).to.equal('fallback');
      expect(borage.get('nesting3:foo:bar:*')).to.eql([]);
      expect(borage.get('nesting3:foo:*')).to.have.members([42]);
    });
  });

  describe('key values', () => {
    const borage = new Borage(Date.now());

    it('should store a string', () => {
      borage.set('values:string', 'foobar');

      expect(borage.get('values:string')).to.equal('foobar');
    });

    it('should store a number', () => {
      borage.set('values:number', 42);

      expect(borage.get('values:number')).to.equal(42);
    });

    it('should store a boolean', () => {
      borage.set('values:boolean', true);

      expect(borage.get('values:boolean')).to.be.true;
    });

    it('should store null', () => {
      borage.set('values:null', null);

      expect(borage.get('values:null')).to.be.null;
    });

    it('should store an array', () => {
      borage.set('values:array', ['foo', 10, 'bar']);

      expect(borage.get('values:array')).to.have.members([
        'foo',
        10,
        'bar'
      ]);
    });

    it('should store an object', () => {
      borage.set('values:object', {
        foo: 'sometimes while testing',
        bar: '...i question my life decisions'
      });

      expect(borage.get('values:object')).to.deep.equal({
        foo: 'sometimes while testing',
        bar: '...i question my life decisions'
      });
    });

    it('should store a deeply nested object', () => {
      borage.set('values:deep object', {
        foo: {
          bar: {
            baz: {
              quz: {
                more: [
                  {
                    keys: {
                      are: 'below'
                    }
                  },
                  {
                    values: {
                      follow: {
                        too: 'yes'
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      });

      expect(borage.get('values:deep object')).to.deep.equal({
        foo: {
          bar: {
            baz: {
              quz: {
                more: [
                  {
                    keys: {
                      are: 'below'
                    }
                  },
                  {
                    values: {
                      follow: {
                        too: 'yes'
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      });
    });
  });

  after(() => {
    window.localStorage.clear();
  });
});
