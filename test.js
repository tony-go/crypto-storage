const CryptoStorage = require('.')

// exec for test (delete after dev)
const storage = CryptoStorage()

storage.on('ready', async function(err) {
  if (err) throw err
  console.log('CryptoStorage is ready !')
  await storage.setPassword('toto')
  // await storage.setItem('wife', 'jamila')
})

storage.on('data', data => {
  console.log('data => ', data)
})

window.CryptoStorage = storage