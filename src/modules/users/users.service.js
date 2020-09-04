import { user as userFromStore } from '../../common/store';

class UserService {
  async login(user = {}) {
    const { email, password } = user;

    if (email !== 'test@test.com' && password !== 'divelo') {
      throw new Error('email o contraseña invalidos');
    }

    const data = {
      id: 1,
      email,
      fullName: 'Hola Divelo',
      accessToken: 'kdhfjksdhflkhasdkjlfhasjklf'
    };

    if (process.browser) {
      console.log(process.browser, 'process.browser');
      localStorage.setItem('user', JSON.stringify(data));
    }

    userFromStore.set(data);

    return data;
  }

  logout () {
    if (process.browser) {
      localStorage.removeItem('user');
    }
    userFromStore.set(null);
  }
}

export const userService = new UserService();