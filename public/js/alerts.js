export const RemoveMessage = () => {
  const el = document.querySelector('.alert');
  if (el) {
    el.parentElement.removeChild(el);
  }
};
export const showMessage = (type, message) => {
  RemoveMessage();
  const markup = `<div class="alert alert--${type} fade-in">${message}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(RemoveMessage, 5000);
};
