import {gql} from 'apollo-server'
import {hash} from 'bcrypt'

import {IUserArgs, IUserIdArgs} from './types'

import {IContext} from '../context'
import {Parent} from '../types'
import {checkUserValidity} from '../utils/user'

export const userTypeDefs = gql`
  enum Role {
    USER
    ADMIN
  }

  enum Genre {
    MALE
    FEMALE
  }

  type User {
    id: String
    firstName: String
    lastName: String
    email: String
    password: String
    role: Role
    genre: Genre
    list: [List]
  }

  input UserInput {
    firstName: String
    lastName: String
    email: String!
    password: String!
    genre: Genre
    role: Role
  }

  input UpdateUserInput {
    id: String
    firstName: String
    lastName: String
    email: String
    password: String
    genre: Genre
    role: Role
  }

  extend type Query {
    user(id: String!): User
    users: [User]
  }

  extend type Mutation {
    addUser(user: UserInput!): User
    updateUser(user: UpdateUserInput!): User
    deleteUser(id: String!): User
  }
`

export const userResolvers = {
  Query: {
    user: async (parent: Parent, args: IUserIdArgs, context: IContext) => {
      checkUserValidity(context)

      const {db} = context
      const {id} = args
      return await db.user.findOne({where: {id}})
    },
    users: async (parent: Parent, args: any, context: IContext) => {
      checkUserValidity(context)

      const {db} = context
      return await db.user.findMany({first: 50})
    },
  },
  Mutation: {
    addUser: async (parent: Parent, args: IUserArgs, context: IContext) => {
      checkUserValidity(context)

      const {db} = context
      const {user: newUser} = args

      newUser.password = await hash(newUser.password, 10)
      return await db.user.create({data: newUser})
    },
    updateUser: async (parent: Parent, args: IUserArgs, context: IContext) => {
      checkUserValidity(context)

      const {db} = context
      const {user: userToUpdate} = args
      const {id, ...userRest} = userToUpdate

      if (userRest.password) {
        userRest.password = await hash(userRest.password, 10)
      }
      return await db.user.update({where: {id}, data: userRest})
    },
    deleteUser: async (
      parent: Parent,
      {id}: IUserIdArgs,
      context: IContext,
    ) => {
      checkUserValidity(context)

      const {db} = context
      return await db.user.delete({where: {id}})
    },
  },
}
