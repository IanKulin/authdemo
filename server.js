import express from "express";
import session from "express-session";
import FileStore from "session-file-store";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import dotenv from "dotenv";
import {
  findUser,
  verifyPassword,
  addUser,
  getUsers,
} from "./userOperations.js";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const FileStoreSession = FileStore(session);

// Set up EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session configuration
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

// Initialize Passport connect to session
app.use(passport.initialize());
app.use(passport.session());

// Configure Local Strategy
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await findUser(username);
      if (!user) {
        return done(null, false, { message: "Incorrect username or password" });
      }
      const isMatch = await verifyPassword(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: "Incorrect username or password" });
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

// Get the id for a user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Get a user from an id
passport.deserializeUser(async (id, done) => {
  try {
    const users = await getUsers();
    const user = users.find((u) => u.id === id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

app.get("/", (req, res) => {
  res.render("home", { isAuthenticated: req.isAuthenticated() });
});

app.get("/logout", (req, res) => {
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
  res.render("protected", {
    username: req.user.username,
    role: req.user.role,
  });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect("/login");
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect("/protected");
    });
  })(req, res, next);
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    await addUser(username, password);
    res.redirect("/login");
  } catch (error) {
    res.status(500).send("Error registering new user");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
