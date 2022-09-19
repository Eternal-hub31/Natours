import axios from 'axios';
import { showMessage } from './alerts';

/* eslint-disable */
const stripe = Stripe(
  'pk_test_51Lf9koFSqo2Pj5Nez43nikPWmeXLStJlhYFdm3O7usa7zOolQqQge4ucer2PCFyMH7Kp0JpsrU8hM4cUlP14D1Am00x2I2VZe5'
);

// Call your backend to create the Checkout Session

export const bookTour = async (tourId) => {
  try {
    //1) get session from the server
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
    );
    console.log(session);
    console.log(session.data.session.id);
    if (!session) return;
    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
    console.log('not moving forward');
  } catch (error) {
    showMessage('error', 'something went wrong');
  }
};
