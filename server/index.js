// Importing necessary packages and modules
import express from "express"; // web framework
import connectDB from "./mongodb/connect.js";
import bodyParser from "body-parser";// middleware for parsing request bodies
import mongoose from "mongoose"; // ODM library for MongoDB
import cors from "cors"; // middleware for enabling Cross-Origin Resource Sharing
import * as dotenv from "dotenv"; // package for managing environment variables
import multer from "multer"; // middleware for handling file uploads
import helmet from "helmet"; // middleware for securing HTTP headers
import morgan from "morgan"; // middleware for logging HTTP requests and responses
import path from "path"; // built-in Node.js module for handling file paths 
import { fileURLToPath } from "url"; // built-in Node.js module for working with file URLs
import session from "express-session"; // middleware for managing sessions
import passport from "./services/passport.js"; // passport configuration
import authRoutes from "./routes/auth.js"; // authentication routes
import userRoutes from "./routes/users.js"; // user routes
import debugRoutes from "./routes/debug.js"; // debug routes
import { register } from "./controllers/auth.js"; // authentication controller functions
import User from "./models/User.js"; // user model
import SavedRecipes from "./models/SavedRecipes.js"; // saved recipes model
import { users,  savedRecipes} from "./data/index.js"; // sample data
import recipeRoutes from "./routes/recipes.js"; // recipe routes

//CONFIGURATIONS AND SETUP
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config(); // load environment variables from .env file

// Validate required environment variables
if (!process.env.MONGO_URL) {
  console.error('MONGO_URL is not defined in .env file');
  process.exit(1);
}

if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not defined in .env file');
  process.exit(1);
}

// Set CLIENT_URL environment variable if not set
if (!process.env.CLIENT_URL) {
  process.env.CLIENT_URL = 'http://localhost:3000';
}

const app = express(); // create express app

// Configure CORS to allow requests from the client
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

app.use(express.json()); // middleware for parsing JSON request bodies
app.use(helmet()); // middleware for setting various security-related HTTP headers
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" })); // middleware for enabling CORS with cross-origin policy
app.use(morgan("common")); // middleware for logging HTTP requests and responses
app.use(bodyParser.json({ limit: "30mb", extended: true })); // middleware for parsing JSON request bodies with specified size limit and extended mode
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true })); // middleware for parsing URL-encoded request bodies with specified size limit and extended mode
app.use("/assets", express.static(path.join(__dirname, "public/assets"))); // serve static files from public/assets directory

/* SESSION CONFIGURATION */
app.use(session({
  secret: process.env.JWT_SECRET || 'fallback_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

/* FILE STORAGE */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets"); // specify upload destination directory
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // specify uploaded file name
  },
});
const upload = multer({ storage }); // create middleware for handling file uploads


/* ROUTES WITH FILES */
app.post("/auth/register", upload.single("picture"), register); // register endpoint with file upload middleware
app.get("/", (req, res) => {
  res.send({ message: "Hello World!" }); // root endpoint
});

/* ROUTES */
app.use("/auth", authRoutes); // use authentication routes
app.use("/users", userRoutes); // use user routes
app.use("/api/recipes", recipeRoutes); // use recipe routes with /api prefix
app.use("/debug", debugRoutes); // use debug routes

// Debug route to check if Google auth is properly configured
app.get("/auth-debug", (req, res) => {
  res.json({
    googleAuthConfigured: !!process.env.GOOGLE_CLIENT_ID,
    googleAuthCallbackUrl: process.env.GOOGLE_CALLBACK_URL,
    routes: {
      googleAuth: "/auth/google",
      googleCallback: "/auth/google/callback"
    }
  });
});
 
//MONGOOSE SETUP
const PORT = process.env.PORT || 5000; // set server port to 5000

const startServer = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    connectDB(process.env.MONGO_URL, () => {
      console.log("MongoDB connected successfully");
      app.listen(PORT, () => {
        console.log(`Server started on port http://localhost:${PORT}`);
        console.log('Available routes:');
        console.log('- POST /api/recipes/scrape');
        console.log('- POST /auth/register');
        console.log('- GET /auth/google (Google OAuth)');
        console.log('- GET /debug/config (Debug OAuth config)');
        console.log('- GET /debug/mock-oauth-callback (Test OAuth flow)');
        console.log('- GET /');
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};
startServer();






