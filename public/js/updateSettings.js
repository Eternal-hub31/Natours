/* eslint-disable */
import axios from 'axios';
import { showMessage } from './alerts';
//data , type data,password
export const UpdatingSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? 'http://127.0.0.1:3000/api/v1/users/update-password'
        : 'http://127.0.0.1:3000/api/v1/users/update-me';
    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });
    if ((res.data.status = 'success')) {
      showMessage('success', `${type.toUpperCase()} updated Successfully`);
      window.setTimeout(() => {
        location.assign('/me');
      }, 1800);
    }
  } catch (error) {
    showMessage('error', error.response.data.message);
  }
};
