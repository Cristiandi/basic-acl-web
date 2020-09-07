import { user as userFromStore } from '../../common/store';

import axios from 'axios';

import { getDataForAuth } from '../../common/utils';
import { API_URL } from '../../config';

class UserService {
  constructor() {
    this.baseUrl = API_URL;
  }

  async createUser(user = {}) {
    const dataForAuth = getDataForAuth();

    if (!dataForAuth) {
      throw new Error('can not get data for auth.');
    }

    const { accessToken, companyUuid } = dataForAuth;

    const { email, password, phone } = user;

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

  async getUsers() {
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

  async updateUser(user = {}) {
    const dataForAuth = getDataForAuth();

    if (!dataForAuth) {
      throw new Error('can not get data for auth.');
    }

    const { accessToken, companyUuid } = dataForAuth;

    const { email, password, phone } = user;

    const body = {
      companyUuid,
      email,
      phone,
      password
    };

    const response = await axios({
      url: `${this.baseUrl}users/${user.id}`,
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

  async removeUser(user = {}) {
    const dataForAuth = getDataForAuth();

    if (!dataForAuth) {
      throw new Error('can not get data for auth.');
    }

    const { accessToken, companyUuid } = dataForAuth;

    const response = await axios({
      url: `${this.baseUrl}users/${user.id}`,
      method: 'delete',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'company-uuid': companyUuid,
      }
    });

    const { data } = response;

    return data;
  }

  async createCompanyAdmin(user = {}) {
    const { companyUuid, email, password, phone } = user;

    const body = {
      companyUuid,
      email,
      password,
      phone
    };

    const response = await axios({
      url: `${this.baseUrl}users/company-admin`,
      method: 'post',
      data: {
        ...body,
      }
    });

    const { data } = response;

    return {
      ...data,
      message: 'your company admin user has been created, now you can login.'
    };
  }

  async login(user = {}) {
    const respose = await axios({
      url: `${this.baseUrl}users/login`,
      method: 'post',
      data: {
        ...user
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
}

export const userService = new UserService();