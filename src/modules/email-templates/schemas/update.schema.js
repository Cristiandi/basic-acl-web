import * as yup from 'yup';

export const updateSchema = yup.object().shape({
  type: yup.string().test('validType', 'Invalid type', value => {
    const validTypes = ['WELCOME_EMAIL', 'CONFIRMATION_EMAIL', 'RESET_PASSWORD_EMAIL', 'PASSWORD_UPDATED_EMAIL', 'SUPER_ADMIN_CONFIRMATION_EMAIL'];

    return validTypes.includes(value);
  }),
  subject: yup.string().required().min(1),
  file: yup.mixed()
    .test('fileExt', 'The file ext is not allowed', (value) => {
      if (!value) return true;

      if (!value[0]) return true;

      const file = value[0];

      const { type = '' } = file;

      if (type.startsWith('image')) return true;

      // return false;

      return true;
    })
    .notRequired()
});