jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({})),
}))

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(() => ({
    firstName: 'tony',
  })),
  sign: jest.fn(() => 'token'),
}))

jest.mock('bcrypt', () => ({
  hash: jest.fn(() => Promise.resolve('xxxxx')),
  compare: jest.fn(() => Promise.resolve(true)),
}))
