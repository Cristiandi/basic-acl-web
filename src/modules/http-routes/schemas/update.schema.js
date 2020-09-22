import * as yup from 'yup';

export const updateSchema = yup.object().shape({
  name: yup.string().required().min(5),
  method: yup.string().required().min(3),
  path: yup.string().required().min(5),
  projectId: yup.number().required().min(1)
});