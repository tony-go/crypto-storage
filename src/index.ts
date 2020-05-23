import {ApolloServer} from 'apollo-server'

import context from './context'
import typeDefs from './typeDefs'
import resolvers from './resolvers'

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context,
})

/**
 * Todo: Static Analysis
 * - add pre hook commit (husky)
 */

server.listen().then(({url}) => {
  console.log(`🚀 GraphQl server ready at ${url}`)
})
