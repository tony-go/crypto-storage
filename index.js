'use strict'

const {crypto, utils, constant} = require('./lib')

const {getDerivedKey, getIv, getEncryptedEntity} = crypto
const {
  SALT_KEY,
  IV_KEY,
  PASSWORD_LENGTH,
  NAME_LENGTH,
  TABLE_NAME_KEY,
} = constant
const {
  encode,
  decode,
  arrayBufferToBase64,
  base64ToArrayBuffer,
  hashString,
} = utils

class CryptoStorage {
  /**
   * Init crypto-storage instance with a name and a password
   * @param {*} ctx {name:string , password: string}
   */
  constructor(ctx) {
    this._userPassword = null
    this._userName = null
    this._storage = null
    this._ctx = ctx
    this._checkStorage()
  }

  async create() {
    const {password, name} = this._ctx
  
    if (!name || typeof name !== 'string' || name.length < NAME_LENGTH) {
      throw new Error(`name should be a string of ${NAME_LENGTH} characters`)
    }
  
    if (
      !password ||
      typeof password !== 'string' ||
      password.length < PASSWORD_LENGTH
    ) {
      throw new Error(`password should be a string of ${PASSWORD_LENGTH} characters`)
    }
    
    this._setTableName(name)
    this._userName = await getEncryptedEntity(name)
    this._userPassword = await getEncryptedEntity(password)
  }
  
  async use () {
    const {password, name} = this._ctx
  
    this._checkTableName()
  
    this._userName = await getEncryptedEntity(name)
    this._userPassword = await getEncryptedEntity(password)
  }
  
  async setItem (key, value) {
    if (!this._userPassword || !this._userName)
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
    return unEncryptedData
  }
  
  async getItem (key) {
    if (!this._userPassword)
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
  
  removeItem (key) {
    if (!this._userPassword)
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
  
  close () {
    this._userPassword = null
    this._userName = null
  }
  
  _checkStorage () {
    if (!window || !window.localStorage) {
      throw new Error('localStorage is not available for now')
    }
    this._storage = window.localStorage
  }
  
  _checkTableName () {
    const {name} = this._ctx
    const rawTable = this._storage.getItem(TABLE_NAME_KEY)
    const hashName = hashString(name)
    const tableName = JSON.parse(rawTable)
  
    if (!rawTable || !tableName.includes(hashName)) {
      throw new Error('This name is not registered, you should create an instance instead')
    }
    return true
  }
  
  _setTableName (name) {
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
}

module.exports = CryptoStorage
