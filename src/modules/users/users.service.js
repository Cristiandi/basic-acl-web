import {
  user as userFromStore
} from '../../common/store';

import axios from 'axios';
import { gql } from 'graphql-request';

import { getDataForAuth } from '../../common/utils';
import { API_URL } from '../../config';

import { getClient } from '../../graphql';

class UserService {
  constructor() {
    this.baseUrl = API_URL;
  }

  async create(item = {}) {
    const dataForAuth = getDataForAuth();

    if (!dataForAuth) {
      throw new Error('can not get data for auth.');
    }

    const { companyUid, companyAccessKey } = dataForAuth;

    const graphQLClient = await getClient({ 'access-key': companyAccessKey });

    const mutation = gql`
      mutation createUser (
          $companyUid: String!
          $authUid: String
          $email: String
          $phone: String
          $password: String
          $roleCode: String
          $sendEmail: Boolean
          $emailTemplateParams: JSONObject
      ) {
          createUser (
              createUserInput: {
                  companyUid: $companyUid
                  authUid: $authUid
                  email: $email
                  phone: $phone
                  password: $password
                  roleCode: $roleCode
                  sendEmail: $sendEmail
                  emailTemplateParams: $emailTemplateParams
              }
          ) {
              id
              authUid
              email
              phone
              createdAt
              updatedAt
          }
      }
    `;

    const { email, phone, password } = item;

    const variables = {
      companyUid,
      email,
      phone: `+57${phone}`,
      password,
    };

    const data = await graphQLClient.request(mutation, variables);

    const { createUser } = data;

    return createUser;
  }

  async findAll() {
    const dataForAuth = getDataForAuth();

    if (!dataForAuth) {
      throw new Error('can not get data for auth.');
    }

    const { companyUid, companyAccessKey } = dataForAuth;

    const graphQLClient = await getClient({ 'access-key': companyAccessKey });

    const query = gql`
      query getAllUsers (
          $companyUid: String!
          $limit: Int
          $skip: Int
          $q: String
      ) {
          getAllUsers (
              getAllUsersInput: {
                  companyUid: $companyUid
                  limit: $limit
                  skip: $skip
                  q: $q
              }
          ) {
              id
              authUid
              email
              phone
          }
      }
    `;

    const variables = {
      companyUid,
      limit: 100,
      skip: 0,
    };

    const data = await graphQLClient.request(query, variables);

    const { getAllUsers } = data;

    return getAllUsers;
  }

  async remove(item = {}) {
    const dataForAuth = getDataForAuth();

    if (!dataForAuth) {
      throw new Error('can not get data for auth.');
    }

    const { companyAccessKey } = dataForAuth;

    const graphQLClient = await getClient({ 'access-key': companyAccessKey });

    const mutation = gql`
      mutation deleteUser (
          $authUid: String!
      ) {
          deleteUser (
              getOneUserInput: {
                  authUid: $authUid
              }
          ) {
              id
              authUid
              email
              phone
          }
      }
    `;

    const variables = {
      authUid: item.authUid,
    };

    const data = await graphQLClient.request(mutation, variables);

    const { deleteUser } = data;

    return deleteUser;
  }

  async createCompanyAdmin(item = {}) {
    const { companyUid, email, password, phone } = item;

    const graphQLClient = await getClient({});

    const mutation = gql`
      mutation createSuperAdmin (
          $companyUid: String!
          $email: String!
          $password: String!
          $phone: String!
      ) {
          createSuperAdmin (
              createSuperAdmiUserInput: {
                  companyUid: $companyUid
                  email: $email
                  password: $password
                  phone: $phone
              }
          ) {
              id
              authUid
              email
              phone
              company {
                  id
              }
          }
      }
    `;

    const variables = {
      companyUid,
      email,
      password,
      phone: `+57${phone}`
    };

    const data = await graphQLClient.request(mutation, variables);

    // console.log('resetPassword', data);

    return {
      ...data.createSuperAdmin,
      message: 'your company super admin user has been created, now you can login.'
    };
  }

  async login(item = {}) {
    const graphQLClient = await getClient({});

    const mutation = gql`
    mutation loginSuperAdmin (
        $email: String!
        $password: String!
    ) {
        loginSuperAdmin (
            loginSuperAdminInput: {
                email: $email
                password: $password
            }
        ) {
            companyUid
            accessKey
            token
            authTime
            issuedAtTime
            expirationTime
        }
    }
    `;

    const { email, password } = item;

    const variables = {
      email,
      password,
    };

    const data = await graphQLClient.request(mutation, variables);

    // console.log('resetPassword', data);

    const { loginSuperAdmin } = data;

    if (process.browser) {
      localStorage.setItem('user', JSON.stringify(loginSuperAdmin));
    }

    userFromStore.set(loginSuperAdmin);

    return {
      ...loginSuperAdmin
    };
  }

  logout () {
    if (process.browser) {
      localStorage.removeItem('user');
    }
    userFromStore.set(null);
  }

  async createUsersFromFirebase() {
    const dataForAuth = getDataForAuth();

    if (!dataForAuth) {
      throw new Error('can not get data for auth.');
    }

    const { companyUuid } = dataForAuth;

    const body = {
      companyUuid
    };

    const response = await axios({
      url: `${this.baseUrl}users/create-users-from-firebase`,
      method: 'post',
      data: {
        ...body
      }
    });

    const { data } = response;

    return {
      ...data,
      message: 'soon as the process ends you will see your users.'
    };
  }

  async forgottenPassword(item = {}) {
    const { companyUuid, email } = item;

    const body = {
      companyUuid,
      email,
    };

    const response = await axios({
      url: `${this.baseUrl}users/forgotten-password`,
      method: 'post',
      data: {
        ...body
      }
    });

    const { data } = response;

    return {
      ...data,
      message: 'mail sent!'
    };
  }

  async changeForgottenPassword(item = {}) {
    const { companyUuid, code, password, confirmedPassword } = item;

    const body = {
      companyUuid,
      code,
      password,
      confirmedPassword
    };

    const response = await axios({
      url: `${this.baseUrl}users/forgotten-password-code`,
      method: 'post',
      data: {
        ...body
      }
    });

    const { data } = response;

    return {
      ...data,
      message: 'pasword updated!'
    };
  }

  async sendResetPasswordEmail(item = {}) {
    const graphQLClient = await getClient({});

    const { companyUuid, email } = item;   

    const mutation = gql`
      mutation sendResetPasswordEmail (
        $companyUid: String!
        $email: String!
      ) {
        sendResetUserPasswordEmail (
          sendResetUserPasswordEmailInput: {
            companyUid: $companyUid
            email: $email
          }
        ) {
          message
        }
      }
    `;

    const variables = {
      companyUid: companyUuid,
      email
    };

    const data = await graphQLClient.request(mutation, variables);

    return {
      ...data.sendResetUserPasswordEmail,
    };
  }

  async resetPassword(item = {}) {
    const graphQLClient = await getClient({});

    const { code, password } = item;   

    const mutation = gql`
      mutation resetPassword (
        $code: String!
        $password: String!
      ) {
        resetUserPassword (
          resetUserPasswordInput: {
            code: $code
            password: $password
          }
        ) {
          url
        }
      }
    `;

    const variables = {
      code,
      password
    };

    const data = await graphQLClient.request(mutation, variables);

    // console.log('resetPassword', data);

    return {
      ...data.resetUserPassword,
      message: 'pasword updated!'
    };
  }
}

export const userService = new UserService();