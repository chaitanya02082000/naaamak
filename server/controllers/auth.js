import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

/* REGISTER USER */
/**
 * Registers a new user in the database.
 * Hashes the password and saves the user object in the database.
 * Returns the saved user object in the response.
 */
export const register = async (req, res) => {
  try {
    console.log(req.body);
    const {
      firstName,
      lastName,
      email,
      password,
      picture,
    } = req.body;

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
      picture,
    });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* LOGGING IN */

/**
 * Logs in an existing user.
 * Finds the user with the given email in the database.
 * Compares the hashed password with the provided password.
 * If the password matches, generates a JWT token and sends it in the response along with the user object.
 */
export const login = async (req, res) => {
  try {
    console.log(req.body);
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) return res.status(400).json({ msg: "User does not exist. " });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials. " });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    delete user.password;
    res.status(200).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Handles Google OAuth callback.
 * After Google authentication is successful, generates a JWT token
 * and sends it in the response along with the user object.
 */
export const googleCallback = async (req, res) => {
  try {
    console.log("Google callback controller hit");
    // Passport puts the authenticated user in req.user
    const user = req.user;
    
    if (!user) {
      console.error("No user in request after Google authentication");
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=authentication_failed`);
    }
    
    console.log("Google authentication successful for user:", user._id);
    
    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    
    // Get the client URL from environment or use default
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const redirectUrl = `${clientUrl}/oauth-callback?token=${token}&userId=${user._id}`;
    
    console.log("Redirecting to:", redirectUrl);
    
    // Redirect with token and user info
    res.redirect(redirectUrl);
  } catch (err) {
    console.error("Google callback error:", err);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=server_error`);
  }
};