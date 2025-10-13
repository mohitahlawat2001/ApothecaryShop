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

/**
 * @swagger
 * /api/vision/analyze:
 *   post:
 *     tags:
 *       - Vision
 *     summary: Analyze product image with AI
 *     description: Upload and analyze images of pharmaceutical products using AI vision capabilities
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file to analyze (JPG, JPEG, PNG, GIF, WEBP)
 *               prompt:
 *                 type: string
 *                 description: Optional custom prompt for specific analysis
 *                 example: "Identify the medication and extract dosage information"
 *           encoding:
 *             image:
 *               contentType: image/jpeg, image/png, image/gif, image/webp
 *     responses:
 *       200:
 *         description: Image analyzed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 analysis:
 *                   type: string
 *                   description: AI analysis of the product image
 *                   example: "This appears to be a box of Paracetamol 500mg tablets. The packaging shows..."
 *                 confidence:
 *                   type: number
 *                   format: float
 *                   description: Confidence score of the analysis
 *                   example: 0.95
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-07-15T14:30:00Z"
 *       400:
 *         description: Bad request - Invalid file or missing image
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               noFile:
 *                 summary: No file uploaded
 *                 value:
 *                   message: "No image file provided"
 *               invalidFile:
 *                 summary: Invalid file type
 *                 value:
 *                   message: "Only image files are allowed!"
 *               fileTooLarge:
 *                 summary: File too large
 *                 value:
 *                   message: "File size exceeds 10MB limit"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error or AI vision service error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/analyze', upload.single('image'), visionController.analyzeProductImage);

/**
 * @swagger
 * /api/vision/extract-text:
 *   post:
 *     tags:
 *       - Vision
 *     summary: Extract text from product image
 *     description: Extract text content from pharmaceutical product images using OCR capabilities
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file to extract text from (JPG, JPEG, PNG, GIF, WEBP)
 *           encoding:
 *             image:
 *               contentType: image/jpeg, image/png, image/gif, image/webp
 *     responses:
 *       200:
 *         description: Text extracted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 extractedText:
 *                   type: string
 *                   description: Text content extracted from the image
 *                   example: "PARACETAMOL TABLETS BP 500mg\nPack of 16 tablets\nExpiry: 12/2025\nBatch: ABC123"
 *                 confidence:
 *                   type: number
 *                   format: float
 *                   description: Confidence score of the text extraction
 *                   example: 0.92
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-07-15T14:30:00Z"
 *       400:
 *         description: Bad request - Invalid file or missing image
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               noFile:
 *                 summary: No file uploaded
 *                 value:
 *                   message: "No image file provided"
 *               invalidFile:
 *                 summary: Invalid file type
 *                 value:
 *                   message: "Only image files are allowed!"
 *               fileTooLarge:
 *                 summary: File too large
 *                 value:
 *                   message: "File size exceeds 10MB limit"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error or OCR service error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/extract-text', upload.single('image'), visionController.extractTextFromImage);

module.exports = router;
