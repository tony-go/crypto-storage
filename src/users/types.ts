enum Genre {
  MALE = "MALE",
  FEMALE = "FEMALE"
}

export interface IUserIdArgs {
  id: string;
}

export interface IUserArgs {
  user: {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    genre: Genre;
  };
}
