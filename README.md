# Stream Save - Stremio Addon

A Stremio addon for saving custom stream links and playing them across different devices.

## 🏗️ Project Structure

```
stream-save/
├── backend/                    # Python Flask backend
│   ├── app.py                 # Main Flask application
│   ├── functions/             # Python modules and database functions
│   ├── requirements.txt       # Python dependencies
│   ├── MANIFEST.json         # Stremio addon manifest
│   └── wsgi.py               # WSGI entry point for production
│
├── frontend/                  # React TypeScript frontend
│   ├── package.json          # Node.js dependencies
│   ├── src/                  # React source code
│   ├── public/               # Static assets
│   └── dist/                 # Built files
│
├── scripts/                   # Development and utility scripts
│   └── start_dev.py          # Start both backend and frontend
│
├── docs/                      # Documentation and legacy files
│   └── legacy-ui/            # Original HTML templates (for reference)
│
├── package.json               # Root package.json with development scripts
└── README.md                  # This file
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- MongoDB (local or Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd stream-save
   ```

2. **Install dependencies**
   ```bash
   # Install Python dependencies
   pip install -r backend/requirements.txt
   
   # Install Node.js dependencies
   cd frontend && npm install && cd ..
   ```

3. **Set up environment variables**
   ```bash
   # Create backend/mongodb.env with your MongoDB connection string
   echo "MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/database" > backend/mongodb.env
   
   # Create frontend/.env with your MongoDB credentials (optional)
   cd frontend
   cp env.example .env
   # Edit .env and fill in your MongoDB credentials
   cd ..
   ```

4. **Start the server and add to Stremio**
   ```bash
   npm run dev
   # Then add this URL to Stremio: http://localhost:5001/manifest.json
   ```

### Development

#### Option 1: Use the start script (Recommended)
```bash
python scripts/start_dev.py
```

#### Option 2: Use npm scripts
```bash
# Start both services
npm run dev

# Start only backend
npm run backend

# Start only frontend
npm run frontend
```

#### Option 3: Start services manually
```bash
# Terminal 1: Start backend
cd backend && python app.py

# Terminal 2: Start frontend
cd frontend && npm run dev
```

## 🌐 Access Points

**📋 Copy these URLs - you'll need them for setup!**

- **Frontend (Management UI)**: `http://localhost:5173`
- **Backend API**: `http://localhost:5001`
- **Stremio Addon**: `http://localhost:5001/manifest.json` ⭐ **Use this in Stremio!**

## 📱 Install to Stremio

**⚠️ IMPORTANT**: This is the most crucial step! You must add the addon to Stremio to use it.

### Step-by-Step Installation

1. **Start your Stream Save server**
   ```bash
   npm run dev
   # or
   python scripts/start_dev.py
   ```

2. **Open Stremio** on your device (desktop, mobile, or web) or go to [web.stremio.com/#/addons](https://web.stremio.com/#/addons)

3. **Navigate to Addons**
   - Click on **Addons** in the left sidebar
   - Click on **Community Addons**

4. **Add the Addon**
   - Click the **"+" button** (Add Addon)
   - In the URL field, enter: `http://localhost:5001/manifest.json`
   - Click **Install**

5. **Verify Installation**
   - The addon should appear in your Community Addons list
   - You should see "Stream Save" in the addon name
   - Status should show as "Installed"

### 🔑 Alternative: User-Specific Addon URL

If you want to create a personalized addon URL with your MongoDB credentials:

1. **Go to the Configure page** in your Stream Save app: `http://localhost:5173/configure`
2. **Set up your MongoDB credentials** (username, password, cluster)
3. **Use this personalized URL** in Stremio:
   ```
   http://localhost:5000/<username>/<password>/<cluster>/manifest.json
   ```

**Example**: If your credentials are `user=john`, `pass=secret123`, `cluster=cluster0.abc123`:
```
http://localhost:5000/john/secret123/cluster0.abc123/manifest.json
```

### 🚨 Troubleshooting

**Addon not installing?**
- Make sure your Stream Save server is running (`http://localhost:5001` should be accessible)
- Check that the backend is working: visit `http://localhost:5001/manifest.json` in your browser
- Verify the URL is copied exactly (including `http://` and `/manifest.json`)

**Addon installed but not working?**
- Check the Stremio addon status (should show "Installed")
- Try restarting Stremio
- Verify your MongoDB credentials are correct in the Stream Save app

**Getting errors?**
- Check the browser console at `http://localhost:5173` for any error messages
- Ensure your MongoDB connection is working
- Verify all required environment variables are set (if using them)

---

### 🎯 **Quick Installation Summary**

1. **Start server**: `npm run dev`
2. **Copy URL**: `http://localhost:5001/manifest.json`
3. **Go to** [web.stremio.com/#/addons](https://web.stremio.com/#/addons)
4. **Click "+ Add addon"** → Paste URL → Install
5. **Done!** Your Stream Save addon is now active in Stremio

## 🛠️ Development

### Backend (Flask)
- **Entry point**: `backend/app.py`
- **Database functions**: `backend/functions/`
- **Addon endpoints**: Manifest, catalog, and stream endpoints

### Frontend (React + TypeScript)
- **Entry point**: `frontend/src/main.tsx`
- **Pages**: Home, Configure, Manage
- **Components**: Reusable UI components
- **Build tool**: Vite

## 📦 Building for Production

```bash
# Build frontend
npm run build

# The built files will be in frontend/dist/
# You can serve these with any static file server
```

## 🔧 Configuration

The addon is configurable through the web interface at `/configure` or by setting environment variables:

### Backend Environment Variables
- `MONGO_URL`: MongoDB connection string
- `HOST`: Host URL for the addon (defaults to localhost:5001)

### Frontend Environment Variables (Optional)
- `VITE_MONGO_USERNAME`: MongoDB username
- `VITE_MONGO_PASSWORD`: MongoDB password  
- `VITE_MONGO_CLUSTER_URL`: MongoDB cluster URL

**Note**: If frontend environment variables are not set, the app will automatically redirect users to the `/configure` page to set up credentials manually.

## 📚 API Endpoints

- `GET /manifest.json` - Addon manifest
- `GET /<user>/<pass>/<cluster>/manifest.json` - User-specific manifest
- `GET /<user>/<pass>/<cluster>/catalog/<type>/<id>.json` - Content catalog
- `GET /<user>/<pass>/<cluster>/stream/<type>/<id>.json` - Stream sources
- `GET /api/content` - All saved content
- `POST /manage` - Add/remove content

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details
