const vhs = require('vhs-tape')
const CryptoStorage = require('.')

vhs('CryptoStorage opening depends on context argument', async t => {
  const storage = CryptoStorage({name: 'g-ray', password: 'password'})
  const storage2 = CryptoStorage({name: 'A', password: 'pass'})
  const storage3 = CryptoStorage()
  const storage4 = CryptoStorage({name: 'A'})
  const storage5 = CryptoStorage({password: 'my-pass'})
  const storage6 = CryptoStorage({name: '', password: 'my-pass'})

  storage.on('ready', err => {
    t.equal(err, null, 'Good context')
  })

  storage2.on('ready', err => {
    t.equal(!!err.message, true, 'Wrong password length')
  })

  storage3.on('ready', err => {
    t.equal(!!err.message, true, 'No context')
  })

  storage4.on('ready', err => {
    t.equal(!!err.message, true, 'No password in context')
  })

  storage5.on('ready', err => {
    t.equal(!!err.message, true, 'No password in name')
  })

  storage6.on('ready', err => {
    t.equal(!!err.message, true, 'Wrong name length')
  })
})

vhs('Set/get crypt items in localStorage', t => {
  const storage = CryptoStorage({name: 'tester', password: 'appendDataTest'})
  storage.on('ready', async err => {
    if (err) console.log(err)

    // string
    await storage.setItem('name', 'crypto-storage')
    const string = await storage.getItem('name')
    t.equal(string, 'crypto-storage', 'string')

    // array
    const arrayKey = ['g-ray', 'braet', 'vivien']
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
