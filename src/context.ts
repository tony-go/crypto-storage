import {verify} from 'jsonwebtoken'
import {PrismaClient} from '@prisma/client'

import env from './env'

import {IUser} from './users/types'

export interface IContext {
  db: PrismaClient
  user: null | IUser
}

export function getUser(token: string): null | IUser {
  if (!token) {
    return null
  }
  return verify(token, env.SECRET_KEY) as IUser
}

const db = new PrismaClient()

export default ({req}: any): IContext => {
  const token = req.headers.authorization || ''

  return {
    db,
    user: getUser(token),
  }
}
