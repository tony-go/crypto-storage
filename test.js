const vhs = require('vhs-tape')
const CryptoStorage = require('.')

vhs('scenario #1: basic usage', async t => {
  // create a new storage
  const storage = new CryptoStorage({name: 'g-ray', password: 'password'})
  await storage.create()

  // add and get an item
  await storage.setItem('foo', 'bar')
  const foo = await storage.getItem('foo')
  t.equal(foo, 'bar', 'get the item before closing the instance')

  // close the session
  storage.close()

  // open it again
  const sameStorage = new CryptoStorage({name: 'g-ray', password: 'password'})
  await sameStorage.use()

  // get the item
  const foo2 = await sameStorage.getItem('foo')
  t.equal(foo2, 'bar', 'get the item after closing the instance')

  // clean up the storage
  window.localStorage.clear()
})

vhs(
  'scenario #2: cannot create two instance with same context (pw, name)',
  async t => {
    // create a new storage
    const storage = new CryptoStorage({name: 'g-ray', password: 'password'})
    await storage.create()

    // create it again
    try {
      await storage.create()
    } catch (error) {
      t.equal(error.message, 'Name g-ray is already used', 'should throw')
    }

    // clean up the storage
    window.localStorage.clear()
  },
)

vhs(
  'scenario #3: cannot create an instance without a name or a too small password',
  async t => {
    const storage = new CryptoStorage({name: '', password: 'password'})

    try {
      // create a new storage
      await storage.create()
    } catch (error) {
      t.equal(
        error.message,
        'name should be a string of 1 characters',
        'no name',
      )
    }

    const storage2 = new CryptoStorage({name: 'n', password: ''})

    try {
      // create a new storage
      await storage2.create()
    } catch (error) {
      t.equal(
        error.message,
        'password should be a string of 5 characters',
        'no name',
      )
    }
  },
)

vhs(
  'scenario #4: first try with a not valid password should not push name in table name',
  async t => {
    let storage = new CryptoStorage({name: 'toto', password: 'pass'})

    try {
      await storage.create()
    } catch (error) {
      t.equal(
        error.message,
        'password should be a string of 5 characters',
        'should fail at first try',
      )
    }

    storage = new CryptoStorage({name: 'toto', password: 'password'})
    await storage.create()
    await storage.setItem('foo', 'bar')
    const item = await storage.getItem('foo')
    t.equal(item, 'bar', 'crypto storage instance work')
  },
)

vhs('scenario #5: cannot create two instance with a same name', async t => {
  const storage = new CryptoStorage({name: 'newName', password: 'password'})
  await storage.create()

  await storage.setItem('foo', 'bar')
  const item = await storage.getItem('foo')
  t.equal(item, 'bar', 'crypto storage instance work')

  const otherStorage = new CryptoStorage({
    name: 'newName',
    password: 'password2',
  })
  try {
    await otherStorage.create()
  } catch (error) {
    t.equal(
      error.message,
      'Name newName is already used',
      'could not create two instance with the same name',
    )
  }
})

vhs(
  'scenario #6: open a session without name and found the previous one (not closed)',
  async t => {
    // create a new storage
    let storage = new CryptoStorage({name: 'g-ray', password: 'password'})
    await storage.create()

    // add and get an item
    await storage.setItem('foo', 'bar')
    const foo = await storage.getItem('foo')
    t.equal(
      foo,
      'bar',
      'get the item before destroying the instance (without .close)',
    )

    // the session is deleted but not closed
    storage = null

    // open it again
    const sameStorage = new CryptoStorage()
    await sameStorage.use()

    // get the item
    const foo2 = await sameStorage.getItem('foo')
    t.equal(foo2, 'bar', 'get the item after destroying previous instance')
  },
)
