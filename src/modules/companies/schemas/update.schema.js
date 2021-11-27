import * as yup from 'yup';

export const updateSchema = yup.object().shape({
  name: yup.string().required().min(5),
  website: yup.string().url().optional(),
});