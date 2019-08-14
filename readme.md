# crypto-storage

A light & secure way to store data in browser.

Build for create server less front end application in a safe way.

**Note** : the current version is a kind of 'beta', development is still in progress ...

## Intall

```
npm install crypto-storage
```

## Usage

You'll find a demo [here](https://codesandbox.io/s/crypto-storage-u9v7d).

```javascript
const CryptoStorage = require('crypto-storage')
const storage = CryptoStorage()

storage.on('ready', async function(err) {
  if (err) throw err
  console.log('CryptoStorage is ready !')
  
  // you should set a password
  await storage.setPassword('toto')
  
  // know you can append and get data safely
  await storage.setItem('name', 'tony')
  const name = await storage.getItem('name')
  console.log(name)
})

storage.on('data', data => {
  console.log('data => ', data)
})
```

## API

### Methods

#### const storage = CryptoStorage()
Create a new storage.

#### storage.setPassword(password: String)
Set a password to allow current user to access data

#### storage.setItem(key: String, value: String|Array|Object)
Set an item in the storage.

#### storage.getItem(key: String)
Get an item from the storage.

### Events

#### storage.on('ready')
Emitted when the storage is ready

#### storage.on('data', data)
Emitted when the new data is appended to the storage