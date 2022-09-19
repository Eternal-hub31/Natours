/* eslint-disable */
import axios from 'axios';
import { showMessage } from './alerts';
export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:3000/api/v1/users/logout',
    });
    if ((res.data.status = 'success')) {
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
      showMessage('success', 'logged out successfully');
    }
  } catch (error) {
    showMessage('error', 'Error logging out try again');
  }
};
