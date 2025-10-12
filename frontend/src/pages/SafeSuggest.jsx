import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CodeSection from '../components/CodeSection';

const SafeSuggest = () => {
  const navigate = useNavigate();
  const { status } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    if (!status && !token) {
      navigate('/login', { 
        state: { 
          message: 'Please login to access the Smart Code Assistant',
          redirectTo: '/safe-suggest'
        }
      });
    }
  }, [status, navigate]);

  // Show loading or redirect if not authenticated
  if (!status) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-16">
        <CodeSection />
      </div>
      <Footer />
    </div>
  );
};

export default SafeSuggest;
