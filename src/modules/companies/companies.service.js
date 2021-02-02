import axios from 'axios';
import { getDataForAuth } from '../../common/utils';
import { API_URL } from '../../config';

class CompanyService {
  constructor() {
    this.baseUrl = API_URL;
  }

  async getCompany() {
    const dataForAuth = getDataForAuth();

    if (!dataForAuth) {
      throw new Error('can not get data for auth.');
    }

    const { accessToken, companyUuid } = dataForAuth;

    const response = await axios({
      url: `${this.baseUrl}companies/your-company/${companyUuid}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'company-uuid': companyUuid,
      },
    });

    const { data } = response;

    return [data];
  }

  async createCompany(company = {}) {
    const { name, serviceAccount, firebaseConfig, countryCode } = company;

    const body = {
      name,
      serviceAccount,
      firebaseConfig,
      countryCode
    };

    const response = await axios({
      url: `${this.baseUrl}companies`,
      method: 'post',
      data: {
        ...body,
      },
    });

    const { data } = response;

    return {
      ...data,
      message: `company created, the UUID is ${data.uuid} please save that value.`
    };
  }

  async updateCompany(company) {
    const dataForAuth = getDataForAuth();

    if (!dataForAuth) {
      throw new Error('can not get data for auth.');
    }

    const { accessToken, companyUuid } = dataForAuth;

    const {
      id,
      name,
      serviceAccount,
      firebaseConfig,
      countryCode,
      confirmationEmailConfig,
      forgottenPasswordConfig,
      logoUrl
    } = company;

    const body = {
      name,
      serviceAccount,
      firebaseConfig,
      countryCode,
      confirmationEmailConfig,
      forgottenPasswordConfig,
      logoUrl
    };

    console.log(body, 'body');

    const response = await axios({
      url: `${this.baseUrl}companies/${companyUuid}`,
      method: 'patch',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'company-uuid': companyUuid,
      },
      data: {
        ...body,
      },
    });

    const { data } = response;

    return data;
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
}

export const companiesService = new CompanyService();
