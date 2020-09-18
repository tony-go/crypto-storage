# crypto-storage

![logo][logo]

A light & secure way to store data in a browser.

Build for create server less front end application in a safe way.

## Install

```
yarn add crypto-storage
```

## Usage

```javascript
const CryptoStorage = require('crypto-storage')

// create a storage
const safeStorage = CryptoStorage({name: 'tester', password: 'super-pw'})
safeStorage.create()

// create an item and get it
await safeStorage.setItem('foo', 'bar')
const foo = await safeStorage.getItem('foo')
console.log(foo) // => 'bar'

// close your session
safeStorage.close()

// open it again (.use() this time)
const safeStorage2 = CryptoStorage({name: 'tester', password: 'super-pw'})
safeStorage2.use()

const newFoo = await safeStorage.getItem('foo')
console.log(newFoo) // => 'bar'

// if you try to create the session again
safeStorage2.create() // => throw!!
```

## API

### Methods

#### const storage = CryptoStorage({name: String, password: String})

Init a new storage instance.

#### await storage.create()

Create a new safe storage session.

#### await storage.use()

Open an existing session.

#### await storage.setItem(key: String, value: String|Array|Object):{[key]: value}

Set an item in the storage.

#### await storage.getItem(key: String): {[key]: value}

Get an item from the storage.

#### storage.removeItem(key: String): String|Array|Object)

Remove an item from the storage and return the key.

#### storage.close()

Close access to CryptoStorage disabling set/get/removeItem.

[logo]:
  https://user-images.githubusercontent.com/22824417/63122825-eb526500-bfa7-11e9-9e6d-d7f8e95b361b.png
