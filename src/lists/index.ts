import { gql } from "apollo-server";

export const listTypeDefs = gql`
  type List {
    id: String
    name: String
    author: User
  }
`;

export const listResolvers = {
  Query: {},
};
