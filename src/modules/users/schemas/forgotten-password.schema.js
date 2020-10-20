import * as yup from 'yup';

export const forgottenPassword = yup.object().shape({
  companyUuid: yup.string().required(),
  email: yup.string().required().email()
});