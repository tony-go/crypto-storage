'use strict'

const {SALT_KEY, IV_KEY} = require('./constant')

function generateSalt(storage) {
  if (!storage) {
    throw new Error('No storage provided')
  }

  const salt = window.crypto.getRandomValues(new Uint8Array(8))
  storage.setItem(SALT_KEY, JSON.stringify(Array.from(salt)))
  return salt
}

function getSalt(storage) {
  if (!storage) {
    throw new Error('No storage provided')
  }

  const currentSalt = storage.getItem(SALT_KEY)
  return currentSalt
    ? new Uint8Array(JSON.parse(currentSalt))
    : generateSalt(storage)
}

// TODO: use name too
async function getDerivedKey(pw, storage) {
  if (!storage) {
    throw new Error('No storage provided')
  }

  const salt = getSalt(storage)
  const params = {
    name: 'PBKDF2',
    hash: 'SHA-1',
    salt: salt,
    iterations: 5000,
  }
  const algorithm = {name: 'AES-GCM', length: 256}

  return window.crypto.subtle.deriveKey(params, pw, algorithm, false, [
    'encrypt',
    'decrypt',
  ])
}

function generateIv(storage) {
  if (!storage) {
    throw new Error('No storage provided')
  }

  const nonce = window.crypto.getRandomValues(new Uint8Array(16))
  storage.setItem(IV_KEY, JSON.stringify(Array.from(nonce)))
  return nonce
}

function getIv(storage) {
  if (!storage) {
    throw new Error('No storage provided')
  }

  return storage.getItem(IV_KEY)
    ? new Uint8Array(JSON.parse(storage.getItem(IV_KEY)))
    : generateIv(storage)
}

async function getEncryptedEntity(string) {
  const bufferName = new TextEncoder('utf-8').encode(string)
  return await window.crypto.subtle.importKey(
    'raw',
    bufferName,
    'PBKDF2',
    false,
    ['deriveKey'],
  )
}

module.exports = {
  generateSalt,
  getSalt,
  getDerivedKey,
  generateIv,
  getIv,
  getEncryptedEntity,
}
