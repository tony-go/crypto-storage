'use strict'

const { EventEmitter } = require('events')
const SALT_KEY = 'salt_key'
const IV_KEY = 'iv_key'
const PASSWORD_LENGTH = 5

function CryptoStorage (password) {
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
  return new Promise(async (resolve, reject) => {
    if (!window || !window.localStorage) {
      reject('localStorage is not available for now')
    }
    resolve()
  })
}

CryptoStorage.prototype._setPassword = async function (password) {
  if (!password || typeof password !== 'string' || password.length < PASSWORD_LENGTH) {
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

CryptoStorage.prototype.setItem = async function (key, value) {
  if (!this._userPw || !this._ready) throw new Error('CryptoStorage instance is not ready')
  if (!key || !value) throw new Error('key (String) and value (String | Array) args are required')
  if (typeof key !== 'string') throw new Error('key (String) arg should be a string')

  const hashedKey = hashString(key)
  const bufferValue = encode(value)
  const iv = getIv()
  const algorithm = { name: 'AES-GCM', iv }
  const derivedKey = await getDerivedKey(this._userPw)

  const cryptoValue = await crypto.subtle.encrypt(algorithm, derivedKey, bufferValue)
  const formattedCryptoValue = arrayBufferToBase64(cryptoValue)
  window.localStorage.setItem(hashedKey, formattedCryptoValue)
  this.emit('data', { [key]: value })
}

CryptoStorage.prototype.getItem = async function (key) {
  if (!this._userPw || !this._ready) throw new Error('CryptoStorage instance is not ready')
  if (!key || typeof key !== 'string') throw new Error('key arg (String) is required')

  const hashedKey = hashString(key)
  const item = window.localStorage.getItem(hashedKey)
  if (!item) {
    console.error(`key '${key}' are not store in the CryptoStorage instance`);
    return null
  }
  const base64Value = base64ToArrayBuffer(item)
  const iv = getIv()
  const algorithm = { name: 'AES-GCM', iv }
  const derivedKey = await getDerivedKey(this._userPw)
  const bufferValue = await crypto.subtle.decrypt(algorithm, derivedKey, base64Value)
  return decode(bufferValue)
}

CryptoStorage.prototype.removeItem = function (key) {
  if (!this._userPw || !this._ready) throw new Error('CryptoStorage instance is not ready')
  if (!key || typeof key !== 'string') throw new Error('key arg (String) is required')
  if (key === SALT_KEY || key === IV_KEY) throw new Error('unsafe operation')


  const hashedKey = hashString(key)
  const item = window.localStorage.getItem(hashedKey)
  if (!item) {
    console.error(`key '${key}' are not store in the CryptoStorage instance`);
    return null
  }
  window.localStorage.removeItem(hashedKey)
}

CryptoStorage.prototype.open = function (password) {
  Promise.all([
    this._checkStorage,
    this._setPassword(password)
  ]).then(() => {
    this._ready = true
    this.emit('ready', null)
  }).catch(error => this.emit('ready', error))
}

CryptoStorage.prototype.close = function () {
  this._userPw = null;
  this._ready = false;
  this.emit('close')
}

module.exports = CryptoStorage

// utils

function encode(value) {
  if(!value) return '';
  if (typeof value !== 'object') {
    value = { ['-1']: value}
  }
  return new TextEncoder('utf-8').encode(JSON.stringify(value))
}

function decode(buffer) {
  if (!(!buffer || !buffer.constructor || buffer.constructor !== Uint8Array)) {
    throw new Error('buffer args (Uint8Array) is required')
  }
  const stringValue = new TextDecoder('utf-8').decode(buffer)
  const objectValue =  JSON.parse(stringValue)
  if (objectValue['-1']) return objectValue['-1']
  return objectValue
}

function generateSalt () {
  const salt = crypto.getRandomValues(new Uint8Array(8))
  window.localStorage.setItem(SALT_KEY, JSON.stringify(Array.from(salt)))
  return salt
}

function getSalt () {
  return window.localStorage.getItem(SALT_KEY)
    ? new Uint8Array(JSON.parse(window.localStorage.getItem(SALT_KEY)))
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

function generateIv () {
  const nonce = crypto.getRandomValues(new Uint8Array(16));
  window.localStorage.setItem(IV_KEY, JSON.stringify(Array.from(nonce)))
  return nonce
}

function getIv () {
  return window.localStorage.getItem(IV_KEY)
    ? new Uint8Array(JSON.parse(window.localStorage.getItem(IV_KEY)))
    : generateIv()
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
function hashString (string) {
  let hash = 0
  let i;
  let chr;
  if (string.length === 0) return hash.toString(16);
  for (i = 0; i < string.length; i++) {
    chr = string.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
  }
  return hash.toString(16);
}
