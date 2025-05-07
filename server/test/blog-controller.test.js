const { getAllBlogs, addBlog, updateBlog, getById, deleteBlog, getByUserId } = require("../controller/blog-controller");
const Blog = require("../model/Blog");
const User = require("../model/User");

jest.mock("mongoose", () => {
  const actual = jest.requireActual("mongoose");
  return {
    ...actual,
    Schema: actual.Schema,
    startSession: jest.fn().mockResolvedValue({
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    }),
    Types: {
      ...actual.Types,
      ObjectId: jest.fn(),
    },
  };
});

jest.mock("../model/Blog");
jest.mock("../model/User");

describe("Blog Controller", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe("getAllBlogs", () => {
    it("should return all blogs", async () => {
      const mockBlogs = [{ title: "Blog 1" }, { title: "Blog 2" }];
      Blog.find.mockResolvedValue(mockBlogs);

      await getAllBlogs(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ blogs: mockBlogs });
    });

    it("should handle errors", async () => {
      Blog.find.mockRejectedValue(new Error("DB error"));

      await getAllBlogs(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Unexpected Error Occurred" });
    });
  });

  describe("addBlog", () => {
    it("should add a new blog", async () => {
      mockReq.body = {
        title: "New Blog",
        description: "Test",
        image: "image.jpg",
        user: "123",
      };

      const mockUser = {
        blogs: [],
        save: jest.fn(),
      };

      const mockBlog = {
        save: jest.fn().mockResolvedValue(true),
      };

      Blog.mockImplementation(() => mockBlog);
      User.findById.mockResolvedValue(mockUser);

      await addBlog(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ blog: mockBlog });
    });

    it("should handle errors in blog creation", async () => {
      mockReq.body = { user: "123" };
      User.findById.mockRejectedValue(new Error("DB error"));

      await addBlog(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Unexpected Error Occurred" });
    });
  });

  describe("updateBlog", () => {
    it("should update a blog", async () => {
      mockReq.params = { id: "abc" };
      mockReq.body = { title: "Updated", description: "Updated" };

      Blog.findByIdAndUpdate.mockResolvedValue({ title: "Updated", description: "Updated" });

      await updateBlog(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ blog: { title: "Updated", description: "Updated" } });
    });

    it("should handle errors", async () => {
      mockReq.params = { id: "abc" };
      Blog.findByIdAndUpdate.mockRejectedValue(new Error("Update error"));

      await updateBlog(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Unexpected Error Occurred" });
    });
  });

  describe("getById", () => {
    it("should get a blog by ID", async () => {
      mockReq.params = { id: "abc" };
      Blog.findById.mockResolvedValue({ title: "Blog A" });

      await getById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ blog: { title: "Blog A" } });
    });

    it("should handle errors", async () => {
      mockReq.params = { id: "abc" };
      Blog.findById.mockRejectedValue(new Error("Error"));

      await getById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Unexpected Error Occurred" });
    });
  });

  describe("deleteBlog", () => {
    it("should delete a blog", async () => {
      mockReq.params = { id: "abc" };

      const mockUser = {
      blogs: { pull: jest.fn() },
      save: jest.fn(),
      };

      const mockBlog = {
        user: mockUser,
        remove: jest.fn(),
      };

      Blog.findByIdAndDelete.mockResolvedValue(mockBlog);
      User.findById.mockResolvedValue(mockUser);

      await deleteBlog(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Blog Deleted" });
    });

    it("should handle deletion error", async () => {
      mockReq.params = { id: "abc" };
      Blog.findByIdAndDelete.mockRejectedValue(new Error("Fail"));

      await deleteBlog(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Unexpected Error Occurred" });
    });
  });

  describe("getByUserId", () => {
    it("should return blogs for a user", async () => {
      mockReq.params = { id: "123" };
      const mockBlogs = [{ title: "User Blog" }];
      User.findById.mockResolvedValue({ blogs: mockBlogs });

      await getByUserId(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ user: { blogs: mockBlogs } });
    });

    it("should handle errors", async () => {
      mockReq.params = { id: "123" };
      User.findById.mockRejectedValue(new Error("Failed"));

      await getByUserId(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Unexpected Error Occurred" });
    });
  });
});
