import {gql, AuthenticationError, UserInputError} from 'apollo-server'
import {Parent} from '../types'
import {IContext} from '../context'
import {hash, compare} from 'bcrypt'
import {sign} from 'jsonwebtoken'

export const authTypeDefs = gql`
  input SignInInput {
    email: String
    password: String
  }

  type SignOutput {
    user: User
    token: String
  }

  input SignUpInput {
    email: String
    password: String
  }

  extend type Mutation {
    signIn(input: SignInInput!): SignOutput
    signUp(input: SignUpInput!): SignOutput
  }
`

interface ISignInInput {
  input: {
    email: string
    password: string
    firstName: string
    lastName: string
    genre: 'MALE' | 'FEMALE'
  }
}

interface ISignUpInput {
  input: {
    email: string
    password: string
  }
}

export const secretKey = 'salut les copains'

export const authResolvers = {
  Mutation: {
    signIn: async (parent: Parent, {input}: ISignInInput, {db}: IContext) => {
      input.password = await hash(input.password, 10)
      input.email = input.email.toLowerCase()
      const user = await db.user.create({data: input})

      return {
        token: sign(user, secretKey, {expiresIn: '30d'}),
        user,
      }
    },
    signUp: async (parent: Parent, {input}: ISignUpInput, {db}: IContext) => {
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
        token: sign(user, secretKey, {expiresIn: '30d'}),
        user,
      }
    },
  },
}