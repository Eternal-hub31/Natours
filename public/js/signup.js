/* eslint-disable */
import axios from 'axios';
import { showMessage } from './alerts';
export const signUp = async (name, email, password, passwordConfirm) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/signUp',
      data: {
        name,
        email,
        password,
        passwordConfirm,
      },
    });
    console.log(res.data);
    if ((res.data.status = 'success')) {
      window.setTimeout(() => {
        location.assign('/');
      }, 500);
      showMessage('success', 'Signed up successfully');
    }
  } catch (error) {
    console.log(error);
    showMessage('Failed please Try again with the correct info');
  }
};
