import { gql } from "apollo-server";

import { IContext } from "../context";

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
    firstName: String!
    lastName: String!
    email: String!
    password: String!
    genre: Genre!
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
    user: async (_: any, args: any, { db }: IContext) => {
      const { id } = args;
      return await db.user({ id });
    },
    users: async (_: any, __: any, { db }: IContext) => {
      return await db.users();
    },
  },
  Mutation: {
    addUser: async (_: any, args: any, { db }: IContext) => {
      const { user } = args;
      return await db.createUser({ ...user });
    },
    updateUser: async (_: any, args: any, { db }: IContext) => {
      const {
        user: { id, ...userRest },
      } = args;
      return await db.updateUser({ where: { id }, data: userRest });
    },
    deleteUser: async (_: any, { id }: any, { db }: IContext) => {
      return await db.deleteUser({ id });
    },
  },
};
