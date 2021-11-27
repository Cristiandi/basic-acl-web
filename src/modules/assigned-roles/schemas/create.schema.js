import * as yup from 'yup';

export const createSchema = yup.object().shape({
  roleUid: yup.string().required(),
  userUid: yup.string().required(),
});