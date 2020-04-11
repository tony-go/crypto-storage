import { ApolloServer } from "apollo-server";
import merge from "lodash/fp/merge";

import context from "./context";
import baseTypeDefs from "./typeDefs";

import { userResolvers, userTypeDefs } from "./users";
import { listResolvers, listTypeDefs } from "./lists";

const server = new ApolloServer({
  typeDefs: [baseTypeDefs, userTypeDefs, listTypeDefs],
  resolvers: merge(userResolvers, listResolvers),
  context,
});

server.listen().then(({ url }) => {
  console.log(`🚀 GraphQl server ready at ${url}`);
});
