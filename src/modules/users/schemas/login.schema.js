import * as yup from 'yup';

export const loginSchema = yup.object().shape({
  companyUuid: yup.string().required(),
  email: yup.string().required().email(),
  password: yup.string().required().min(5)
});