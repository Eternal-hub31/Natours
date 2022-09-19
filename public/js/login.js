/* eslint-disable */
import axios from 'axios';
import { showMessage } from './alerts';
export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });
    if ((res.data.status = 'success')) {
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
      showMessage('success', 'logged in successfully welcome back');
    }
  } catch (error) {
    showMessage('error', 'wrong credentials. please login again');
  }
};
