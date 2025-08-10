import React from 'react';
import { Container } from '@mui/material';
import { HeaderSection, ActionButtons, FeatureCards } from '../components/Home';
import type { MongoDBCredentials } from '../types';

interface HomeProps {
  mongoDBCred: MongoDBCredentials;
  setMongoDBCred: React.Dispatch<React.SetStateAction<MongoDBCredentials>>;
}

const Home: React.FC<HomeProps> = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <HeaderSection />
      <ActionButtons />
      <FeatureCards />
    </Container>
  );
};

export default Home;
