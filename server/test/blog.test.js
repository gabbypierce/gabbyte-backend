const mongoose = require("mongoose");
const Blog = require("../model/Blog");
const User = require("../model/User");

describe("Blog Model Test", () => {
  let user;

  beforeAll(async () => {
    await mongoose.connect("mongodb://localhost/testdb", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    user = new User({
      name: "Blog User",
      email: "bloguser@example.com",
      password: "password123",
      blogs: [],
    });
    await user.save();
  });

  afterEach(async () => {
    await Blog.deleteMany();
  });

  afterAll(async () => {
    await User.deleteMany();
    await mongoose.connection.close();
  });

  it("creates & saves a blog successfully", async () => {
    const validBlog = new Blog({
      title: "Test Blog",
      desc: "Test Description",
      img: "https://example.com/image.jpg",
      user: user._id,
    });

    const savedBlog = await validBlog.save();
    expect(savedBlog._id).toBeDefined();
    expect(savedBlog.title).toBe("Test Blog");
    expect(savedBlog.user).toEqual(user._id);
  });
});
