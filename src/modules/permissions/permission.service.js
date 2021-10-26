import axios from 'axios';

import { gql } from 'graphql-request';

import { getDataForAuth } from '../../common/utils';
import { API_URL } from '../../config';

import { getClient } from '../../graphql';

class PermissionService {
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
      query getAllPermissions (
          $companyUid: String!
          $limit: Int
          $skip: Int
          $q: String
      ) {
          getAllPermissions (
              getPermissionsInput: {
                  companyUid: $companyUid
                  limit: $limit
                  skip: $skip
                  q: $q
              }
          ) {
              id
              uid
              name
              allowed
              role {
                  id
                  uid
                  code
                  name
              }
              apiKey {
                  id
                  uid
                  alias
              }
          }
      }
    `;

    const variables = {
      companyUid,
      limit: 1000,
      skip: 0,
    };

    const { getAllPermissions } = await graphQLClient.request(query, variables);

    const newGetAllPermissions = getAllPermissions.map((item) => {
      
      // eslint-disable
      item.roleId = item.role ? item.role.id : null;
      item.roleUid = item.role ? item.role.uid : null;
      item.roleCode = item.role ? item.role.code : null;
      item.roleName = item.role ? item.role.name : null;

      delete item.role;
      
      item.apiKeyId = item.apiKey ? item.apiKey.id : null;
      item.apiKeyUid = item.apiKey ? item.apiKey.uid : null;
      item.apiKeyAlias = item.apiKey ? item.apiKey.alias : null;

      delete item.apiKey;

      return item;
    });

    return newGetAllPermissions;
  }

  async create(item = {}) {
    const dataForAuth = getDataForAuth();

    if (!dataForAuth) {
      throw new Error('can not get data for auth.');
    }

    const { companyAccessKey } = dataForAuth;

    const graphQLClient = await getClient({ 'access-key': companyAccessKey });

    const mutation = gql`
      mutation createPermission (
          $roleUid: String
          $apiKeyUid: String
          $name:String!   
      ) {
          createPermission (
              createPermissionInput: {
                  name: $name
                  roleUid: $roleUid
                  apiKeyUid: $apiKeyUid
              }
          ) {
              id
              name
              allowed
              createdAt
              updatedAt
          }
      }
    `;

    const variables = {
      name: item.name,
      roleUid: item.roleUid,
      apiKeyUid: item.apiKeyUid,
    };

    const { createPermission } = await graphQLClient.request(mutation, variables);

    return createPermission;
  }

  async update(item = {}) {
    const dataForAuth = getDataForAuth();

    if (!dataForAuth) {
      throw new Error('can not get data for auth.');
    }

    const { companyAccessKey } = dataForAuth;

    const graphQLClient = await getClient({ 'access-key': companyAccessKey });

    const mutation = gql`
      mutation updatePermission (
          $uid: String!
          $roleUid: String
          $apiKeyUid: String
          $name:String
      ) {
          updatePermission (
              getOnePermissionInput: {
                  uid: $uid
              }
              updatePermissionInput: {
                  name: $name
                  roleUid: $roleUid
                  apiKeyUid: $apiKeyUid
              }
          ) {
              id
              uid
              name
              createdAt
              updatedAt
          }
      }
    `;

    const variables = {
      uid: item.uid,
      name: item.name,
      roleUid: item.roleUid,
      apiKeyUid: item.apiKeyUid,
    };

    const { updatePermission } = await graphQLClient.request(mutation, variables);

    return updatePermission;
  }

  async remove(item = {}) {
    const dataForAuth = getDataForAuth();

    if (!dataForAuth) {
      throw new Error('can not get data for auth.');
    }

    const { companyAccessKey } = dataForAuth;

    const graphQLClient = await getClient({ 'access-key': companyAccessKey });

    const mutation = gql`
      mutation deletePermission (
          $uid: String!
      ) {
          deletePermission (
              getOnePermissionInput: {
                  uid: $uid
              }
          ) {
              id
              createdAt
              updatedAt
          }
      }
    `;

    const variables = {
      uid: item.uid,
    };

    const { deletePermission } = await graphQLClient.request(mutation, variables);

    return deletePermission;
  }
}

export const permissionService = new PermissionService();