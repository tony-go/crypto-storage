enum Genre {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export interface IUser {
  id?: number
  firstName: string
  lastName: string
  email: string
  password: string
  genre: Genre
  role: Role
}

export interface IUserIdArgs {
  id: number
}

export interface IUserArgs {
  user: IUser
}
