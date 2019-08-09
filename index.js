'use strict'

const { EventEmitter } = require('events')
const mainKey = 'cs_root'
const saltKey = 'salt_key'

function CryptoStorage () {
  if (!(this instanceof CryptoStorage)) return new CryptoStorage()
  EventEmitter.call(this)

  // variables
  this._ready = false
  this._userPw = null
  this._db = null

  // init
  Promise.all([
    this._setDb(),
  ]).then(values => {
    const [db] = values
    this._db = db
    this._ready = true
    this.emit('ready', null)
  }).catch(error => this.emit('ready', error))

}

CryptoStorage.prototype = Object.create(EventEmitter.prototype)

CryptoStorage.prototype.setPassword = async function (password) {
  // add type check
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

CryptoStorage.prototype._setDb = function () {
  return new Promise((resolve, reject) => {
    if (!window || !window.localStorage) {
      reject('localStorage is not available for now')
    }
    // resolve(window.localStorage.getItem(mainKey) || {})
    resolve({})
  })
}

CryptoStorage.prototype._getDb = function () {
  return null
}

CryptoStorage.prototype.setItem = async function (key, value) {
  // add type check
  // add password check
  this._db[key] = value
  const bufferDB = encode(this._db)
  const nonce = crypto.getRandomValues(new Uint8Array(16))
  const algorithm = { name: 'AES-GCM', iv: nonce }

  const derivedKey = await getKey(this._userPw)
  const cryptoDB = await crypto.subtle.encrypt(algorithm, derivedKey, bufferDB)
  console.log(cryptoDB)
  console.log(String.fromCharCode.apply(null, cryptoDB))
  const formattedCryptoDB = JSON.stringify(Array.from(Object.values(cryptoDB).map(x => Array.from(x))))
  window.localStorage.setItem(mainKey, JSON.stringify(formattedCryptoDB))
  this.emit('data', this._db)

}

CryptoStorage.prototype.getItem = function () {
  return null
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
  return new Uint8Array(JSON.parse(window.localStorage.getItem(saltKey))) || generateSalt()
}

async function getKey (pw) {
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


