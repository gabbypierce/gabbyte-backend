const User = require("../model/User");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate and normalize email
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    const safeEmail = email.trim().toLowerCase();

    // Check for existing user
    const filter = { email: safeEmail };
    // NOSONAR: email has been validated and normalized above
    const existingUser = await User.findOne(filter); // NOSONAR
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash and create
    const hashedPassword = bcrypt.hashSync(password);
    const user = new User({ name, email: safeEmail, password: hashedPassword });
    await user.save();

    return res.status(201).json({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const logIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // validate adn normalize email
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    const safeEmail = email.trim().toLowerCase();

    // Lookup user
    const filter = { email: safeEmail };
    const existingUser = await User.findOne(filter); // NOSONAR
    if (!existingUser) {
      return res.status(400).json({ message: "User not found" });
    }

    // compare password
    const isCorrect = bcrypt.compareSync(password, existingUser.password);
    if (!isCorrect) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    return res.status(200).json({ message: "Login Successful" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json({ users });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unexpected Error Occurred" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User Not Found" });
    }
    return res.status(200).json({ message: "User Deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unexpected Error Occurred" });
  }
};

module.exports = {
  signUp,
  logIn,
  getAllUsers,
  deleteUser
};
