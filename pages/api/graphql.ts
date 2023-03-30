import { ApolloServer } from '@apollo/server';
import axios from 'axios';
import { startServerAndCreateNextHandler } from "@as-integrations/next"
import { NextApiRequest, NextApiResponse } from 'next';

const PORT = 4000
const isDevEnvironment = process.env.NODE_ENV === 'development'
const BASE_URL = isDevEnvironment ? `http://localhost:${PORT}` : 'https://nice-reads-api.vercel.app'
const FRONTEND_URL = isDevEnvironment ? 'http://localhost:3000' : 'https://nice-reads.vercel.app'

const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type Book {
    id: Int!
    title: String
    author: String
  }

  type Person {
    name: String
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    book(id: Int!): Book
    books: [Book]!
    persons: [Person]!
  }
`;

type Book = {
  id: number,
  title?: string,
  author?: string
}

const resolvers = {
    Query: {
        book: async (_: any, args: { id: number }) => {
          const books: Book[] = await axios.get(`${BASE_URL}/api/books`).then(res => res.data as Book[])
          return books?.find(i => i?.id === args.id);
        },
        books: () => axios.get(`${BASE_URL}/api/books`).then(res => res.data).catch(console.error),
        persons: () => axios.get(`${BASE_URL}/api/persons`).then(res => res.data).catch(console.error),
    },
};

const server = new ApolloServer({
  typeDefs,
  resolvers
})

const handler = startServerAndCreateNextHandler(server);

const graphql = async (req: NextApiRequest, res: NextApiResponse) => {
  res.setHeader('Access-Control-Allow-Origin', FRONTEND_URL);
  res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
  if (req?.method === 'OPTIONS') {
    res.statusCode = 200
    res.end()
    return
  }
  await handler(req, res);
  return
};

export default graphql;
