const getFakeUser = () => Promise.resolve({name: 'Tony'})

export default {
  user: {
    findMany: jest.fn(() => [getFakeUser()]),
    findOne: jest.fn(getFakeUser),
    create: jest.fn(getFakeUser),
    update: jest.fn(getFakeUser),
    delete: jest.fn(getFakeUser),
  },
}
