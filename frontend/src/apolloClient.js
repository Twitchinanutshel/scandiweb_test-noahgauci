import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const client = new ApolloClient({
  link: new HttpLink({
    uri: 'https://scandiweb-test-noahgauci-5b174efbd7da.herokuapp.com/graphql',
    credentials: 'omit',
    headers: {
      'Content-Type': 'application/json',
    },
  }),
  cache: new InMemoryCache(),
});

export default client;
