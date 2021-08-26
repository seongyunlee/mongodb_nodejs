const express = require("express");
const router = express.Router();

const User = require("./../models/User");

// Password Handler
const bcrypt = require("bcrypt");
const { json } = require("express");

router.post("/signup", (req, res) => {
  console.log(req.body);
  let { email, password } = req.body;
  email = email.trim();
  password = password.trim();
  if (email == "" || password == "") {
    res.json({
      status: "FAILED",
      message: "Empty input fields",
    });
  } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    res.json({
      status: "FAILED",
      message: "Invalid email entered",
    });
  } else {
    User.find({ email })
      .then((result) => {
        if (result.length) {
          res.json({
            stauts: "FAILED",
            message: "User with the provided email already exists",
          });
        } else {
          //try to create new user
          //password hadling
          const saltRounds = 10;
          bcrypt
            .hash(password, saltRounds)
            .then((hashedPassword) => {
              const newUser = new User({
                email,
                password: hashedPassword,
              });
              newUser.save().then((result) => {
                res.json({
                  status: "SUCCESS",
                  message: "Sign up Success",
                });
              });
            })
            .catch((err) => {
              res.json({
                status: "FAILED",
                message: "An error occured while saving user!",
              });
            });
        }
      })
      .catch((err) => {
        console.log(err);
        res.json({
          status: "FAILED",
          message: "An error occured while checking for existing user!",
        });
      });
  }
});

router.post("/signin", (req, res) => {
  console.log(req.body);
  let { email, password } = req.body;
  email = email.trim();
  if (email == "" || password == "") {
    res.json({
      status: "FAILED",
      message: "Empty Field",
    });
  } else {
    User.find({ email })
      .then((data) => {
        if (data) {
          const hashedPassword = data[0].password;
          bcrypt
            .compare(password, hashedPassword)
            .then((result) => {
              if (result) {
                res.json({
                  status: "Success",
                  message: "Signin Successful",
                  data: data,
                });
              } else {
                res.json({
                  status: "FAILED",
                  message: "Invalid password entered!",
                });
              }
            })
            .catch((err) => {
              res.json({
                status: "FAILED",
                message: "An error occured while comparing",
              });
            });
        } else {
          res.json({
            status: "Failed",
            message: "Invalid credentails entered",
          });
        }
      })
      .catch((err) => {
        res.json({
          status: "failed",
          message: "An error occured while checking existing user",
        });
      });
  }
});
module.exports = router;
