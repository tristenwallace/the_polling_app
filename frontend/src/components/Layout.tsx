import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import Canvas from './Wave/Canvas';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div>
      <Navbar />
      <main>{children}</main>
      <Canvas />
      <Footer />
    </div>
  );
};

export default Layout;
