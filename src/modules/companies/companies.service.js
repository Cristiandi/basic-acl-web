import {
  user as userFromStore
} from '../../common/store';

import axios from 'axios';
import { gql } from 'graphql-request';
import { get } from 'svelte/store';

import { getDataForAuth } from '../../common/utils';
import { API_URL } from '../../config';

import { getClient } from '../../graphql';

class CompanyService {
  constructor() {
    this.baseUrl = API_URL;
  }

  async getCompany() {
    const dataForAuth = getDataForAuth();

    if (!dataForAuth) {
      throw new Error('can not get data for auth.');
    }

    const { companyAccessKey, companyUid } = dataForAuth;

    const graphQLClient = await getClient({ 'access-key': companyAccessKey });

    const query = gql`
    query getCompany (
        $uid: String!
    ) {
        getCompany (
            getOneCompanyInput: {
                uid: $uid
            }
        ) {
            id
            name
            firebaseAdminConfig
            firebaseConfig
            website
        }
    }
    `;

    const variables = {
      uid: companyUid
    };

    const data = await graphQLClient.request(query, variables);

    const { getCompany } = data;

    return [getCompany];
  }

  async createCompany(company = {}) {
    const { name, firebaseAdminConfig, firebaseConfig } = company;

    const graphQLClient = await getClient({});

    const mutation = gql`
      mutation createCompany (
          $name: String!,
          $firebaseAdminConfig: JSONObject!,
          $firebaseConfig: JSONObject!
      ) {
          createCompany (
              createCompanyInput: {
                  name: $name,
                  firebaseAdminConfig: $firebaseAdminConfig,
                  firebaseConfig: $firebaseConfig
              }
          ) {
              id
              uid
              name
              firebaseAdminConfig
              firebaseConfig
          }
      }
    `;

    const variables = {
      name,
      firebaseAdminConfig,
      firebaseConfig,
    };

    const data = await graphQLClient.request(mutation, variables);

    const { createCompany } = data;

    return {
      ...createCompany,
      message: 'company created, please create your company admin.'
    };
  }

  async updateCompany(company = {}) {
    const dataForAuth = getDataForAuth();

    if (!dataForAuth) {
      throw new Error('can not get data for auth.');
    }

    const { companyUid, companyAccessKey } = dataForAuth;

    const graphQLClient = await getClient({ 'access-key': companyAccessKey });

    const mutation = gql`
      mutation updateCompany (
          $uid: String!
          $name: String
          $website: String
      ) {
          updateCompany (
              getOneCompanyInput: {
                  uid: $uid
              }
              updateCompanyInput: {
                  name: $name
                  website: $website
              }
          ) {
              id
              name
              website
              accessKey
              createdAt
              updatedAt
          }
      }
    `;

    const variables = {
      uid: companyUid,
      name: company.name,
      website: company.website,
    };

    const data = await graphQLClient.request(mutation, variables);

    const { updateCompany } = data;

    return {
      ...updateCompany,
    };
  }

  async removeCompany(id) {
    const dataForAuth = getDataForAuth();

    if (!dataForAuth) {
      throw new Error('can not get data for auth.');
    }

    const { accessToken, companyUuid } = dataForAuth;

    const response = await axios({
      url: `${this.baseUrl}companies/${companyUuid}`,
      method: 'delete',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'company-uuid': companyUuid,
      },
    });

    const { data } = response;

    return data;
  }

  getCompanyAccessKey() {
    const readedUser = get(userFromStore);

    return userFromStore ? readedUser.accessKey : undefined;
  }
}

export const companiesService = new CompanyService();
