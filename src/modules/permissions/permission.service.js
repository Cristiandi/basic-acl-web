import axios from 'axios';

import { getDataForAuth } from '../../common/utils';
import { API_URL } from '../../config';

class PermissionService {
  constructor() {
    this.baseUrl = API_URL;
  }

  async findAll() {
    const dataForAuth = getDataForAuth();

    if (!dataForAuth) {
      throw new Error('can not get data for auth.');
    }

    const { accessToken, companyUuid } = dataForAuth;

    const response = await axios({
      url: `${this.baseUrl}permissions/${companyUuid}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'company-uuid': companyUuid,
      },
    });

    const { data } = response;

    return data;
  }

  async create(item = {}) {
    const dataForAuth = getDataForAuth();

    if (!dataForAuth) {
      throw new Error('can not get data for auth.');
    }

    const { accessToken, companyUuid } = dataForAuth;

    const { roleId, httpRouteId, graphqlActionId, allowed } = item;

    const body = {
      companyUuid,
      roleId,
      httpRouteId,
      allowed,
      graphqlActionId
    };

    const response = await axios({
      url: `${this.baseUrl}permissions`,
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