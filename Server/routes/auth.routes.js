const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../database/db");
const router = express.Router();

router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({ error: "Please fill in all fields" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .send({ error: "Password must be at least 6 characters long" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const username = email.split("@")[0];

    const query = "CALL sp_user_register(?, ?, ?)";
    db.query(query, [email, hashedPassword, username], (err, results) => {
      if (err) {
        console.error("Error registering user:", err);
        return res.status(500).send({ error: "Failed to register user" });
      }
      req.session.email = email;

      res.send({
        message: "User registered successfully",
      });
    });
  } catch (error) {
    console.error("Error hashing password:", error);
    return res.status(500).send({ error: "Failed to register user" });
  }
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({ error: "Please fill in all fields" });
  }

  const query = "CALL sp_user_login(?)";
  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error("Error retrieving user for login:", err);
      return res.status(500).send({ error: "Failed to login user" });
    }

    if (results[0].length === 0) {
      return res.status(401).send({ error: "Invalid email or password" });
    }

    const user = results[0][0];

    try {
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        console.log(
          Login attempt with incorrect password for email: ${email}
        );
        return res.status(401).send({ error: "Invalid email or password" });
      }

      req.session.email = email;

      res.send({
        message: "User logged in successfully",
        sessionId: req.sessionID,
        userId: user.userId,
      });
    } catch (error) {
      console.error("Error during login process:", error);
      return res.status(500).send({ error: "Failed to login user" });
    }
  });
});

router.get("/user_profile", (req, res) => {
  const sessionId = req.headers["session-id"];

  if (!sessionId) {
    return res.status(400).send({ error: "Session ID is required" });
  }

  req.sessionStore.get(sessionId, (err, session) => {
    if (err || !session || !session.email) {
      return res
        .status(401)
        .send({ error: "Invalid session or session expired" });
    }

    const query = "CALL sp_user_profile(?)";
    db.query(query, [session.email], (err, results) => {
      if (err) {
        console.error("Error retrieving user:", err);
        return res.status(500).send({ error: "Failed to retrieve user" });
      }

      if (results[0].length === 0) {
        return res.status(404).send({ error: "User not found" });
      }

      const user = results[0][0];
      res.send({ user });
    });
  });
});

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error logging out user:", err);
      return res.status(500).send({ error: "Failed to logout user" });
    }
    res.clearCookie("connect.sid");
    res.send({ message: "User logged out successfully" });
  });
});

module.exports = router;