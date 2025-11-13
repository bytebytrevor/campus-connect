# CampusConnect Setup Guide

## ✅ Project Structure Complete
Your project is now properly set up with:
- React frontend with routing and Tailwind CSS
- Express backend with API routes
- Firebase configuration templates
- Development scripts

## 🚀 Quick Start

### 1. Firebase Setup (Required)
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project called "campus-connect"
3. Enable Authentication and Firestore Database
4. Get your config from Project Settings > General > Your apps

### 2. Environment Variables
Copy the example files and add your Firebase credentials:

**Client (.env in client folder):**
```
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

**Server (.env in server folder):**
```
PORT=5000
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="your-private-key"
FIREBASE_CLIENT_EMAIL=your-service-account-email
```

### 3. Start Development
```bash
# Option 1: Use the batch file (Windows)
start-dev.bat

# Option 2: Use npm command
npm run dev

# Option 3: Start separately
npm run server  # Terminal 1
npm run client  # Terminal 2
```

## 📁 Project Structure
```
campus-connect/
├── client/           # React frontend (Port 3000)
│   ├── src/
│   │   ├── components/  # Navbar, etc.
│   │   ├── pages/       # Home, Events, StudyGroups, Profile
│   │   └── services/    # Firebase config
├── server/           # Express backend (Port 5000)
│   ├── routes/       # API endpoints
│   └── config/       # Firebase admin
└── docs/            # Documentation
```

## 🎯 Next Steps (Sprint 1)
1. ✅ Project setup complete
2. 🔄 Set up Firebase project
3. 🔄 Implement user authentication
4. 🔄 Create database schema
5. 🔄 Design UI wireframes

## 🔧 Available Scripts
- `npm run dev` - Start both client and server
- `npm run client` - Start React app only
- `npm run server` - Start Express server only
- `npm run install-all` - Install all dependencies

Your CampusConnect project is ready for development! 🎉