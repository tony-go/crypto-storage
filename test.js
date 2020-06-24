const vhs = require('vhs-tape')
const CryptoStorage = require('.')

vhs('CryptoStorage opening depends on password argument', async t => {
  const storage = CryptoStorage('password')
  const storage2 = CryptoStorage('pass')
  const storage3 = CryptoStorage()

  storage.on('ready', err => {
    t.equal(err, null, 'Good password')
  })

  storage2.on('ready', err => {
    t.equal(
      err.message,
      'password should be a string of 5 characters',
      'Wrong password length',
    )
  })

  storage3.on('ready', err => {
    t.equal(
      err.message,
      'password should be a string of 5 characters',
      'No password',
    )
  })
})

vhs('Set/get crypt items in localStorage', t => {
  const storage = CryptoStorage('appendDataTest')
  storage.on('ready', async err => {
    if (err) console.log(err)
    // string
    await storage.setItem('name', 'crypto-storage')
    const string = await storage.getItem('name')
    t.equal(string, 'crypto-storage', 'string')

    // array
    const arrayKey = ['gray', 'braet', 'vivien']
    await storage.setItem('friends', arrayKey)
    const array = await storage.getItem('friends')
    t.equal(array.toString(), arrayKey.toString(), 'array')

    // object
    await storage.setItem('details', {age: 30, birthplace: 'neptune'})
    const object = await storage.getItem('details')
    t.equal(
      JSON.stringify(object),
      JSON.stringify({age: 30, birthplace: 'neptune'}),
      'object',
    )
    t.end()
  })
})
