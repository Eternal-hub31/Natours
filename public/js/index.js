/* eslint-disable */
import '@babel/polyfill';
import { logout } from './logout';
import { login } from './login';
import { displayMap } from './mapbox';
import { signUp } from './signup';
import { UpdatingSettings } from './updateSettings';
import { bookTour } from './Stripe';
// <---! Dom Elements !--->
const Updatingform = document.querySelector('.form-user-data');
const UpdatingPasswordForm = document.querySelector('.form-user-settings');
const loginform = document.querySelector('.form--login');
const logoutbtn = document.querySelector('.nav__el--logout');
const signupform = document.querySelector('.signup-form');
const btnBookings = document.getElementById('book-tour');
// <---! Dom Elements !--->
if (Updatingform) {
  Updatingform.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    console.log(form);
    UpdatingSettings(form, 'data');
  });
}
if (UpdatingPasswordForm) {
  UpdatingPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn-save-password').innerHTML = 'Updating...';
    const currentPassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await UpdatingSettings(
      { currentPassword, password, passwordConfirm },
      'password'
    );
  });
  document.querySelector('.btn-save-password').innerHTML = 'save password';
  document.getElementById('password-current').value = '';
  document.getElementById('password').value = '';
  document.getElementById('password-confirm').value = '';
}
if (loginform) {
  loginform.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    console.log(email, password);
    login(email, password);
  });
}
if (signupform) {
  signupform.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    signUp(name, email, password, confirmPassword);
  });
}

const mapbox = document.getElementById('map');
if (mapbox) {
  const locations = JSON.parse(
    document.getElementById('map').dataset.locations
  );
  displayMap(locations);
}

if (logoutbtn) logoutbtn.addEventListener('click', logout);

if (btnBookings) {
  btnBookings.addEventListener('click', (e) => {
    const { tourId } = e.target.dataset;
    e.target.textContent = 'processing...';
    console.log(tourId);
    bookTour(tourId);
  });
}
