const {hashString} = require('./utils')

const SALT_KEY = 'salt_key'
const IV_KEY = 'iv_key'
const PASSWORD_LENGTH = 5
const NAME_LENGTH = 1
const TABLE_NAME_KEY = hashString('TABLE_NAME')

module.exports = {
  SALT_KEY,
  IV_KEY,
  PASSWORD_LENGTH,
  NAME_LENGTH,
  TABLE_NAME_KEY,
}
