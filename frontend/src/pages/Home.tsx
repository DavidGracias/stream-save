import React from 'react';
import { HeaderSection, ActionButtons, FeatureCards } from '../components/Home';

const Home: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <HeaderSection />
      <ActionButtons />
      <FeatureCards />
    </div>
  );
};

export default Home;
