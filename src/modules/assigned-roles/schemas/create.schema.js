import * as yup from 'yup';

export const createSchema = yup.object().shape({
  roleId: yup.number().required(),
  userId: yup.number(),
  apiKeyId: yup.number()
});