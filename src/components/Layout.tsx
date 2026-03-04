// src/components/Layout.tsx
import React from 'react';
import Header from './Header/Header';
import Footer from './Footer/Footer';
import CurrencyButton from './Currency/CurrencyButton'
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
  hideFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, hideFooter }) => {
  const { currentUser } = useAuth();

  return (
    <div className="layout-container">
      <Header />
      <main className="content">{children}</main>
      {currentUser && <CurrencyButton />}
      {!hideFooter && <Footer />}
    </div>
  );
};

export default Layout;