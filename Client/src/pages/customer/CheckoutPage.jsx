import Checkout from '../../components/Checkout';
import ErrorBoundary from '../../components/ErrorBoundary';

const CheckoutPage = () => {
  return (
    <ErrorBoundary>
      <Checkout />
    </ErrorBoundary>
  );
};

export default CheckoutPage;