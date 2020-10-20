import {
  user as userFromStore
} from '../../common/store';

import axios from 'axios';

import { getDataForAuth } from '../../common/utils';
import { API_URL } from '../../config';

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
    const { companyUuid, email, password, phone } = item;

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
}

export const userService = new UserService();