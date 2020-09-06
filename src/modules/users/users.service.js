import axios from 'axios';
import { user as userFromStore } from '../../common/store';
import { API_URL } from '../../config';

class UserService {
  async login(user = {}) {
    const respose = await axios({
      url: `${API_URL}users/login`,
      method: 'post',
      data: {
        ...user
      }
    });

    const { data } = respose;

    if (process.browser) {
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