'use strict'

const { EventEmitter } = require('events')
const mainKey = 'cs_root'
const saltKey = 'salt_key'
const nonceKey = 'nonce'
const PASSWORD_LENGTH = 5

function CryptoStorage () {
  if (!(this instanceof CryptoStorage)) return new CryptoStorage()
  EventEmitter.call(this)

  // variables
  this._ready = false
  this._userPw = null

  // init
  this._checkStorage().then(() => {
    this._ready = true
    this.emit('ready', null)
  }).catch(error => this.emit('ready', error))

}

CryptoStorage.prototype = Object.create(EventEmitter.prototype)

CryptoStorage.prototype.setPassword = async function (password) {
  if (!this._ready) throw new Error('impossible to set password if storage is not ready')
  if (!password || typeof password !== 'string' || password.length >= PASSWORD_LENGTH) {
    throw new Error('password should be a string of 5 characters')
  }
  const bufferPW = new TextEncoder('utf-8').encode(password)
  this._userPw = await crypto.subtle.importKey(
    'raw',
    bufferPW,
    'PBKDF2',
    false,
    ['deriveKey']
  )
  return this._userPw
}

CryptoStorage.prototype._checkStorage = function () {
  return new Promise(async (resolve, reject) => {
    if (!window || !window.localStorage) {
      reject('localStorage is not available for now')
    }
    resolve()
  })
}

CryptoStorage.prototype._getDb = async function () {
  const bufferDB = window.localStorage.getItem(mainKey);
  if (bufferDB) {
    const encryptDB = base64ToArrayBuffer(bufferDB)
    const nonce = getNonce()
    const algorithm = { name: 'AES-GCM', iv: nonce }

    const derivedKey = await getDerivedKey(this._userPw)
    const cryptoDB = await crypto.subtle.decrypt(algorithm, derivedKey, encryptDB)
    return decode(cryptoDB);
  }
  return {}
}

CryptoStorage.prototype.setItem = async function (key, value) {
  if (!key || !value) throw new Error('key (String) and value (String | Array) args are required')
  if (typeof key !== 'string') throw new Error('key (String) arg should be a string')
  if (!this._userPw) throw new Error('password is not set')
  const db = await this._getDb()
  if (db) {
    db[key] = value
  }
  const bufferDB = encode(db)
  const nonce = getNonce()
  const algorithm = { name: 'AES-GCM', iv: nonce }

  const derivedKey = await getDerivedKey(this._userPw)
  const cryptoDB = await crypto.subtle.encrypt(algorithm, derivedKey, bufferDB)
  const formattedCryptoDB = arrayBufferToBase64(cryptoDB)
  window.localStorage.setItem(mainKey, formattedCryptoDB)
  this.emit('data', { [key]: value })
}

CryptoStorage.prototype.getItem = async function (key) {
  if (!key || typeof key !== 'string') throw new Error('key arg (String) is required')
  if (!this._userPw) throw new Error('password is not set')
  const db = await this._getDb()
  if (!db) throw new Error('storage is empty')
  if (!db[key]) throw new Error(`the key ${key} doesn't exist in the db`) // throw ???
  return db[key]
}

module.exports = CryptoStorage

// utils

function encode(object) {
  if (!object || typeof object !== 'object') throw new Error('object args (object) is required')
  return new TextEncoder('utf-8').encode(JSON.stringify(object))
}

function decode(buffer) {
  if (!(!buffer || !buffer.constructor || buffer.constructor !== Uint8Array)) {
    throw new Error('buffer args (Uint8Array) is required')
  }
  const stringDB = new TextDecoder('utf-8').decode(buffer)
  return JSON.parse(stringDB)
}

function generateSalt () {
  const salt = crypto.getRandomValues(new Uint8Array(8))
  window.localStorage.setItem(saltKey, JSON.stringify(Array.from(salt)))
  return salt
}

function getSalt () {
  return window.localStorage.getItem(saltKey)
    ? new Uint8Array(JSON.parse(window.localStorage.getItem(saltKey)))
    : generateSalt()
}

async function getDerivedKey (pw) {
    const salt = getSalt()
    const params = {
      name: "PBKDF2",
      hash: "SHA-1",
      salt: salt,
      iterations: 5000
    }
    const algorithm = {name: "AES-GCM", length: 256};
    return await crypto.subtle.deriveKey(
      params,
      pw,
      algorithm,
      false,
      ['encrypt', 'decrypt']
    )
}

function generateNonce () {
  const nonce = crypto.getRandomValues(new Uint8Array(16));
  window.localStorage.setItem(nonceKey, JSON.stringify(Array.from(nonce)))
  return nonce
}

function getNonce () {
  return window.localStorage.getItem(nonceKey)
    ? new Uint8Array(JSON.parse(window.localStorage.getItem(nonceKey)))
    : generateNonce()
}

function arrayBufferToBase64 (buffer) {
  let binary = '';
  let bytes = new Uint8Array(buffer);
  let len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToArrayBuffer (stringBase64) {
  const binary = window.atob(stringBase64)
  const len = binary.length
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] += binary.charCodeAt(i);
  }
  return bytes.buffer;
}