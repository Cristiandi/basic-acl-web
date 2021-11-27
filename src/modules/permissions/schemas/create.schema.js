import * as yup from 'yup';

export const createSchema = yup.object().shape({
  name: yup.string().required(),
  roleUid: yup.string(),
  apiKeyUid: yup.string(),
});