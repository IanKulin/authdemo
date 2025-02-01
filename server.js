import express from "express";
import session from "express-session";
import FileStore from "session-file-store";

const app = express();
const PORT = 3000;
const FileStoreSession = FileStore(session);

// Middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session configuration
app.use(session({
  store: new FileStoreSession({
    path: './sessions',
    ttl: 86400, // 1 day in seconds
    retries: 0,
  }),
  secret: 'your-secret-key-here', // In production, use environment variable
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Only use secure in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 1 day in milliseconds
  }
}));

// Test route to see session in action
app.get("/", (req, res) => {
  req.session.viewCount = (req.session.viewCount || 0) + 1;
  res.send(`You've visited this page ${req.session.viewCount} times`);
});

// Protected route - we'll add authentication later
app.get("/protected", (req, res) => {
  res.send("Hello, world!");
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});