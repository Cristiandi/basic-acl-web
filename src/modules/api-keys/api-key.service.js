import { gql } from 'graphql-request';

import { getDataForAuth } from '../../common/utils';
import { API_URL } from '../../config';

import { getClient } from '../../graphql';
class ApiKeyService {
  constructor() {
    this.baseUrl = API_URL;
  }

  async findAll() {
    const dataForAuth = getDataForAuth();

    if (!dataForAuth) {
      throw new Error('can not get data for auth.');
    }

    const { companyUid, companyAccessKey } = dataForAuth;

    const graphQLClient = await getClient({ 'access-key': companyAccessKey });

    const query = gql`
      query getAllApiKeys (
          $companyUid: String!
          $limit: Int
          $skip: Int
          $q: String
      ) {
          getAllApiKeys (
              getAllApiKeysInput: {
                  companyUid: $companyUid
                  limit: $limit
                  skip: $skip
                  q: $q
              }
          ) {
              id
              uid
              alias
              value
              createdAt
              updatedAt
          }
      }
    `;
    
    const variables = {
      companyUid,
      limit: 100,
      skip: 0,
    };

    const { getAllApiKeys } = await graphQLClient.request(query, variables);

    return getAllApiKeys;
  }

  async create(item = {}) {
    const dataForAuth = getDataForAuth();

    if (!dataForAuth) {
      throw new Error('can not get data for auth.');
    }

    const { companyUid, companyAccessKey } = dataForAuth;

    const graphQLClient = await getClient({ 'access-key': companyAccessKey });

    const mutation = gql`
      mutation createApiKey (
          $companyUid: String!
          $alias: String
      ) {
          createApiKey (
              createApiKeyInput: {
                  companyUid: $companyUid
                  alias: $alias
              }
          ) {
              id
              uid
              value
              alias
              company {
                  id
              }
          }
      }
    `;
    
    const variables = {
      companyUid,
      alias: item.alias,
    };

    const { createApiKey } = await graphQLClient.request(mutation, variables);

    return createApiKey;
  }

  async remove(item = {}) {
    const dataForAuth = getDataForAuth();

    if (!dataForAuth) {
      throw new Error('can not get data for auth.');
    }

    const { companyAccessKey } = dataForAuth;

    const graphQLClient = await getClient({ 'access-key': companyAccessKey });

    const query = gql`
      mutation deleteApiKey (
          $uid: String!
      ) {
          deleteApiKey (
              getOneApiKeyInput: {
                  uid: $uid
              }
          ) {
              id
              uid
              alias
              value
              createdAt
              updatedAt
          }
      }
    `;

    const variables = {
      uid: item.uid,
    };

    const { deleteApiKey } = await graphQLClient.request(query, variables);

    return deleteApiKey;
  }
}

export const apiKeyService = new ApiKeyService();