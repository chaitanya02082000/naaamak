import React from 'react';
import "../user/User.scss";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope } from '@fortawesome/free-solid-svg-icons';

/**
 * Renders user details
 * @param {Object} user - The user object containing user information
 * @returns {JSX.Element} - The user details component
 */

const User = ({user}) => {
  return (
    <div className='user-profile-container'>
      <div className='user-profile-content'>
        <div className='user-profile-image'>
          <img 
            src={`https://naaamak.onrender.com/assets/${user.picture}`} 
            alt={user.picture} 
            className='profile-image'
          />
        </div>
        
        <div className='user-profile-info'>
          <h1 className='user-name'>{user.firstName} {user.lastName}</h1>
          <div className='user-details'>
            <div className='user-detail-item'>
              <FontAwesomeIcon icon={faEnvelope} className='detail-icon' />
              <span>{user.email}</span>
            </div>
            <div className='user-detail-item'>
              <FontAwesomeIcon icon={faUser} className='detail-icon' />
              <span>Member since {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default User;