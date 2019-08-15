# crypto-storage

A light & secure way to store data in browser.

Build for create server less front end application in a safe way.

**Note** : the current version is a kind of 'beta', development is still in progress ...

## Install

```
npm install crypto-storage
```

## Usage

You'll find a demo [here](https://codesandbox.io/s/crypto-storage-u9v7d).

```javascript
const CryptoStorage = require('crypto-storage')
const storage = CryptoStorage('super-pw')

storage.on('ready', async function(err) {
  if (err) throw err
  console.log('CryptoStorage is ready !')
  
  // know you can append and get data safely
  await storage.setItem('name', 'tony')
  const name = await storage.getItem('name')
  console.log(name)
})

storage.on('data', data => {
  console.log('data => ', data)
})

storage.on('close', () => {
  console.log('CryptoStorage is closed !')
})
```

## API

### Methods

#### const storage = CryptoStorage(password: String)
Create a new storage. Event 'ready' should be emitted when instance will be ready.

#### await storage.setItem(key: String, value: String|Array|Object)
Set an item in the storage.

#### await storage.getItem(key: String)
Get an item from the storage.

#### storage.removeItem(key: String)
Remove an item from the storage.

#### storage.close()
Close access to CryptoStorage disabling set/get/removeItem

#### storage.open(password :String)
Close access to CryptoStorage enabling set/get/removeItem

### Events

#### storage.on('ready')
Emitted when the storage is ready

#### storage.on('data', data)
Emitted when the new data is appended to the storage

#### storage.on('close')
Emitted when CryptoStorage instance is closed