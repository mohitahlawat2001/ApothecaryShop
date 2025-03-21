const express = require('express');
const router = express.Router();
const multer = require('multer');
const visionController = require('../controllers/maomaoVisionController');
const auth = require('../middleware/auth'); // Import authentication middleware

// Configure multer for memory storage (files as buffer)
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // Limit file size to 10MB
    },
    fileFilter: (req, file, cb) => {
        // Accept images only
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

// Route for analyzing a product image - protected with auth middleware
router.post('/analyze', auth, upload.single('image'), visionController.analyzeProductImage);

// Route for extracting text from a product image - protected with auth middleware
router.post('/extract-text', auth, upload.single('image'), visionController.extractTextFromImage);

module.exports = router;
