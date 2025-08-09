# Stream Save React UI

This is the React frontend for the Stream Save Stremio addon. It provides a modern, responsive interface for managing your saved stream links.

## Features

- **Home Page**: Landing page with quick access to main functions
- **Configure Page**: MongoDB setup wizard for first-time configuration
- **View Page**: Browse, search, and filter all saved content
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Built with Bootstrap 5 and custom styling

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Navigate to the react_ui directory:
   ```bash
   cd react_ui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Building for Production

To create a production build:

```bash
npm run build
```

This creates a `build` folder with optimized files ready for deployment.

## Project Structure

```
src/
├── components/
│   └── Navigation.js          # Main navigation component
├── pages/
│   ├── Home.js               # Landing page
│   ├── Configure.js          # MongoDB setup wizard
│   └── View.js               # Content browsing page
├── App.js                    # Main app component with routing
├── App.css                   # Custom styles
└── index.js                  # App entry point
```

## API Integration

The React app communicates with the Flask backend at `http://127.0.0.1:5000`. Make sure your Flask server is running for full functionality.

## Key Features

### Home Page
- Clean, modern landing page
- Quick access to main functions
- Clear descriptions of each page's purpose

### Configure Page
- 3-step wizard for MongoDB setup
- Auto-fills connection string from credentials
- Stores credentials in localStorage
- Help modal with setup instructions

### View Page
- Real-time content loading from Flask API
- Search and filter functionality
- Statistics cards showing content counts
- Remove content directly from the interface
- Responsive table with movie/series posters

## Technologies Used

- **React 18**: Modern React with hooks
- **React Router**: Client-side routing
- **Bootstrap 5**: UI framework
- **Bootstrap Icons**: Icon library
- **Axios**: HTTP client (for future API calls)

## Development

The app uses:
- **React Router** for navigation
- **Bootstrap 5** for styling
- **localStorage** for credential persistence
- **Fetch API** for backend communication

## Notes

- The Manage page is planned for future development
- All API calls are configured for localhost:5000 (Flask backend)
- Credentials are stored in localStorage for persistence
- The app is designed to work alongside the existing Flask backend
