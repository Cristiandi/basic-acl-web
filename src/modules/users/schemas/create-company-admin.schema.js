import * as yup from 'yup';

export const createCompanyAdminSchema = yup.object().shape({
  companyUuid: yup.string().uuid().required(),
  email: yup.string().email().required(),
  phone: yup.string().required().min(10).max(10),
  password: yup.string().required().min(5),
  passwordConfirm: yup
  .string()
  .required()
  .oneOf([yup.ref('password'), null], 'Passwords do not match')
});