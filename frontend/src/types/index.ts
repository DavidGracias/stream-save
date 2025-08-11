export type MongoDBCredentials = {
  user: string | null;
  pass: string | null;
  cluster: string | null;
}

export interface ContentItem {
  id: string;
  name: string;
  type: 'movie' | 'series';
  poster?: string;
  description?: string;
  imdbRating?: string | null;
  releaseInfo?: string | null;
  genres?: string[];
  background?: string;
  owner?: string;
}

export interface Stats {
  total: number;
  movies: number;
  series: number;
  showing: number;
}

export interface FormData {
  user: string;
  pass: string;
  cluster: string;
  db_url: string;
}
