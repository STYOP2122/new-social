// src/components/Footer.tsx
import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
    return (
        <footer className='footer-container'>
            <ul>
                <li className='links'><p className='footer-name'><span>Soft</span>Construct Corporation &copy; {new Date().getFullYear()}</p></li>
                <li className="links">About</li>
                <li className="links">Help</li>
                <li className="links">Press</li>
                <li className="links">Terms</li>
            </ul>
        </footer>
    );
};

export default Footer;
