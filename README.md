# Borage
**Bor**ing Stor**age** - a convenient abstraction layer on top of `localStorage`

## Features
Borage is an attempt of providing yet another wrapper around the browsers localStorage API. It brings some useful features along, though:

 - **Uniform methods**: The Borage API exposes only intuitive methods like *get*, *set*, *has*, *remove* and *clear*
 - **Transparent JSON serialization**: Borage automatically stringifies and parses data as JSON, so you can use any JSON compatible datatype (eg. Objects, Arrays, strings, numbers, booleans etc)
 - **Tree-like keys**: Borage is completely built around wildcard keys, that is: you segment your keys (think `app:data:templates:my-template`), Borage parses them and can return all keys matching any segment (think `app:data:templates:*`, `app:data:*` or `app:*`)
 - **Makes use of ES6**: Among others, Borage implements `Symbol.iterator` and is exported as an ES6 module - bundling is up to you. No more overhead for multiple module systems!
 
## Usage
Borage comes as an ES6 module. If you already use Babel or Webpack (or a similar bundler), you can just import it:

````js
import Borage from 'borage';
    
// create a new Borage instance, passing a unique identifier
const storage = new Borage('my-app-0.0.1');
````

That's it, you're ready.  

## Methods
The following section describes all Borage methods.

### `Borage#has (string key): boolean`
Checks whether a key of this name exists in the storage.

#### Examples:

````js
storage.has('app:config:version'); // false

storage.has('app:config:*') // true
````

### `Borage#get (string key [, fallback]): *`
Retrieves a certain key. If no value is found and a fallback argument has been given, returns the fallback value.

#### Examples:
For normal keys, the method behaves as you would expect:

````js
// existing key
storage.get('app:config:name'); // "my-app"

// existing key, with fallback
storage.get('app:config:name', 'no-name'); // "my-app"

// not existent key
storage.get('app:config:version'); // undefined

// not existent key, with fallback
storage.get('app:config:version', 123); // 123
````

For wildcard keys, things start to get more interesting:

````js
// existing key
storage.get('app:config:templates:*'); // [ Object, Object, Object ]

// not existent key
storage.get('app:config:templates:*'); // []

// not existent key, with fallback
storage.get('app:config:templates:*', 'no templates'); // 'no templates'

// existing key with sub structure
storage.get('app:config:*'); // [ 'my-app', 123, Object, Object ]
````


### `Borage#set (string key, * value): void`
Sets an item in the storage. The method does not make a difference of creating or updating an item, so you could call this *upsert*. You can use any string value for the key name, bound to two rules:  
  1. `:` signs within the key name are treated as segment separators.  
  2. Don't use an asterisk (`*`) as the last value of your key. It will produce unexpected results. Maybe.  

#### Examples:

````js
// set a value
storage.set('app:posts:p-123', { id: 123, name: 'Most programmers are sleep deprived', content: '...' });
storage.get('app:posts:p-123'); // Object {id: 123, name: "Most programmers are sleep deprived", content: "..."}
storage.get('app:posts:*'); // [ Object ]
````


### `Borage#remove (string key): void`
Removes a key from the storage. Internally, this also walks all tree levels and removes the key from the wildcard indexes.  
Removing multiple keys by wildcard is the same as calling `storage.clear('my-key:*');`.

#### Examples:

````js
// remove a key
storage.remove('app:posts:p-123');

// remove multiple keys
storage.remove('app:posts:*');
````


### `Borage#clear ([string key]): void`
Clears the entire storage. If a key is given, all subkeys of that key will be cleared.
**Attention: Currently, calling `clear` without arguments clears the *entire* localStorage, instance-foreign keys included. Make sure you know what you're doing.**

#### Examples:

````js
// clear the whole storage
storage.clear();
storage.length === 0; // true

// clear all posts
storage.clear('app:posts:*');
storage.get('app:posts').length === 0; // true
````

## How it works
The `localStorage` API is a string-only key-value storage. In order to make more use of this, Borage includes the following optimizations:
 - All keys are stored as JSON and converted back upon retrieval. That way, storing scalar types, objects and arrays is defaultwithout additional thinking.
 - To enable wildcard segments, Borage creates additional index keys for each segment passed to `set()`. These indexes are updated and removed as necessary and hold references to all matching keys. So if a wildcard key is requested, Borage actually performs `get()` two times: one for the wildcard index key, another to fetch all the keys listed within the index.  
 That's kind of like you would do it with redis, just less sophisticated.

So if you'd create a key named `app:config:templates:home:navbar`, what Borage will actually do is the following:

````
// the new key itself
localStorage.setItem('app:config:templates:home:navbar', 'your template content');

// all index keys get the new key appended to their existing content (an array of keys)
localStorage.setItem('app:*', previousKeys.push('app:config:templates:home:navbar'));
localStorage.setItem('app:config:*', previousKeys.push('app:config:templates:home:navbar'));
localStorage.setItem('app:config:templates:*', previousKeys.push('app:config:templates:home:navbar'));
localStorage.setItem('app:config:templates:home:*' previousKeys.push('app:config:templates:home:navbar'));
````


## What's next, contributing
I'm planning on keeping Borage lean, however I'd like to implement a few things: First, a random string generator to create the storage prefix value by itself if none given, second access to and manual modification of indexes and their content. Maybe also an event emitter that emits `changed`, `removed` and `created` events and TTL expiration.  
I welcome any contributions to this project. Please feel free to submit issues or PRs, I'll take care of them as fast as I can.
