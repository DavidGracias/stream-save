import type { MongoDBCredentials } from '../types';

export const generateUrl = (mongoCred: MongoDBCredentials): string => (
  `mongodb+srv://${mongoCred.user}:${mongoCred.pass}@${mongoCred.cluster}.mongodb.net`
);

export const generateMongoUrl = (user: string, pass: string, cluster: string): string => {
  if (user && pass && cluster &&
    typeof user === 'string' && typeof pass === 'string' && typeof cluster === 'string' &&
    user.trim() !== '' && pass.trim() !== '' && cluster.trim() !== '') {
    return `mongodb+srv://${user.trim()}:${pass.trim()}@${cluster.trim()}.mongodb.net`;
  }
  return '';
};
