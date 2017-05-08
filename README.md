# Borage
**Bor**ing Stor**age** - a convenient abstraction layer on top of `localStorage`

## Features
Borage is an attempt of providing yet another wrapper around the browsers localStorage API. It brings some useful features along, though:

 - **Uniform methods**: The Borage API exposes only intuitive methods like *get*, *set*, *has*, *remove* and *clear*
 - **Transparent JSON serialization**: Borage automatically stringifies and parses data as JSON, so you can use any JSON compatible datatype (eg. Objects, Arrays, strings, numbers, booleans etc)
 - **Makes use of ES6**: Among others, Borage implements `Symbol.iterator`, t
