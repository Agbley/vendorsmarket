const router = require("express").Router();
const Product = require("../models/productModel");
const authMiddleware = require("../middleware/authMiddleware");
const cloudinary = require("../config/cloudinaryConfig");
const multer = require("multer");

// Use dynamic import for products.mjs
// let UploadProductImage;
// import("../../client/src/apicalls/products.js")
//   .then((module) => {
//     UploadProductImage = module.default;
//   })
//   .catch((err) => {
//     console.error("Failed to import UploadProductImage:", err);
//   });

// add a new product
router.post("/add-product", authMiddleware, async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.send({
      success: true,
      message: "Product added successfully",
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// get all products
router.post("/get-products", async (req, res) => {
  try {
    const { seller, categories = [], age = [] } = req.body;
    let filters = {};
    if (seller) {
      filters.seller = seller;
    }
    const products = await Product.find(filters)
      .populate("seller")
      .sort({ createdAt: -1 });
    res.send({
      success: true,
      products,
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// edit a product
router.put("/edit-product/:id", authMiddleware, async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, req.body);
    res.send({
      success: true,
      message: "Product updated successfully",
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// delete a product
router.delete("/delete-product/:id", authMiddleware, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.send({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// get image from PC
const storage = multer.diskStorage({
  filename: function (req, file, callback) {
    callback(null, Date.now() + file.originalname);
  },
});

router.post(
  "/upload-image-to-product",
  authMiddleware,
  multer({ storage: storage }).single("file"),
  async (req, res) => {
    try {
      // Check if file exists in the request
      if (!req.file) {
        return res.status(400).send({
          success: false,
          message: "No file uploaded",
        });
      }
      // Check if productId is provided and valid
      const productId = req.body.productId;
      if (!productId) {
        return res.status(400).send({
          success: false,
          message: "Product ID is required",
        });
      }
      // upload image to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "multivendormarket",
      });

      // Update products with uploaded image URL
      const products = await Product.findById(productId);
      products.images.push(result.secure_url);
      await products.save();

      // Send success response
      res.status(200).send({
        success: true,
        message: "Image uploaded successfully",
        imageUrl: result.secure_url,
      });
    } catch (error) {
      // Error handling
      console.error("Error uploading image:", error);
      res.status(500).send({
        success: false,
        message: "Error uploading image",
      });
    }
  }
);

// update product status
router.put("/update-product-status/:id", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    await Product.findByIdAndUpdate(req.params.id, { status });
    res.send({
      success: true,
      message: "Product status updated successfully",
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
