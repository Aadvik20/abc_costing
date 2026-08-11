import React from 'react';
import { Navigate } from 'react-router';

const Home = () => {
  return <Navigate to="/dashboard" replace={true} />;
};

export default Home;
