import * as yup from 'yup';

export const createSchema = yup.object().shape({
  name: yup.string().required().min(5),
  uuid: yup.string().required()
});