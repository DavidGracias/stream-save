export const generateUrl = (mongoCred: { user: string | null; pass: string | null; cluster: string | null; }): string => (
  mongoCred.user && mongoCred.pass && mongoCred.cluster
    ? `mongodb+srv://${mongoCred.user}:${mongoCred.pass}@${mongoCred.cluster}.mongodb.net`
    : ''
);

export const generateMongoUrl = (user: string, pass: string, cluster: string): string => {
  if (user && pass && cluster && typeof user === 'string' && typeof pass === 'string' && typeof cluster === 'string' && user.trim() !== '' && pass.trim() !== '' && cluster.trim() !== '') {
    return `mongodb+srv://${user.trim()}:${pass.trim()}@${cluster.trim()}.mongodb.net`;
  }
  return '';
};
