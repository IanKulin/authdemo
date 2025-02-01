import express from "express";

const app = express();
const PORT = 3000;

// public route
app.get("/", (req, res) => {
  res.send("Hello, world!");
});

// protected route
app.get("/protected", (req, res) => {
    res.send("Hello, world!");
  });
  

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});