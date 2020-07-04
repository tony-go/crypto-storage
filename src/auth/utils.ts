import {User} from '@prisma/client'
import * as isEmailValid from 'email-validator'
import {hash} from 'bcrypt'
import {sign} from 'jsonwebtoken'

import {ISignInInput} from './index'
import env from '../env'

const PASSWORD_LENGTH = 5

export async function formatSignUpInput(
  input: ISignInInput,
): Promise<ISignInInput> {
  if (input.password.length < PASSWORD_LENGTH) {
    throw new Error(
      `password should had a length of ${PASSWORD_LENGTH} at lest`,
    )
  }

  if (!isEmailValid.validate(input.email)) {
    throw new Error(`email is not valid`)
  }

  return {
    ...input,
    email: input.email.toLowerCase(),
    password: await hash(input.password, 10),
  }
}

export function createToken(user: User): string {
  return sign({id: user.id}, env.SECRET_KEY, {expiresIn: '30d'})
}

export function formatPublicUser(user: User): User {
  delete user.password
  return user
}
