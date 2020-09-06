import * as yup from 'yup';

export const createSchema = yup.object().shape({
  email: yup.string().required().email(),
  phone: yup.string().required().min(10).max(10),
  password: yup.string().required().min(5),
  passwordConfirm: yup
  .string()
  .required()
  .oneOf([yup.ref('password'), null], 'Passwords do not match')
});