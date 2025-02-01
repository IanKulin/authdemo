// server.js
import express from "express";
import session from "express-session";
import FileStore from "session-file-store";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const FileStoreSession = FileStore(session);

// Parse the users from env
const users = JSON.parse(process.env.USERS || "[]");

// Middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session configuration updated to use env
app.use(
  session({
    store: new FileStoreSession({
      path: "./sessions",
      ttl: 86400,
      retries: 0,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport's Local Strategy
passport.use(
  new LocalStrategy(function (username, password, done) {
    const user = users.find(
      (u) => u.username === username && u.password === password
    );
    if (!user) {
      return done(null, false, { message: "Incorrect username or password" });
    }
    return done(null, user);
  })
);

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser((id, done) => {
  const user = users.find((u) => u.id === id);
  done(null, user);
});

// Routes
app.get("/", (req, res) => {
  res.send(`Home page. Authenticated: ${req.isAuthenticated()}`);
});

app.get("/logout", (req, res) => {
  // Modern versions of passport require a callback for logout
  req.logout((err) => {
    if (err) {
      return res.status(500).send("Error logging out");
    }
    res.redirect("/");
  });
});

app.get("/protected", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send("You need to log in first");
  }
  res.send(`
      Welcome ${req.user.username}! This is a protected route.<br>
      <a href="/logout">Logout</a>
    `);
});

// Login routes
app.get("/login", (req, res) => {
  res.send(`
    <form action="/login" method="post">
      Username: <input name="username"><br>
      Password: <input name="password" type="password"><br>
      <button>Log In</button>
    </form>
  `);
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/protected",
    failureRedirect: "/login",
  })
);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
