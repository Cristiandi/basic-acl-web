import * as yup from 'yup';

export const loginSchema = yup.object().shape({
  companyName: yup.string().required(),
  email: yup.string().required().email(),
  password: yup.string().required().min(5)
});