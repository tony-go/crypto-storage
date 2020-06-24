'use strict'

const {EventEmitter} = require('events')
const {crypto, utils} = require('./lib')
const {SALT_KEY, IV_KEY, PASSWORD_LENGTH} = require('./constant')

const {getDerivedKey, getIv} = crypto
const {
  encode,
  decode,
  arrayBufferToBase64,
  base64ToArrayBuffer,
  hashString,
} = utils

function CryptoStorage(password) {
  if (!(this instanceof CryptoStorage)) return new CryptoStorage(password)
  EventEmitter.call(this)

  // variables
  this._ready = false
  this._userPw = null

  // init
  this.open(password)
}

CryptoStorage.prototype = Object.create(EventEmitter.prototype)

CryptoStorage.prototype._checkStorage = function () {
  return new Promise((resolve, reject) => {
    if (!window || !window.localStorage) {
      reject(new Error('localStorage is not available for now'))
    }
    resolve()
  })
}

CryptoStorage.prototype._setPassword = async function (password) {
  if (
    !password ||
    typeof password !== 'string' ||
    password.length < PASSWORD_LENGTH
  ) {
    throw new Error('password should be a string of 5 characters')
  }
  const bufferPW = new TextEncoder('utf-8').encode(password)
  this._userPw = await window.crypto.subtle.importKey(
    'raw',
    bufferPW,
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return this._userPw
}

CryptoStorage.prototype.setItem = async function (key, value) {
  if (!this._userPw || !this._ready)
    throw new Error('CryptoStorage instance is not ready')
  if (!key || !value)
    throw new Error('key (String) and value (String | Array) args are required')
  if (typeof key !== 'string')
    throw new Error('key (String) arg should be a string')

  const hashedKey = hashString(key)
  const bufferValue = encode(value)
  const iv = getIv()
  const algorithm = {name: 'AES-GCM', iv}
  const derivedKey = await getDerivedKey(this._userPw)

  const cryptoValue = await window.crypto.subtle.encrypt(
    algorithm,
    derivedKey,
    bufferValue,
  )
  const formattedCryptoValue = arrayBufferToBase64(cryptoValue)
  window.localStorage.setItem(hashedKey, formattedCryptoValue)
  this.emit('data', {[key]: value})
}

CryptoStorage.prototype.getItem = async function (key) {
  if (!this._userPw || !this._ready)
    throw new Error('CryptoStorage instance is not ready')
  if (!key || typeof key !== 'string')
    throw new Error('key arg (String) is required')

  const hashedKey = hashString(key)
  const item = window.localStorage.getItem(hashedKey)
  if (!item) {
    console.error(`key '${key}' are not store in the CryptoStorage instance`)
    return null
  }
  const base64Value = base64ToArrayBuffer(item)
  const iv = getIv()
  const algorithm = {name: 'AES-GCM', iv}
  const derivedKey = await getDerivedKey(this._userPw)
  const bufferValue = await window.crypto.subtle.decrypt(
    algorithm,
    derivedKey,
    base64Value,
  )
  return decode(bufferValue)
}

CryptoStorage.prototype.removeItem = function (key) {
  if (!this._userPw || !this._ready)
    throw new Error('CryptoStorage instance is not ready')
  if (!key || typeof key !== 'string')
    throw new Error('key arg (String) is required')
  if (key === SALT_KEY || key === IV_KEY) throw new Error('unsafe operation')

  const hashedKey = hashString(key)
  const item = window.localStorage.getItem(hashedKey)
  if (!item) {
    console.error(`key '${key}' are not store in the CryptoStorage instance`)
    return null
  }
  window.localStorage.removeItem(hashedKey)
}

CryptoStorage.prototype.open = function (password) {
  Promise.all([this._checkStorage(), this._setPassword(password)])
    .then(() => {
      this._ready = true
      this.emit('ready', null)
    })
    .catch(error => {
      this.emit('ready', error)
    })
}

CryptoStorage.prototype.close = function () {
  this._userPw = null
  this._ready = false
  this.emit('close')
}

module.exports = CryptoStorage
