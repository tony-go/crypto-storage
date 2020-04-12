import { ApolloServer } from "apollo-server";

import context from "./context";
import typeDefs from "./typeDefs";
import resolvers from "./resolvers";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context,
});

server.listen().then(({ url }) => {
  console.log(`🚀 GraphQl server ready at ${url}`);
});
