import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ChatWidget from '../components/ChatWidget';

const CustomerLayout = () => {
  const token = localStorage.getItem('token');

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-20"> 
        <Outlet /> 
      </main>
      <Footer />
      {token && <ChatWidget />}
    </div>
  );
};

export default CustomerLayout;