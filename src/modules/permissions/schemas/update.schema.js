import * as yup from 'yup';

export const updateSchema = yup.object().shape({
  allowed: yup.boolean().required(),
  roleId: yup.number().required().min(1),
  httpRouteId: yup.number().optional().min(1),
  graphqlActionId: yup.number().optional().min(1)
});