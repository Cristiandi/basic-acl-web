import * as yup from 'yup';

export const updateSchema = yup.object().shape({
  enable: yup.boolean().default(true)
});