import axios from 'axios';

import { getDataForAuth } from '../../common/utils';
import { API_URL } from '../../config';

class ProjectService {
  constructor() {
    this.baseUrl = API_URL;
  }

  async getProjects() {
    const dataForAuth = getDataForAuth();

    if (!dataForAuth) {
      throw new Error('can not get data for auth.');
    }

    const { accessToken, companyUuid } = dataForAuth;

    const response = await axios({
      url: `${this.baseUrl}projects/${companyUuid}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'company-uuid': companyUuid,
      },
    });

    const { data } = response;

    return data;
  }

  async createProject(project = {}) {
    const dataForAuth = getDataForAuth();

    if (!dataForAuth) {
      throw new Error('can not get data for auth.');
    }

    const { accessToken, companyUuid } = dataForAuth;

    const { name, code } = project;

    const body = {
      companyUuid,
      name,
      code
    };

    const response = await axios({
      url: `${this.baseUrl}projects`,
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

  async updateProject(project = {}) {
    const dataForAuth = getDataForAuth();

    if (!dataForAuth) {
      throw new Error('can not get data for auth.');
    }

    const { accessToken, companyUuid } = dataForAuth;

    const { id, code, name } = project;

    const body = {
      companyUuid,
      name,
      code
    };

    const response = await axios({
      url: `${this.baseUrl}projects/${companyUuid}/${id}`,
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

  async removeProject(project = {}) {
    const dataForAuth = getDataForAuth();

    if (!dataForAuth) {
      throw new Error('can not get data for auth.');
    }

    const { accessToken, companyUuid } = dataForAuth;

    const { id } = project;

    const response = await axios({
      url: `${this.baseUrl}projects/${companyUuid}/${id}`,
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

export const projectService = new ProjectService();