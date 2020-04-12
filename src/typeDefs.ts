import { gql } from "apollo-server";

import { userTypeDefs } from "./users";
import { listTypeDefs } from "./lists";

const baseTypeDefs = gql`
  type Query
  type Mutation
`;

export default [baseTypeDefs, userTypeDefs, listTypeDefs];
