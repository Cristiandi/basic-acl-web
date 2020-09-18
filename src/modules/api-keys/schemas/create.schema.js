import * as yup from 'yup';

export const createSchema = yup.object().shape({
  prefix: yup.string().required().min(3).max(5)
});