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

    const { accessToken, companyUuid } = dataForAuth;

    const { email, password, phone } = item;

    const body = {
      companyUuid,
      email,
      phone,
      password
    };

    const response = await axios({
      url: `${this.baseUrl}users`,
      method: 'post',
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

  async findAll() {
    const dataForAuth = getDataForAuth();

    if (!dataForAuth) {
      throw new Error('can not get data for auth.');
    }

    const { accessToken, companyUuid } = dataForAuth;

    const response = await axios({
      url: `${this.baseUrl}users/${companyUuid}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'company-uuid': companyUuid,
      },
    });

    const { data } = response;

    return data;
  }

  async update(item = {}) {
    const dataForAuth = getDataForAuth();

    if (!dataForAuth) {
      throw new Error('can not get data for auth.');
    }

    const { accessToken, companyUuid } = dataForAuth;

    const { email, password, phone } = item;

    const body = {
      email,
      phone,
      password
    };

    const response = await axios({
      url: `${this.baseUrl}users/${companyUuid}/${item.id}`,
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

    const response = await axios({
      url: `${this.baseUrl}users/${companyUuid}/${item.id}`,
      method: 'delete',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'company-uuid': companyUuid,
      }
    });

    const { data } = response;

    return data;
  }

  async createCompanyAdmin(item = {}) {
    const { companyAccessKey, companyUid, email, password, phone } = item;

    const graphQLClient = await getClient({ 'access-key': companyAccessKey });   

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
    const respose = await axios({
      url: `${this.baseUrl}users/login-admin`,
      method: 'post',
      data: {
        ...item
      }
    });

    const { data } = respose;

    if (process.browser) {
      localStorage.setItem('user', JSON.stringify(data));
    }

    userFromStore.set(data);

    return data;
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