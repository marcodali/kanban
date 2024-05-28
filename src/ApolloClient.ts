import { ApolloClient, InMemoryCache } from "@apollo/client";


const GRAPHQL_URL = process.env.REACT_APP_GRAPHQL_URL;

if (!GRAPHQL_URL) {
  throw new Error("La URL de GraphQL no está definida en las variables de entorno");
}

const client = new ApolloClient({
  uri: GRAPHQL_URL,
  cache: new InMemoryCache(),
});

export default client;