import { useState } from 'react';

interface AddFormData {
  type: 'movie' | 'series';
  imdbId: string;
  streamLink: string;
  title: string;
  description: string;
  poster: string;
}

export const useAddContentForm = () => {
  const [formData, setFormData] = useState<AddFormData>({
    type: 'movie',
    imdbId: '',
    streamLink: '',
    title: '',
    description: '',
    poster: ''
  });

  const handleFormChange = (field: string, value: string): void => {
    // Special handling for IMDb ID field to extract ID from URLs
    if (field === 'imdbId') {
      // Check if the pasted value is an IMDb URL and extract the ID
      const imdbUrlRegex = /https?:\/\/(?:www\.)?imdb\.com\/title\/(tt\d+)/i;
      const match = value.match(imdbUrlRegex);

      if (match) {
        // Extract the IMDb ID from the URL
        const extractedId = match[1];
        setFormData(prev => ({
          ...prev,
          [field]: extractedId
        }));
        return;
      }
    }

    // Normal field update
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = (): void => {
    setFormData({
      type: 'movie',
      imdbId: '',
      streamLink: '',
      title: '',
      description: '',
      poster: ''
    });
  };

  return {
    formData,
    setFormData,
    handleFormChange,
    resetForm
  };
};
