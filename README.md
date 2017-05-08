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
  2. Don't use an asterisk (`*`) as the last value of your key. It will inevitably throw exceptions.  

#### Examples:

````js
// set a value
storage.set('app:posts:p-123', { id: 123, name: 'Most programmers are sleep deprived', content: '...' });
storage.get('app:posts:p-123'); // Object {id: 123, name: "Most programmers are sleep deprived", content: "..."}
storage.get('app:posts:*'); // [ Object ]
````

    TODO
