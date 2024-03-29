import * as yup from 'yup';

export const createSchema = yup.object().shape({
  name: yup.string().required().min(5),
  firebaseAdminConfig: yup.object().shape({
    type: yup.string().required(),
    project_id: yup.string().required(),
    private_key_id: yup.string().required(),
    private_key: yup.string().required(),
    client_email: yup.string().required(),
    client_id: yup.string().required(),
    auth_uri: yup.string().required(),
    token_uri: yup.string().required(),
    auth_provider_x509_cert_url: yup.string().required(),
    client_x509_cert_url: yup.string().required()
  }),
  firebaseConfig: yup.object().shape({
    apiKey: yup.string().required(),
    authDomain: yup.string().required(),
    databaseURL: yup.string().optional(),
    storageBucket: yup.string().required(),
    messagingSenderId: yup.string().required(),
    appId: yup.string().required(),
    measurementId: yup.string().optional()
  })
});