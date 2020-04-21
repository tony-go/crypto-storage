import { gql } from "apollo-server";
import { hash } from "bcrypt";

import { IUserArgs, IUserIdArgs } from "./types";

import { IContext } from "../context";
import { Parent } from "../types";

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
  }

  input UpdateUserInput {
    id: String
    firstName: String
    lastName: String
    email: String
    password: String
    genre: Genre
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
`;

export const userResolvers = {
  Query: {
    user: async (parent: Parent, args: IUserIdArgs, { db, user }: IContext) => {
      const { id } = args;
      return await db.user({ id });
    },
    users: async (parent: Parent, args: any, { db }: IContext) => {
      return await db.users();
    }
  },
  Mutation: {
    addUser: async (parent: Parent, args: IUserArgs, { db }: IContext) => {
      const { user } = args;
      user.password = await hash(user.password, 10);
      return await db.createUser({ ...user });
    },
    updateUser: async (parent: Parent, args: IUserArgs, { db }: IContext) => {
      const {
        user: { id, ...userRest }
      } = args;
      if (userRest.password) {
        userRest.password = await hash(userRest.password, 10);
      }
      return await db.updateUser({ where: { id }, data: userRest });
    },
    deleteUser: async (
      parent: Parent,
      { id }: IUserIdArgs,
      { db }: IContext
    ) => {
      return await db.deleteUser({ id });
    }
  }
};
