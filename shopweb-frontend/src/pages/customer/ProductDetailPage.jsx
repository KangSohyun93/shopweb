import ProductDetail from '../../components/ProductDetail';
import ErrorBoundary from '../../components/ErrorBoundary';

const ProductDetailPage = () => {
  return (
    <ErrorBoundary>
      <ProductDetail />
    </ErrorBoundary>
  );
};

export default ProductDetailPage;