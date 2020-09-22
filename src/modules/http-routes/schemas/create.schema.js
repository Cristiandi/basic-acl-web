import * as yup from 'yup';

export const createSchema = yup.object().shape({
  name: yup.string().required().min(5),
  method: yup.string().required().min(3),
  path: yup.string().required().min(5),
  projectId: yup.number().required().min(1)
});