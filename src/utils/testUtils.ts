import {ApolloServer} from 'apollo-server'

import typeDefs from '../typeDefs'
import resolvers from '../resolvers'

export const createTestServer = (context: any) =>
  new ApolloServer({
    typeDefs,
    resolvers,
    context,
  })
