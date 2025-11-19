import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Banner.css';
import modelImage from './tintd-banner.png';

const Banner = () => {
  const navigate = useNavigate();

  return (
    <section className="tintd-banner">

      <div className="left-content">

        <div className="sub-title">TintD Partner Program</div>

        <h1 className="main-title">
          Build Your <span>Beauty Career</span><br />
          Earn <span>More.</span><br />
          Work Your <span>Way</span>
        </h1>

        <p className="locations-title">Locations We're Hiring In</p>

        <div className="locations">
          <span>Mogappair</span>
          <span>Anna Nagar</span>
          <span>Padi</span>
        </div>

        {/* ⭐ REGISTER BUTTON WITH NAVIGATION */}
        <button
          className="register-btn"
          onClick={() => navigate('/partner/register')}
        >
          Register Now
        </button>

      </div>

      <div className="right-image-wrapper">
        <img src={modelImage} alt="TintD Model" className="model-image" />
      </div>

    </section>
  );
};

export default Banner;
