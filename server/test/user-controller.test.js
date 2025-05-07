// test/user-controller.test.js
const {
  signUp,
  logIn,
  getAllUsers,
  deleteUser,
} = require("../controller/user-contoller");
const User = require("../model/User");
const bcrypt = require("bcryptjs");

jest.mock("../model/User");
jest.mock("bcryptjs");

describe("User Controller", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  // --- signUp ---
  describe("signUp", () => {
    it("returns 201 and user on success", async () => {
      mockReq.body = { name: "Test", email: "t@e.com", password: "pwd" };
      User.findOne.mockResolvedValue(null);
      bcrypt.hashSync.mockReturnValue("hashed");
      const mockUser = { save: jest.fn() };
      User.mockImplementation(() => mockUser);

      await signUp(mockReq, mockRes);

      expect(User.findOne).toHaveBeenCalledWith({ email: "t@e.com" });
      expect(bcrypt.hashSync).toHaveBeenCalledWith("pwd");
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ user: mockUser });
    });

    it("returns 400 if user exists", async () => {
      mockReq.body = { email: "t@e.com" };
      User.findOne.mockResolvedValue({ _id: "123" });

      await signUp(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "User already exists",
      });
    });

    it("handles errors (500)", async () => {
      mockReq.body = { email: "t@e.com" };
      User.findOne.mockRejectedValue(new Error("fail"));

      await signUp(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });

  // --- logIn ---
  describe("logIn", () => {
    it("returns 200 on successful login", async () => {
      mockReq.body = { email: "t@e.com", password: "pwd" };
      User.findOne.mockResolvedValue({ password: "hashed" });
      bcrypt.compareSync.mockReturnValue(true);

      await logIn(mockReq, mockRes);

      expect(User.findOne).toHaveBeenCalledWith({ email: "t@e.com" });
      expect(bcrypt.compareSync).toHaveBeenCalledWith("pwd", "hashed");
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Login Successful",
      });
    });

    it("returns 400 if user not found", async () => {
      mockReq.body = { email: "t@e.com" };
      User.findOne.mockResolvedValue(null);

      await logIn(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "User not found",
      });
    });

    it("returns 400 if password incorrect", async () => {
      mockReq.body = { email: "t@e.com", password: "pwd" };
      User.findOne.mockResolvedValue({ password: "hashed" });
      bcrypt.compareSync.mockReturnValue(false);

      await logIn(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Incorrect password",
      });
    });

    it("handles errors (500)", async () => {
      mockReq.body = { email: "t@e.com" };
      User.findOne.mockRejectedValue(new Error("fail"));

      await logIn(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });

  // --- getAllUsers & deleteUser ---
  describe("getAllUsers", () => {
    it("should return all users", async () => {
      const users = [{ name: "U1" }];
      User.find.mockResolvedValue(users);

      await getAllUsers(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ users });
    });

    it("handles errors", async () => {
      User.find.mockRejectedValue(new Error("err"));

      await getAllUsers(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Unexpected Error Occurred",
      });
    });
  });

  describe("deleteUser", () => {
    it("deletes a user", async () => {
      mockReq.params = { id: "123" };
      User.findByIdAndDelete.mockResolvedValue({ _id: "123" });

      await deleteUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "User Deleted" });
    });

    it("returns 404 if not found", async () => {
      mockReq.params = { id: "123" };
      User.findByIdAndDelete.mockResolvedValue(null);

      await deleteUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "User Not Found",
      });
    });

    it("handles errors", async () => {
      mockReq.params = { id: "123" };
      User.findByIdAndDelete.mockRejectedValue(new Error("err"));

      await deleteUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Unexpected Error Occurred",
      });
    });
  });
});
