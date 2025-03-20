const express = require('express');
const router = express.Router();
const multer = require('multer');
const visionController = require('../controllers/maomaoVisionController');

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

// Route for analyzing a product image
router.post('/analyze', upload.single('image'), visionController.analyzeProductImage);

// Route for extracting text from a product image
router.post('/extract-text', upload.single('image'), visionController.extractTextFromImage);

module.exports = router;
