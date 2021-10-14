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
      if (item.role) {
        item.roleId = item.role.id;
        item.roleUid = item.role.uid;
        item.roleCode = item.role.code;
        item.roleName = item.role.name;
      }

      delete item.role;

      if (item.apiKey) {
        item.apiKeyId = item.apiKey.id;
        item.apiKeyUid = item.apiKey.uid;
        item.apiKeyAlias = item.apiKey.alias;
      }

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

    const { companyUid, companyAccessKey } = dataForAuth;

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

    const { accessToken, companyUuid } = dataForAuth;

    const { id, roleId, httpRouteId, graphqlActionId, allowed } = item;

    const body = {
      roleId,
      httpRouteId,
      allowed,
      graphqlActionId
    };

    const response = await axios({
      url: `${this.baseUrl}permissions/${companyUuid}/${id}`,
      method: 'patch',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'company-uuid': companyUuid,
      },
      data: {
        ...body
      }
    });

    const { data } = response;

    return data;
  }

  async remove(item = {}) {
    const dataForAuth = getDataForAuth();

    if (!dataForAuth) {
      throw new Error('can not get data for auth.');
    }

    const { accessToken, companyUuid } = dataForAuth;

    const { id } = item;

    const response = await axios({
      url: `${this.baseUrl}permissions/${companyUuid}/${id}`,
      method: 'delete',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'company-uuid': companyUuid,
      }
    });

    const { data } = response;

    return data;
  }
}

export const permissionService = new PermissionService();