import {gql} from 'apollo-server'

import {Parent} from '../types'
import {IContext} from '../context'
import {checkUserValidity} from '../utils/user'

export const listTypeDefs = gql`
  enum MemberShip {
    CONTRIBUTOR
    ADMIN
  }

  type Member {
    id: Int!
    userId: Int!
    listId: Int!
    status: MemberShip
  }

  input MemberInput {
    user: String!
    status: MemberShip
  }

  type List {
    id: Int
    name: String!
    authorId: Int!
    description: String
    familyName: String
    babyGenre: Genre
    babyName: String
    birthDate: String
    members: [Member]
    isActivated: Boolean!
    isOpen: Boolean!
  }

  input CreateListInput {
    name: String!
    description: String
    familyName: String
    babyGenre: Genre
    babyName: String
    birthDate: String
    members: [MemberInput!]
    isActivated: Boolean!
    isOpen: Boolean!
  }

  extend type Query {
    listsAsAuthor: [List!]
    listsAsMember: [List!]
  }

  extend type Mutation {
    createList(input: CreateListInput!): List
  }
`

export const listResolvers = {
  Query: {
    listsAsAuthor: async (parent: Parent, args: {}, context: IContext) => {
      checkUserValidity(context)

      const {db, user} = context

      return await db.list.findMany({
        where: {authorId: user?.id},
      })
    },
    listsAsMember: async (
      parent: Parent,
      args: {},
      context: IContext,
      info: any,
    ) => {
      checkUserValidity(context)

      const {db, user} = context

      return await db.list.findMany({where: {members: {some: {id: user?.id}}}})
    },
  },
  Mutation: {
    createList: async (
      parent: Parent,
      args: {input: any},
      context: IContext,
    ) => {
      checkUserValidity(context)

      const {db, user} = context

      return await db.list.create({
        data: {
          ...args.input,
          author: {
            connect: {email: user?.email},
          },
        },
      })
    },
  },
}
