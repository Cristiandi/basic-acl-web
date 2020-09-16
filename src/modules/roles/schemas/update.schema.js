import * as yup from 'yup';

export const updateSchema = yup.object().shape({
  name: yup.string().required().min(1),
  code: yup.string().required().min(1)
});