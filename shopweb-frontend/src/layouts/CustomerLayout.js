import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CustomerLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-20"> 
        <Outlet /> 
      </main>
      <Footer />
    </div>
  );
};

export default CustomerLayout;