import * as yup from 'yup';

export const updateSchema = yup.object().shape({
  name: yup.string().required(),
  roleUid: yup.string(),
  apiKeyUid: yup.string(),
});