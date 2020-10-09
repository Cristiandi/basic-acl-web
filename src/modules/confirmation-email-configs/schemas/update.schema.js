import * as yup from 'yup';

export const updateSchema = yup.object().shape({
  subject: yup.string().required().min(5),
  redirectUrl: yup.string().url().required().min(5)
});