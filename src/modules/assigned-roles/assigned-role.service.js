import { gql } from 'graphql-request';

import { getDataForAuth } from '../../common/utils';
import { API_URL } from '../../config';

import { getClient } from '../../graphql';

class AssignedRoleService {
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
      query getAllAssignedRoles (
          $companyUid: String!
          $limit: Int
          $skip: Int
          $q: String
      ) {
          getAllAssignedRoles (
              getAllAssignedRolesInput: {
                  companyUid: $companyUid
                  limit: $limit
                  skip: $skip
                  q: $q
              }
          ) {
              id
              role {
                  id
                  uid
                  code
                  name
              }
              user {
                  id
                  authUid
                  email
                  phone
              }
          }
      }
    `;

    const variables = {
      companyUid,
      limit: 100,
      skip: 0,
    };

    const { getAllAssignedRoles } = await graphQLClient.request(query, variables);

    const newGetAllAssignedRoles = getAllAssignedRoles.map((item) => {
      item.roleId = item.role.id;
      item.roleUid = item.role.uid;
      item.roleCode = item.role.code;
      item.roleName = item.role.name;

      item.userId = item.user.id;
      item.userAuthUid = item.user.authUid;
      item.userEmail = item.user.email;
      item.userPhone = item.user.phone;

      delete item.role;
      delete item.user;

      return item;
    });

    return newGetAllAssignedRoles;
  }

  async create(item = {}) {
    const dataForAuth = getDataForAuth();

    if (!dataForAuth) {
      throw new Error('can not get data for auth.');
    }

    const { companyAccessKey } = dataForAuth;

    const graphQLClient = await getClient({ 'access-key': companyAccessKey });

    const mutation = gql`
      mutation createAssignedRole (
          $roleUid: String!
          $userUid: String!
      ) {
          createAssignedRole (
              createAssignedRoleInput: {
                  roleUid: $roleUid
                  userUid: $userUid
              }
          ) {
              id
          }
      }
    `;

    const variables = {
      roleUid: item.roleUid,
      userUid: item.userUid,
    };

    const { createAssignedRole } = await graphQLClient.request(mutation, variables);

    return createAssignedRole;
  }

  async remove(item = {}) {
    console.log('item', item);
    const dataForAuth = getDataForAuth();

    if (!dataForAuth) {
      throw new Error('can not get data for auth.');
    }

    const { companyAccessKey } = dataForAuth;

    const graphQLClient = await getClient({ 'access-key': companyAccessKey });

    const mutation = gql`
      mutation deleteAssignedRole (
          $roleUid: String!
          $userUid: String!
      ) {
          deleteAssignedRole (
              deleteAssignedRoleInput: {
                  roleUid: $roleUid
                  userUid: $userUid
              }
          ) {
              id
          }
      }
    `;

    const variables = {
      roleUid: item.roleUid,
      userUid: item.userAuthUid,
    };

    const { deleteAssignedRole } = await graphQLClient.request(mutation, variables);

    return deleteAssignedRole;
  }
}

export const assignedRoleService = new AssignedRoleService();