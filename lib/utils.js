'use strict'

function encode(value) {
  if (!value) return ''
  if (typeof value !== 'object') {
    value = {'-1': value}
  }
  return new TextEncoder('utf-8').encode(JSON.stringify(value))
}

function decode(buffer) {
  if (!(!buffer || !buffer.constructor || buffer.constructor !== Uint8Array)) {
    throw new Error('buffer args (Uint8Array) is required')
  }
  const stringValue = new TextDecoder('utf-8').decode(buffer)
  const objectValue = JSON.parse(stringValue)
  if (objectValue['-1']) return objectValue['-1']
  return objectValue
}

function arrayBufferToBase64(buffer) {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}

function base64ToArrayBuffer(stringBase64) {
  const binary = window.atob(stringBase64)
  const len = binary.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] += binary.charCodeAt(i)
  }
  return bytes.buffer
}

function hashString(string) {
  let hash = 0
  let i
  let chr
  if (string.length === 0) return hash.toString(16)
  for (i = 0; i < string.length; i++) {
    chr = string.charCodeAt(i)
    hash = (hash << 5) - hash + chr
  }
  return hash.toString(16)
}

module.exports = {
  encode,
  decode,
  arrayBufferToBase64,
  base64ToArrayBuffer,
  hashString,
}
