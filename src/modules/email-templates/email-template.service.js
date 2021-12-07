import { gql } from 'graphql-request';

import { getDataForAuth } from '../../common/utils';
import { API_URL } from '../../config';

import { getClient } from '../../graphql';

class EmailTemplateService {
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
      query getAllEmailTemplates (
        $companyUid: String!,
        $limit: Int,
        $skip: Int,
        $q: String,
      ) {
          getAllEmailTemplates (
            getAllEmailTemplatesInput: {
                companyUid: $companyUid,
                limit: $limit,
                skip: $skip,
                q: $q
            }
          ) {
              id
              uid
              type
              subject
              createdAt
              updatedAt
          }
      }
    `;

    const variables = {
      companyUid,
      limit: 100,
      skip: 0,
    };

    const data = await graphQLClient.request(query, variables);

    const { getAllEmailTemplates } = data;

    return getAllEmailTemplates;
  }

  async create(item = {}) {
    const dataForAuth = getDataForAuth();

    if (!dataForAuth) {
      throw new Error('can not get data for auth.');
    }

    const { companyUid, companyAccessKey } = dataForAuth;

    const graphQLClient = await getClient({ 'access-key': companyAccessKey });

    const mutation = gql`
      mutation createEmailTemplate (
          $companyUid: String!,
          $type: String!,
          $subject: String!
      ) {
          createEmailTemplate (
              createEmailTemplateInput: {
                  companyUid: $companyUid,
                  type: $type,
                  subject: $subject
              }
          ) {
              id
              uid
              type
              subject
              createdAt
              updatedAt
          }
      }
    `;

    const { type, subject } = item;

    const variables = {
      companyUid,
      type,
      subject,
    };

    const data = await graphQLClient.request(mutation, variables);

    const { createEmailTemplate } = data;

    const { uid } = createEmailTemplate;

    const { file } = item;
    
    if (uid && file) {

      const uploadFileMutation = gql`
        mutation uploadEmailTemplate (
          $uid: String!,
          $file: Upload!
        ) {
          uploadEmailTemplate (
            getOneEmailTemplateInput: {
              uid: $uid
            }
            file: $file
          ) {
            id
          }
        }
      `;

      const variables = {
        uid,
        file
      };

      await graphQLClient.request(uploadFileMutation, variables);
    }

    return createEmailTemplate;
  }

  async update(item = {}) {
    const dataForAuth = getDataForAuth();

    if (!dataForAuth) {
      throw new Error('can not get data for auth.');
    }

    const { companyAccessKey, companyUid } = dataForAuth;

    const graphQLClient = await getClient({ 'access-key': companyAccessKey });

    const mutation = gql`
      mutation updateEmailTemplate (
          $uid: String!,
          $companyUid: String!,
          $type: String,
          $subject: String
      ) {
          updateEmailTemplate (
              getOneEmailTemplateInput: {
                  uid: $uid,
              },
              updateCompanyInput: {
                  companyUid: $companyUid,
                  type: $type,
                  subject: $subject
              }
          ) {
              id,
              uid,
              type,
              subject,
              createdAt,
              updatedAt
          }
      }
    `;

    const variables = {
      uid: item.uid,
      companyUid: companyUid,
      type: item.type,
      subject: item.subject,
    };

    const data = await graphQLClient.request(mutation, variables);

    const { updateEmailTemplate } = data;

    const { uid } = updateEmailTemplate;

    const { file } = item;

    if (uid && file) {

      const uploadFileMutation = gql`
        mutation uploadEmailTemplate (
          $uid: String!,
          $file: Upload!
        ) {
          uploadEmailTemplate (
            getOneEmailTemplateInput: {
              uid: $uid
            }
            file: $file
          ) {
            id
          }
        }
      `;

      const variables = {
        uid,
        file
      };

      await graphQLClient.request(uploadFileMutation, variables);
    }

    return updateEmailTemplate;
  }

  async remove(item = {}) {
    const dataForAuth = getDataForAuth();

    if (!dataForAuth) {
      throw new Error('can not get data for auth.');
    }

    const { companyAccessKey } = dataForAuth;

    const graphQLClient = await getClient({ 'access-key': companyAccessKey });

    const mutation = gql`
      mutation deleteEmailTemplate (
          $uid: String!
      ) {
          deleteEmailTemplate (
              getOneEmailTemplateInput: {
                  uid: $uid
              }
          ) {
              id,
              uid,
              type,
              subject,
              createdAt,
              updatedAt
          }
      }
    `;

    const variables = {
      uid: item.uid,
    };

    const data = await graphQLClient.request(mutation, variables);

    const { deleteEmailTemplate } = data;

    return deleteEmailTemplate;
  }

  async preview(item = {}) {
    const dataForAuth = getDataForAuth();

    if (!dataForAuth) {
      throw new Error('can not get data for auth.');
    }

    const { companyAccessKey } = dataForAuth;

    const graphQLClient = await getClient({ 'access-key': companyAccessKey });
    
    const mutation = gql`
      mutation previewEmailTemplate (
        $uid: String!,
        $parameters: JSONObject
      ) {
          previewEmailTemplate (
              getOneEmailTemplateInput: {
                  uid: $uid,
              },
              previewEmailTemplateInput: {
                  parameters: $parameters
              }
          ) {
              html
          }
      }
    `;

    const variables = {
      uid: item.uid,
      parameters: item.parameters || {},
    };

    const { previewEmailTemplate } = await graphQLClient.request(mutation, variables);

    return previewEmailTemplate;
  }
}

export const emailTemplateService = new EmailTemplateService();