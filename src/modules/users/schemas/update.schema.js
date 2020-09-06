import * as yup from 'yup';

export const updateSchema = yup.object().shape({
  email: yup.string().email(),
  phone: yup.string().min(10).max(10),
  password: yup.string().min(5),
  passwordConfirm: yup
  .string()
  .oneOf([yup.ref('password'), null], 'Passwords do not match')
});