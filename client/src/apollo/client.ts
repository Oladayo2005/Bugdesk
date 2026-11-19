
import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  from,
} from "@apollo/client";

import { setContext } from "@apollo/client/link/context";

// GraphQL server connection
const httpLink = new HttpLink({
  uri: "https://bugdesk-backend.onrender.com/graphql",
});

// Attach JWT to every request
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// Create Apollo Client
const client = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
});

export default client;
