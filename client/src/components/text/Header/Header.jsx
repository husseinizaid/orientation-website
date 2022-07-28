import React from 'react';
import PropTypes from 'prop-types';
import './Header.scss';
import waveBottom from '../../../assets/misc/wave-reverse.png';
import waveBottomDarkMode from '../../../assets/darkmode/misc/wave-reverse.png';

const Header = ({ text, children, underlineDesktop, underlineMobile }) => {
  return (
    <>
      <div className="header-page-container">
        <div className="header-page-subcontainer">
          <h2 className="header-page-title">{text}</h2>
          <div
            className="header-page-title-underline display-only-desktop"
            style={{ width: underlineDesktop }}
          ></div>
          <div
            className="header-page-title-underline display-only-tablet"
            style={{ width: underlineMobile }}
          ></div>
          {children}
        </div>
        <img className="header-page-wave-bottom" src={waveBottom} alt="wave"></img>
        <img className="header-page-wave-bottom-darkmode" src={waveBottomDarkMode} alt="wave"></img>
      </div>
    </>
  );
};

Header.propTypes = {
  text: PropTypes.string,
  children: PropTypes.node,
  underlineDesktop: PropTypes.string,
  underlineMobile: PropTypes.string,
};

export { Header };
