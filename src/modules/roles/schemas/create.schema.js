import * as yup from 'yup';

export const createSchema = yup.object().shape({
  name: yup.string().required().min(1),
  code: yup.string().required().min(1),
  description: yup.string().required().min(1),
});