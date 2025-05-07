// controller/blog-controller.js
const mongoose = require("mongoose");
const Blog = require("../model/Blog");
const User = require("../model/User");

const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find();
    if (!blogs || blogs.length === 0) {
      return res.status(404).json({ message: "No blogs found" });
    }
    return res.status(200).json({ blogs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Unexpected Error Occurred" });
  }
};

const addBlog = async (req, res) => {
  const { title, description, image, user } = req.body;
  try {
    const existingUser = await User.findById(user);
    if (!existingUser) {
      return res.status(400).json({ message: "Unauthorized" });
    }

    const session = await mongoose.startSession();
    session.startTransaction()

    const blog = new Blog({ title, description, image, user, date: new Date() });
    await blog.save({ session });

    existingUser.blogs.push(blog);
    await existingUser.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ blog });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Unexpected Error Occurred" });
  }
};

const updateBlog = async (req, res) => {
  const { id } = req.params;
  try {
    // Move destructuring inside try so missing req.body is caught
    const { title, description } = req.body;
    const blog = await Blog.findByIdAndUpdate(id, { title, description });
    if (!blog) {
      return res.status(500).json({ message: "Unable to update" });
    }
    return res.status(200).json({ blog });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Unexpected Error Occurred" });
  }
};

const getById = async (req, res) => {
  const { id } = req.params;
  try {
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(500).json({ message: "not found" });
    }
    return res.status(200).json({ blog });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Unexpected Error Occurred" });
  }
};

const deleteBlog = async (req, res) => {
  const { id } = req.params;
  try {
    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    const user = await User.findById(blog.user);
    user.blogs.pull(blog);
    await user.save();
    return res.status(200).json({ message: "Blog Deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unexpected Error Occurred" });
  }
};

const getByUserId = async (req, res) => {
  const { id } = req.params;
  try {
    const userWithBlogs = await User.findById(id);
    if (!userWithBlogs) {
      return res.status(404).json({ message: "No Blog Found" });
    }
    return res.status(200).json({ user: userWithBlogs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Unexpected Error Occurred" });
  }
};

module.exports = {
  getAllBlogs,
  addBlog,
  updateBlog,
  getById,
  deleteBlog,
  getByUserId,
};
