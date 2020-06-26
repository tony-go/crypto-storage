'use strict'

const {EventEmitter} = require('events')
const {crypto, utils} = require('./lib')
const {
  SALT_KEY,
  IV_KEY,
  PASSWORD_LENGTH,
  NAME_LENGTH,
  TABLE_NAME_KEY,
} = require('./constant')

const {getDerivedKey, getIv} = crypto
const {
  encode,
  decode,
  arrayBufferToBase64,
  base64ToArrayBuffer,
  hashString,
} = utils

function CryptoStorage(ctx) {
  if (!(this instanceof CryptoStorage)) return new CryptoStorage(ctx)
  EventEmitter.call(this)

  // variables
  this._ready = false
  this._userPassword = null
  this._userName = null
  this._storage = null

  // init
  this.open(ctx)
}

CryptoStorage.prototype = Object.create(EventEmitter.prototype)

CryptoStorage.prototype._checkStorage = function () {
  return new Promise((resolve, reject) => {
    if (!window || !window.localStorage) {
      reject(new Error('localStorage is not available for now'))
    }
    this._storage = window.localStorage
    resolve()
  })
}

CryptoStorage.prototype._setTableName = function setTableName(name) {
  const rawTable = this._storage.getItem(TABLE_NAME_KEY)
  const hashName = hashString(name)

  if (!rawTable) {
    this._storage.setItem(TABLE_NAME_KEY, JSON.stringify([hashName]))
  } else {
    const tableName = JSON.parse(rawTable)
    if (!Array.isArray(tableName)) {
      throw new Error(
        'Table name was corrupted you should clear storage and kill instances',
      )
    } else {
      if (tableName.includes(hashName)) {
        throw new Error(`Name ${name} is already used`)
      } else {
        tableName.push(hashName)
      }
    }
  }
}

CryptoStorage.prototype._setContext = async function setContext(ctx) {
  const {password, name} = ctx

  if (!name || typeof name !== 'string' || name.length < NAME_LENGTH) {
    throw new Error(`name should be a string of ${NAME_LENGTH} characters`)
  } else {
    this._setTableName(name)
  }

  if (
    !password ||
    typeof password !== 'string' ||
    password.length < PASSWORD_LENGTH
  ) {
    throw new Error(`name should be a string of ${PASSWORD_LENGTH} characters`)
  }

  const bufferName = new TextEncoder('utf-8').encode(name)
  this._userName = await window.crypto.subtle.importKey(
    'raw',
    bufferName,
    'PBKDF2',
    false,
    ['deriveKey'],
  )

  const bufferPassword = new TextEncoder('utf-8').encode(password)
  this._userPassword = await window.crypto.subtle.importKey(
    'raw',
    bufferPassword,
    'PBKDF2',
    false,
    ['deriveKey'],
  )

  return {password: this._userPassword, name: this._userName}
}

CryptoStorage.prototype.setItem = async function (key, value) {
  if (!this._userPassword || !this._userName || !this._ready)
    throw new Error('CryptoStorage instance is not ready')
  if (!key || !value)
    throw new Error('key (String) and value (String | Array) args are required')
  if (typeof key !== 'string')
    throw new Error('key (String) arg should be a string')

  const hashedKey = hashString(key + this._userName)
  const bufferValue = encode(value)
  const iv = getIv(this._storage)
  const algorithm = {name: 'AES-GCM', iv}
  const derivedKey = await getDerivedKey(this._userPassword, this._storage)

  const cryptoValue = await window.crypto.subtle.encrypt(
    algorithm,
    derivedKey,
    bufferValue,
  )
  const formattedCryptoValue = arrayBufferToBase64(cryptoValue)
  const unEncryptedData = {[key]: value}

  this._storage.setItem(hashedKey, formattedCryptoValue)
  this.emit('data', unEncryptedData)
  return unEncryptedData
}

CryptoStorage.prototype.getItem = async function (key) {
  if (!this._userPassword || !this._ready)
    throw new Error('CryptoStorage instance is not ready')
  if (!key || typeof key !== 'string')
    throw new Error('key arg (String) is required')

  const hashedKey = hashString(key + this._userName)
  const item = this._storage.getItem(hashedKey)
  if (!item) {
    console.error(`key '${key}' are not store in the CryptoStorage instance`)
    return null
  }
  const base64Value = base64ToArrayBuffer(item)
  const iv = getIv(this._storage)
  const algorithm = {name: 'AES-GCM', iv}
  const derivedKey = await getDerivedKey(this._userPassword, this._storage)
  const bufferValue = await window.crypto.subtle.decrypt(
    algorithm,
    derivedKey,
    base64Value,
  )

  return decode(bufferValue)
}

CryptoStorage.prototype.removeItem = function (key) {
  if (!this._userPassword || !this._ready)
    throw new Error('CryptoStorage instance is not ready')
  if (!key || typeof key !== 'string')
    throw new Error('key arg (String) is required')
  if (key === SALT_KEY || key === IV_KEY) throw new Error('unsafe operation')

  const hashedKey = hashString(key + this._userName)
  const item = this._storage.getItem(hashedKey)

  if (!item) {
    console.error(`key '${key}' are not store in the CryptoStorage instance`)
    return null
  }

  this._storage.removeItem(hashedKey)
  return key
}

CryptoStorage.prototype.open = function (ctx) {
  this._checkStorage().catch(error => this.emit('ready', error))

  this._setContext(ctx)
    .then(() => {
      this._ready = true
      this.emit('ready', null)
    })
    .catch(error => {
      this.emit('ready', error)
    })
}

CryptoStorage.prototype.close = function () {
  this._userPassword = null
  this._ready = false
  this.emit('close')
}

module.exports = CryptoStorage
