import merge from "lodash/fp/merge";

import { userResolvers } from "./users";
import { listResolvers } from "./lists";
import { authResolvers } from "./auth";

export default {
  Query: Object.assign({}, userResolvers.Query, listResolvers.Query),
  Mutation: Object.assign(
    {},
    userResolvers.Mutation,
    authResolvers.Mutation,
    listResolvers.Mutation
  ),
};
