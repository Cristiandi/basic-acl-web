import { GraphQLClient } from 'graphql-request';

import { GRAPHQL_ENDPOINT } from '../config';

export const getClient = async (headers = {}) => {
  /*
  if (auth.currentUser) {
    const { token } = await auth.currentUser.getIdTokenResult();

    headers = {
      ...headers,
      authorization: `Bearer ${token}`
    };
  }
  */

  const graphQLClient = new GraphQLClient(GRAPHQL_ENDPOINT, {
    headers
  });

  return graphQLClient;
};