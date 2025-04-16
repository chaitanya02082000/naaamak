import React from 'react';
import "../loginPage/LoginPage.scss";
import logo from "../../../assets/logo.png";
import LoginForm from '../loginForm/LoginForm';
import { Link } from 'react-router-dom';

/**
 * The LoginPage component displays the login page UI.
 * 
 * @returns The login page UI.
 */
const LoginPage = () => {
  return (
    <div className='login-page'>
      <div className='login-header'>
        <Link to="/" className='logo-link'>
          <img src={logo} alt="NamakShamak Logo" className='logo' />
          <span>NamakShamak</span>
        </Link>
      </div>

      <div className='login-content'>
        <div className='login-left'>
          <div className='login-text'>
            <h1>Welcome to NamakShamak</h1>
            <p>Discover, save, and share your favorite recipes with a community of food lovers.</p>
          </div>
          <div className='login-features'>
            <div className='feature'>
              <div className='feature-icon'>🍳</div>
              <div className='feature-text'>
                <h3>Discover Recipes</h3>
                <p>Find recipes from around the world</p>
              </div>
            </div>
            <div className='feature'>
              <div className='feature-icon'>📝</div>
              <div className='feature-text'>
                <h3>Save Favorites</h3>
                <p>Create your personal recipe collection</p>
              </div>
            </div>
            <div className='feature'>
              <div className='feature-icon'>👥</div>
              <div className='feature-text'>
                <h3>Join Community</h3>
                <p>Connect with other food enthusiasts</p>
              </div>
            </div>
          </div>
        </div>

        <div className='login-right'>
          <div className='login-form-container'>
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;