# 🎵 MoodDJ - AI-Powered Music Playlist Generator

A full-stack web application that uses AI to generate personalized music playlists based on mood prompts. Upload your music library, describe your vibe, and let the AI DJ create the perfect mix.

## 🎯 Features

- **🎧 Audio Upload**: Upload MP3/WAV files with automatic metadata extraction
- **🤖 AI Playlist Generation**: Groq LLM (Llama 3.3 70B) analyzes mood prompts and curates intelligent playlists
- **📊 Usage Analytics**: Track most-played songs with MongoDB aggregation
- **⚡ Redis Caching**: Lightning-fast top tracks endpoint with 60s TTL cache
- **🎨 Modern UI**: Clean, minimal design inspired by Apple Music and Spotify
- **▶️ In-Browser Playback**: HTML5 audio player with prev/next controls

---

## 🛠️ Tech Stack

### Backend
- **Node.js + Express** - REST API server
- **MongoDB + Mongoose** - Database and ODM
- **Groq AI API** - LLM-powered playlist generation
- **Redis** (optional) - Query result caching
- **Multer** - File upload handling
- **music-metadata** - Audio file metadata extraction

### Frontend
- **React 18 + Vite** - Modern UI framework
- **Axios** - HTTP client
- **HTML5 Audio API** - Native audio playback

### Deployment
- **Vercel** - Serverless hosting for both frontend and backend
- **MongoDB Atlas** - Cloud database
- **Upstash Redis** (optional) - Serverless Redis

---


## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Groq API key (free at [console.groq.com](https://console.groq.com))
- Redis (optional, for caching)

### 1. Clone Repository
git clone https://github.com/YOUR_USERNAME/mood-dj.git
cd mood-dj


### 2. Backend Setup

cd server
npm install


Create `.env` file in `server/`:
PORT=4000
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/moodDJ
GROQ_API_KEY=gsk_YOUR_GROQ_API_KEY_HERE
CLIENT_URL=http://localhost:5173
REDIS_URL=redis://default:PASSWORD@HOST:PORT # Optional


**Get your credentials:**
- MongoDB Atlas: [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Groq API: [console.groq.com](https://console.groq.com)
- Redis (optional): [upstash.com](https://upstash.com) or run locally

Start backend:
npm run dev

Server runs on `http://localhost:4000`

### 3. Frontend Setup

cd ../client
npm install


Create `.env` file in `client/`:
VITE_API_URL=http://localhost:4000


Start frontend:
npm run dev

App runs on `http://localhost:5173`

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/tracks/upload` | Upload audio file (form-data: `audio`) |
| `GET` | `/api/tracks` | List all tracks |
| `POST` | `/api/playlists/generate` | Generate playlist (body: `{ mood: "string" }`) |
| `GET` | `/api/playlists/:id` | Get playlist by ID |
| `GET` | `/api/stats/top-tracks` | Get top 10 most-used tracks (cached) |
| `GET` | `/api/health` | Health check |

---

## 🌐 Deployment (Vercel)

### Backend Deployment

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Set root directory to `server/`
4. Add environment variables in Vercel dashboard:
   - `MONGODB_URI`
   - `GROQ_API_KEY`
   - `CLIENT_URL` (your frontend Vercel URL)
   - `REDIS_URL` (optional)
5. Deploy

**Important:** Create `vercel.json` in `server/`:
{
"version": 2,
"builds": [
{
"src": "src/server.js",
"use": "@vercel/node"
}
],
"routes": [
{
"src": "/(.*)",
"dest": "src/server.js"
}
]
}


### Frontend Deployment

1. Import project in Vercel (separate deployment)
2. Set root directory to `client/`
3. Add environment variable:
   - `VITE_API_URL` (your backend Vercel URL)
4. Deploy

---

## 🎬 Demo Video

A 3-minute walkthrough video demonstrating:
1. Uploading music files
2. Generating a mood-based playlist
3. Playing tracks with auto-advance
4. Viewing top tracks stats with caching

**Video Link:** [Add your video link here]

---

## 🧪 Testing Locally

1. Upload 5-6 MP3/WAV files via the UI
2. Enter mood prompts like:
   - "chill coding session"
   - "late night drive"
   - "romantic dinner"
3. Watch AI generate different playlists for each mood
4. Play tracks using prev/next controls
5. Generate multiple playlists to see usage counts update in Top Charts
6. Hit "Refresh" on Top Charts twice quickly to see Redis cache in action (fromCache: true in network response)

---

## 🔑 Key Design Decisions

### Why Groq?
- **Speed**: Sub-1s response times vs OpenAI's 3-5s
- **Free Tier**: Generous limits for demos
- **Structured Output**: JSON mode ensures reliable parsing

### Why Local File Storage?
- Simpler for demo/MVP
- Vercel serves static files automatically
- Easy to swap for S3 in production

### Why Redis Caching?
- `/stats/top-tracks` can be expensive with many tracks
- 60s TTL balances freshness with performance
- Falls back gracefully if Redis unavailable

### Database Schema Design
- **Tracks**: Store metadata + `usageCount` (indexed for fast sorting)
- **Playlists**: Reference tracks via ObjectId, store mood + order/weight
- **Atomic Updates**: `$inc` operator ensures accurate usage stats

---

## 🐛 Troubleshooting

**"Invalid URL" Redis Error:**
- Comment out `REDIS_URL` in `.env` (caching is optional)
- Or use valid Upstash/local Redis URL

**"Model Decommissioned" Groq Error:**
- Update model to `llama-3.3-70b-versatile` in `playlistController.js`

**CORS Issues:**
- Ensure `CLIENT_URL` in backend `.env` matches frontend URL
- Check CORS middleware in `server.js`

**Upload Not Working:**
- Verify `public/audio/` folder exists
- Check file mimetype is `audio/mpeg` or `audio/wav`


## 👨‍💻 Author

Saad Momin
---

