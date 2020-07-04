import {gql, AuthenticationError, UserInputError} from 'apollo-server'
import {hash, compare} from 'bcrypt'
import {sign} from 'jsonwebtoken'
import {User} from '@prisma/client'

import env from './../env'

import {Parent} from '../types'
import {IContext} from '../context'
import {formatSignUpInput, createToken, formatPublicUser} from './utils'

export const authTypeDefs = gql`
  input SignInInput {
    email: String!
    password: String!
    firstName: String
    lastName: String
    genre: Genre
  }

  type SignOutput {
    user: User
    token: String
  }

  input SignUpInput {
    email: String!
    password: String!
  }

  extend type Mutation {
    signIn(input: SignInInput!): SignOutput
    signUp(input: SignUpInput!): SignOutput
  }
`

export interface ISignInInput {
  email: string
  password: string
  firstName: string
  lastName: string
  genre: 'MALE' | 'FEMALE'
}

export interface ISignUpInput {
  email: string
  password: string
}

export const authResolvers = {
  Mutation: {
    signIn: async (
      parent: Parent,
      {input}: {input: ISignInInput},
      {db}: IContext,
    ): Promise<{token: string; user: User}> => {
      // We format input
      const formattedInput = await formatSignUpInput(input)

      // We add it to the db
      const user = await db.user.create({data: formattedInput})

      // we send back the user and a token
      return {
        token: createToken(user),
        user: formatPublicUser(user),
      }
    },
    signUp: async (
      parent: Parent,
      {input}: {input: ISignUpInput},
      {db}: IContext,
    ): Promise<{token: string; user: User}> => {
      const user = await db.user.findOne({
        where: {email: input.email.toLowerCase()},
      })

      if (!user) {
        throw new AuthenticationError(
          `User with email address ${input.email} doesn't exist`,
        )
      }

      const match = await compare(input.password, user.password)

      if (!match) {
        throw new UserInputError('Wrong password')
      }

      return {
        token: sign(user, env.SECRET_KEY, {expiresIn: '30d'}),
        user,
      }
    },
  },
}
