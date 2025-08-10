import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box
} from '@mui/material';
import {
  Movie as MovieIcon,
  Tv as TvIcon,
  Storage as StorageIcon,
  TrendingUp as TrendingIcon
} from '@mui/icons-material';


interface StatsCardsProps {
  stats: {
    total: number;
    movies: number;
    series: number;
    showing: number;
  };
}

const StatsCards: React.FC<StatsCardsProps> = React.memo(({ stats }) => {
  // Calculate percentages
  const moviePercentage = stats.total > 0 ? (stats.movies / stats.total * 100).toFixed(1) : 0;
  const seriesPercentage = stats.total > 0 ? (stats.series / stats.total * 100).toFixed(1) : 0;



  const cards = [
    {
      title: 'Total Content',
      value: stats.total,
      icon: <StorageIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: 'primary.main',
      subtitle: 'All saved items'
    },
    {
      title: 'Movies',
      value: stats.movies,
      icon: <MovieIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
      color: 'secondary.main',
      subtitle: `${moviePercentage}% of total`
    },
    {
      title: 'Series',
      value: stats.series,
      icon: <TvIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      color: 'success.main',
      subtitle: `${seriesPercentage}% of total`
    },
    {
      title: 'Currently Showing',
      value: stats.showing,
      icon: <TrendingIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      color: 'warning.main',
      subtitle: 'Filtered results'
    }
  ];

  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
      gap: 3,
      mb: 3
    }}>
      {cards.map((card, index) => (
        <Card
          key={index}
          elevation={2}
          sx={{
            height: '100%',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 4
            }
          }}
        >
          <CardContent sx={{ textAlign: 'center', p: 3 }}>
            <Box sx={{ mb: 2 }}>
              {card.icon}
            </Box>

            <Typography variant="h4" component="div" sx={{
              fontWeight: 'bold',
              color: card.color,
              mb: 1
            }}>
              {card.value}
            </Typography>

            <Typography variant="h6" component="div" sx={{
              fontWeight: 500,
              mb: 1
            }}>
              {card.title}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {card.subtitle}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
});

StatsCards.displayName = 'StatsCards';

export default StatsCards;
