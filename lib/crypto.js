'use strict'
const { SALT_KEY, IV_KEY } = require('../constant')

function generateSalt () {
  const salt = window.crypto.getRandomValues(new Uint8Array(8))
  window.localStorage.setItem(SALT_KEY, JSON.stringify(Array.from(salt)))
  return salt
}

function getSalt () {
  const currentSalt = window.localStorage.getItem(SALT_KEY)
  return currentSalt
    ? new Uint8Array(JSON.parse(currentSalt))
    : generateSalt()
}

async function getDerivedKey (pw) {
  const salt = getSalt()
  const params = {
    name: 'PBKDF2',
    hash: 'SHA-1',
    salt: salt,
    iterations: 5000
  }
  const algorithm = { name: 'AES-GCM', length: 256 }
  return window.crypto.subtle.deriveKey(
    params,
    pw,
    algorithm,
    false,
    ['encrypt', 'decrypt']
  )
}

function generateIv () {
  const nonce = window.crypto.getRandomValues(new Uint8Array(16))
  window.localStorage.setItem(IV_KEY, JSON.stringify(Array.from(nonce)))
  return nonce
}

function getIv () {
  return window.localStorage.getItem(IV_KEY)
    ? new Uint8Array(JSON.parse(window.localStorage.getItem(IV_KEY)))
    : generateIv()
}

module.exports = {
  generateSalt,
  getSalt,
  getDerivedKey,
  generateIv,
  getIv
}
