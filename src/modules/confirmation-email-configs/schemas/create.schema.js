import * as yup from 'yup';

export const createSchema = yup.object().shape({
  from: yup.string().email().required(),
  subject: yup.string().required().min(5),
  redirectUrl: yup.string().url().required().min(5)
});