// Import required modules and functions
import express from "express";
import { login, googleCallback } from "../controllers/auth.js";
import passport from "../services/passport.js";

// Create a new router instance
const router = express.Router();

/* POST user login */
router.post("/login", login);

/* Google OAuth Routes */
router.get(
  "/google",
  (req, res, next) => {
    console.log("Google auth route hit");
    next();
  },
  passport.authenticate("google", { 
    scope: ["profile", "email"],
    session: false
  })
);

router.get(
  "/google/callback",
  (req, res, next) => {
    console.log("Google callback route hit");
    next();
  },
  passport.authenticate("google", { 
    failureRedirect: "/login",
    session: false 
  }),
  googleCallback
);

// Export the router for use in other modules
export default router;