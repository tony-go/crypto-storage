import {createTestServer} from '../utils/testUtils'
import {createTestClient} from 'apollo-server-testing'
import {gql} from 'apollo-server'

import db from '../utils/mocks/db'

describe('user module', () => {
  let user: unknown = {
    role: 'ADMIN',
  }
  const context = () => ({
    db,
    user,
  })
  const server = createTestServer(context)
  const {query, mutate} = createTestClient(server as any)
  const id = '2'

  describe('queries', () => {
    afterEach(() => {
      jest.clearAllMocks()
      user = {
        role: 'ADMIN',
      }
    })

    describe('users query', () => {
      const usersQuery = gql`
        {
          users {
            id
            lastName
            firstName
            genre
          }
        }
      `

      it('users query should return data.users', async () => {
        const {data, errors} = await query({query: usersQuery})

        expect(data?.users).toBeTruthy()
        expect(errors).toBeFalsy()
      })

      it('users query should return an error when ctx.user is not defined', async () => {
        user = null
        const {errors, data} = await query({query: usersQuery})

        expect(errors).toBeTruthy()
        expect(data?.users).toBeFalsy()
      })

      it('users query should return an error when ctx.user.role is not ADMIN', async () => {
        user = {role: 'USER'}
        const {errors, data} = await query({query: usersQuery})

        expect(errors).toBeTruthy()
        expect(data?.users).toBeFalsy()
      })
    })

    describe('query user', () => {
      const userQuery = gql`
        query User($id: String!) {
          user(id: $id) {
            id
            lastName
          }
        }
      `
      const variables = {id}

      it('query user should return data.user', async () => {
        const {data, errors} = await query({
          query: userQuery,
          variables,
        })

        expect(data?.user).toBeTruthy()
        expect(errors).toBeFalsy()
      })

      it('user query should return an error when ctx.user in undefined', async () => {
        user = null
        const {errors, data} = await query({
          query: userQuery,
          variables,
        })

        expect(data?.user).toBeFalsy()
        expect(errors).toBeTruthy()
      })

      it('user query should return an error when ctx.user.role is not ADMIN', async () => {
        user = {role: 'USER'}
        const {data, errors} = await query({
          query: userQuery,
          variables,
        })

        expect(data?.user).toBeFalsy()
        expect(errors).toBeTruthy()
      })
    })
  })

  describe('mutations', () => {
    const userSource: any = {
      firstName: 'bakate',
      lastName: 'yoyo',
      password: 'lol',
      email: 'bakate@lo.fr',
      genre: 'MALE',
    }
    afterEach(() => {
      user = {
        role: 'ADMIN',
      }
    })

    describe('addUser mutation', () => {
      const mutation = gql`
        mutation AddUser($user: UserInput!) {
          addUser(user: $user) {
            id
          }
        }
      `
      const variables = {user: userSource}

      it('addUser mutation should return a data property', async () => {
        const {data, errors} = await mutate({
          mutation,
          variables,
        })

        expect(data?.addUser).toBeTruthy()
        expect(errors).toBeFalsy()
      })

      it('addUser mutation should return an error with no user in ctx', async () => {
        user = null
        const {errors, data} = await mutate({
          mutation,
          variables,
        })

        expect(errors).toBeTruthy()
        expect(data?.addUser).toBeFalsy()
      })

      it('addUser mutation should return with a USER role', async () => {
        user = {role: 'USER'}
        const {errors, data} = await mutate({
          mutation,
          variables,
        })

        expect(errors).toBeTruthy()
        expect(data?.addUser).toBeFalsy()
      })
    })

    describe('updateUser', () => {
      const mutation = gql`
        mutation updateUser($user: UpdateUserInput!) {
          updateUser(user: $user) {
            id
          }
        }
      `
      const variables = {
        user: {
          ...userSource,
          id,
        },
      }

      it('updateUser should return a data.updateUser', async () => {
        const {data, errors} = await mutate({
          mutation,
          variables,
        })

        expect(data?.updateUser).toBeTruthy()
        expect(errors).toBeFalsy()
      })

      it('updateUser should return an error when user in not authenticated', async () => {
        user = null
        const {data, errors} = await mutate({
          mutation,
          variables,
        })
        expect(data?.updateUser).toBeFalsy()
        expect(errors).toBeTruthy()
      })

      it('updateUser should return an error when user is not admin', async () => {
        user = {role: 'USER'}
        const {data, errors} = await mutate({
          mutation,
          variables,
        })
        expect(data?.updateUser).toBeFalsy()
        expect(errors).toBeTruthy()
      })
    })

    describe('deleteUser', () => {
      const mutation = gql`
        mutation DeleteUser($id: String!) {
          deleteUser(id: $id) {
            id
          }
        }
      `
      const variables = {id}

      it('should return a data.deleteUser when user is authenticated', async () => {
        const {data, errors} = await mutate({mutation, variables})

        expect(data?.deleteUser).toBeTruthy()
        expect(errors).toBeFalsy()
      })

      it('should return an error when user is not authenticated', async () => {
        user = null
        const {data, errors} = await mutate({mutation, variables})

        expect(data?.deleteUser).toBeFalsy()
        expect(errors).toBeTruthy()
      })

      it('should return an error when user is not Admin', async () => {
        user = {role: 'USER'}
        const {data, errors} = await mutate({mutation, variables})

        expect(data?.deleteUser).toBeFalsy()
        expect(errors).toBeTruthy()
      })
    })
  })
})
