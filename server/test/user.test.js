const mongoose = require("mongoose");
const User = require("../model/User");

describe("User Model Test", () => {
  beforeAll(async () => {
    await mongoose.connect("mongodb://localhost/testdb", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterEach(async () => {
    await User.deleteMany(); // Clear users after each test
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("creates & saves a user successfully", async () => {
    const validUser = new User({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      blogs: [],
    });

    const savedUser = await validUser.save();
    expect(savedUser._id).toBeDefined();
    expect(savedUser.name).toBe("Test User");
    expect(savedUser.email).toBe("test@example.com");
  });
});
