import * as yup from 'yup';

export const changeForgottenPassword = yup.object().shape({
  code: yup.string().required(),
  password: yup.string().required().min(5),
  confirmedPassword: yup
  .string()
  .required()
  .oneOf([yup.ref('password'), null], 'Passwords do not match.')
});