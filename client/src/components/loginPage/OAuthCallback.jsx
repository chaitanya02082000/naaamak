import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setLogin } from '../../state';
import axios from 'axios';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import './OAuthCallback.scss';

const BACKEND_URL = 'https://naaamak.onrender.com';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        setLoading(true);
        
        // Check for error in query params
        const queryParams = new URLSearchParams(location.search);
        const errorParam = queryParams.get('error');
        
        if (errorParam) {
          console.error('Error from OAuth provider:', errorParam);
          setError('Authentication failed. Please try again.');
          setTimeout(() => navigate('/'), 3000); // Redirect to login after 3 seconds
          return;
        }
        
        // Get token and userId from URL query parameters
        const token = queryParams.get('token');
        const userId = queryParams.get('userId');

        if (!token || !userId) {
          console.error('Missing token or userId in callback URL');
          setError('Authentication data is missing. Please try again.');
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        console.log('Processing OAuth callback with token and user ID');
        
        // Get user data using the userId
        const response = await axios.get(`${BACKEND_URL}/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data) {
          console.log('Successfully retrieved user data');
          
          // Store user data and token in Redux
          dispatch(
            setLogin({
              user: response.data,
              token: token
            })
          );
          
          // Show success message
          toast.success('Successfully logged in!', {
            position: "top-center",
            autoClose: 2000,
          });
          
          // Redirect to home page after a short delay
          setTimeout(() => navigate('/home'), 1000);
        } else {
          throw new Error('Failed to get user data');
        }
      } catch (error) {
        console.error('OAuth callback processing error:', error);
        setError('Failed to complete authentication. Please try again.');
        setTimeout(() => navigate('/'), 3000);
      } finally {
        setLoading(false);
      }
    };

    processOAuthCallback();
  }, [dispatch, location.search, navigate]);

  return (
    <div className="oauth-callback-container">
      {loading ? (
        <div className="oauth-loading">
          <h2>Logging you in...</h2>
          <div className="loading-spinner"></div>
        </div>
      ) : error ? (
        <div className="oauth-error">
          <h2>Authentication Error</h2>
          <p>{error}</p>
          <p>Redirecting you back to login...</p>
        </div>
      ) : (
        <div className="oauth-success">
          <h2>Login Successful!</h2>
          <p>Redirecting you to the application...</p>
        </div>
      )}
      <ToastContainer 
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default OAuthCallback; 