import { gql } from 'graphql-request';

import { getDataForAuth } from '../../common/utils';
import { API_URL } from '../../config';

import { getClient } from '../../graphql';

class RoleService {
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
      query getAllRoles (
          $companyUid: String!
          $limit: Int
          $skip: Int
          $q: String
      ) {
          getAllRoles (
              getRolesInput: {
                  companyUid: $companyUid
                  limit: $limit
                  skip: $skip
                  q: $q
              }
          ) {
              id
              uid
              code
              name
              description
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

    const data = await graphQLClient.request(query, variables);

    const { getAllRoles } = data;

    return getAllRoles;
  }

  async create(item = {}) {
    const dataForAuth = getDataForAuth();

    if (!dataForAuth) {
      throw new Error('can not get data for auth.');
    }

    const { companyUid, companyAccessKey } = dataForAuth;

    const graphQLClient = await getClient({ 'access-key': companyAccessKey });

    const mutation = gql`
      mutation createRole (
          $companyUid: String!
          $code: String!
          $name: String!
          $description: String
      ) {
          createRole (
              createRoleInput: {
                  companyUid: $companyUid
                  code: $code
                  name: $name
                  description: $description
              }
          ) {
              id
              uid
              code
              name
              description
              company {
                  id
              }
          }
      }
    `;

    const { name, code, description } = item;

    const variables = {
      companyUid,
      code,
      name,
      description,
    };

    const data = await graphQLClient.request(mutation, variables);
    
    const { createRole } = data;

    return createRole;
  }

  async update(item = {}) {
    const dataForAuth = getDataForAuth();

    if (!dataForAuth) {
      throw new Error('can not get data for auth.');
    }

    const { companyAccessKey } = dataForAuth;

    const graphQLClient = await getClient({ 'access-key': companyAccessKey });

    const mutation = gql`
      mutation updateRole (
          $uid: String!
          $code: String
          $name: String
          $description: String
      ) {
          updateRole (
              getOneRoleInput: {
                  uid:  $uid
              }
              updateRoleInput: {
                  name: $name
                  code: $code
                  description: $description
              }
          ) {
              id
              code
              name
              description
              company {
                  id
              }
          }
      }
    `;

    const variables = {
      uid: item.uid,
      code: item.code,
      name: item.name,
      description: item.description,
    };

    const data = await graphQLClient.request(mutation, variables);

    const { updateRole } = data;

    return updateRole;
  }

  async remove(item = {}) {
    const dataForAuth = getDataForAuth();

    if (!dataForAuth) {
      throw new Error('can not get data for auth.');
    }

    const { companyAccessKey } = dataForAuth;

    const graphQLClient = await getClient({ 'access-key': companyAccessKey });

    const mutation = gql`
      mutation deleteRole (
          $uid: String!
      ) {
          deleteRole (
              getOneRoleInput: {
                  uid: $uid
              }
          ) {
              id
              code
              name
              description
              company {
                  id
              }
          }
      }
    `;

    const variables = {
      uid: item.uid,
    };

    const data = await graphQLClient.request(mutation, variables);

    const { deleteRole } = data;

    return deleteRole;
  }
}

export const roleService = new RoleService();