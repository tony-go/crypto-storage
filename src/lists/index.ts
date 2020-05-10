import { gql } from "apollo-server";

import { Parent } from "../types";
import { IContext } from "../context";
import { ListCreateInput, ListWhereInput } from "../generated/prisma-client";

export const listTypeDefs = gql`
  enum MemberShip {
    CONTRIBUTOR
    ADMIN
  }

  enum ListAs {
    AUTHOR
    MEMBER
  }

  type Member {
    id: String!
    user: User!
    status: MemberShip
  }

  input MemberInput {
    user: String!
    status: MemberShip
  }

  type List {
    id: String
    name: String!
    author: String!
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
    author: String!
    description: String
    familyName: String
    babyGenre: Genre
    babyName: String
    birthDate: String
    members: [MemberInput]
    isActivated: Boolean!
    isOpen: Boolean!
  }

  extend type Query {
    lists(as: ListAs!): [List]
  }

  extend type Mutation {
    createList(input: CreateListInput!): List
  }
`;

type ListAs = "AUTHOR" | "MEMBER";

interface IGetListsArgs {
  as: ListAs;
}

export const listResolvers = {
  Query: {
    lists: async (
      parent: Parent,
      args: IGetListsArgs,
      { db, user }: IContext
    ) => {
      if (user && typeof user === "object") {
        const { id } = user;
        const { as } = args;
        if (as === "AUTHOR") {
          return await db.lists({ where: { author: { id } } });
        }
        if (as === "MEMBER") {
          return await db.lists({ where: { members_some: { id } } });
        }
      } else {
        // should throw
      }
    },
  },
  Mutation: {
    createList: async (
      parent: Parent,
      args: { input: any },
      { db }: IContext
    ) => {
      return await db.createList({
        ...args.input,
        author: {
          connect: { id: args.input.author },
        },
      });
    },
  },
};
