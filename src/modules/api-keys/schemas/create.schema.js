import * as yup from 'yup';

export const createSchema = yup.object().shape({
  alias: yup.string().required().min(3),
});