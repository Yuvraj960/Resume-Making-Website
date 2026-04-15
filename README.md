# Obsidian Resume Builder

A modern, AI-powered resume builder that generates professional LaTeX resumes using Google's Gemini AI. Built with React (frontend) and Node.js/Express (backend), featuring secure authentication, real-time form editing, and seamless LaTeX export.

## Features

### 🔐 Authentication
- User registration and login with JWT-based authentication
- Secure password hashing with bcrypt
- Protected routes and automatic token refresh
- Persistent login state with localStorage

### 📝 Resume Management
- **Personal Information**: Name, email, phone, job title, professional summary
- **Education**: Add multiple educational entries (college, degree, year, GPA)
- **Experience**: Add work experience with company, role, dates, and descriptions
- **Skills**: Comma-separated skills list
- One resume per user with full CRUD operations
- Real-time form validation and saving

### 🤖 AI-Powered LaTeX Generation
- Integration with Google Gemini 2.5 Flash model
- Automatic conversion of resume data to professional LaTeX format
- ATS-friendly resume templates
- Download generated `.tex` files for compilation
- Clean, minimal LaTeX output with proper formatting

### 🎨 Modern UI/UX
- Dark theme with Material Design 3 inspired components
- Responsive design (mobile and desktop)
- Smooth animations and transitions
- Toast notifications for user feedback
- Section-based navigation with sidebar

### 🛠️ Technical Features
- RESTful API with Express.js
- MongoDB database with Mongoose ODM
- CORS enabled for cross-origin requests
- Comprehensive error handling
- Environment-based configuration

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Google Generative AI** (Gemini)
- **CORS** for cross-origin requests

### Frontend
- **React 19** with Vite
- **React Router** for navigation
- **Axios** for API calls
- **Tailwind CSS** for styling
- **Material Symbols** for icons

## Setup Guide

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance like MongoDB Atlas)
- Google AI Studio account (for Gemini API key)

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd resume-making

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

### 2. Backend Configuration

Create a `.env` file in the `backend` directory:

```env
# Database
MONGO_URI=mongodb://localhost:27017/resume-builder
# Or for MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/resume-builder

# JWT Configuration
JWT_SECRET=your-super-secure-random-jwt-secret-key-here
JWT_EXPIRES_IN=7d

# Google Gemini AI
GEMINI_API_KEY=your-google-gemini-api-key-here

# Server Configuration
PORT=5000
CLIENT_URL=http://localhost:3000
```

#### Generating JWT Secret
Run this command in your terminal to generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and use it as your `JWT_SECRET`.

#### Getting Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create a new project or select existing one
3. Generate an API key
4. Copy the key and set it as `GEMINI_API_KEY`

### 3. Database Setup

#### Local MongoDB
Make sure MongoDB is running locally:
```bash
# On macOS with Homebrew
brew services start mongodb/brew/mongodb-community

# On Ubuntu/Debian
sudo systemctl start mongod

# On Windows
net start MongoDB
```

#### MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster
3. Get connection string and update `MONGO_URI`

### 4. Running the Application

#### Development Mode
Open two terminals:

**Terminal 1 - Backend:**
```bash
cd backend
npm i
npm run dev
```
Server will start on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm i
npm run dev
```
Frontend will start on `http://localhost:5173`

#### Production Build
```bash
# Build frontend
cd frontend
npm run build

# Backend production (if configured)
cd ../backend
npm start
```

### 5. Access the Application

Open your browser and navigate to `http://localhost:3000`

- **Registration/Login**: Create account or sign in
- **Dashboard**: Fill in your resume information
- **Generate LaTeX**: Click "Generate LaTeX" to create your resume
- **Download**: Download the `.tex` file and compile with LaTeX

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Resume
- `GET /api/resume` - Get user's resume
- `POST /api/resume` - Create new resume
- `PUT /api/resume` - Update existing resume

### AI
- `POST /api/ai/generate` - Generate LaTeX from resume data

## Project Structure

```
resume-making/
├── backend/
│   ├── src/
│   │   ├── app.js              # Express app setup
│   │   ├── server.js           # Server entry point
│   │   ├── config/
│   │   │   └── db.js           # Database connection
│   │   ├── controllers/        # Route handlers
│   │   ├── middleware/         # Auth middleware, error handler
│   │   ├── models/             # Mongoose schemas
│   │   └── routes/             # API routes
│   ├── package.json
│   └── .env                    # Environment variables
├── frontend/
│   ├── src/
│   │   ├── App.jsx             # Main React app
│   │   ├── api.js              # Axios configuration
│   │   ├── pages/              # React components
│   │   └── assets/             # Static assets
│   ├── package.json
│   ├── vite.config.js          # Vite configuration
│   └── index.html
└── README.md
```

## Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MONGO_URI` | MongoDB connection string | Yes | - |
| `JWT_SECRET` | Secret key for JWT signing | Yes | - |
| `JWT_EXPIRES_IN` | JWT token expiration time | No | `7d` |
| `GEMINI_API_KEY` | Google Gemini API key | Yes | - |
| `PORT` | Server port | No | `5000` |
| `CLIENT_URL` | Frontend URL for CORS | No | `*` |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.</content>
<parameter name="filePath">c:\Users\lenovo\Desktop\resume making\README.md