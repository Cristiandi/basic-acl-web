import * as yup from 'yup';

export const createSchema = yup.object().shape({
  name: yup.string().required().min(5),
  isQuery: yup.boolean().default(false),
  isMutation: yup.boolean().default(false),
  projectId: yup.number().required().min(1)
});