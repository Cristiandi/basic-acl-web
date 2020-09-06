import axios from 'axios';
import { getDataForAuth } from '../../common/utils';
import { API_URL } from '../../config';

class CompanyService {
  constructor() {
    this.companies = [
      {
        id: 1,
        name: 'Pepito perez LTDA',
        uuid: '01C',
        countryCode: 'MX',
      },
      {
        id: 2,
        name: 'Si señor S.A.S',
        uuid: '02C',
        countryCode: 'MX',
      },
      {
        id: 3,
        name: 'Hola soy yo S.A.S',
        uuid: '03C',
        countryCode: 'MX',
      },
    ];

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

    return data;
  }

  async updateCompany(company) {
    const dataForAuth = getDataForAuth();

    if (!dataForAuth) {
      throw new Error('can not get data for auth.');
    }

    const { accessToken, companyUuid } = dataForAuth;

    const { id, name, serviceAccount, firebaseConfig, countryCode } = company;

    const body = {
      name,
      serviceAccount,
      firebaseConfig,
      countryCode
    };

    console.log(body, 'body');

    const response = await axios({
      url: `${this.baseUrl}companies/${id}`,
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
      url: `${this.baseUrl}companies/${id}`,
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
