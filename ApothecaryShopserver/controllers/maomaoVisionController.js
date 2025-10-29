const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize the Google Generative AI client with the correct env variable
const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-pro' });

/**
 * Analyzes an image of a medicinal product using Google's Gemini model
 * @param {Request} req - Express request object with image file in req.file
 * @param {Response} res - Express response object
 */
exports.analyzeProductImage = async (req, res) => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                message: "Please upload an image" 
            });
        }

        // Get prompt from request or use default
        const prompt = req.body.prompt || 'Identify this medicinal product and provide its name, category, typical uses, and any visible information from the packaging.';
        
        // Get image buffer from multer
        const imageBuffer = req.file.buffer;

        // Generate content using Gemini API
        const result = await model.generateContent([
            {
                inlineData: {
                    data: imageBuffer.toString("base64"),
                    mimeType: req.file.mimetype,
                },
            },
            prompt,
        ]);

        // Return the analysis results
        return res.status(200).json({
            success: true,
            analysis: result.response.text()
        });
    } catch (error) {
        console.error("Error analyzing product image:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to analyze image",
            error: error.message
        });
    }
};

/**
 * Extracts text from a medicinal product image
 * @param {Request} req - Express request object with image file in req.file
 * @param {Response} res - Express response object
 */
exports.extractTextFromImage = async (req, res) => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                message: "Please upload an image" 
            });
        }
        
        // Get image buffer from multer
        const imageBuffer = req.file.buffer;

        // Generate content using Gemini API specifically for text extraction
        const result = await model.generateContent([
            {
                inlineData: {
                    data: imageBuffer.toString("base64"),
                    mimeType: req.file.mimetype,
                },
            },
            'Extract and list all text visible in this image of a medicinal product. Format as plain text.',
        ]);

        // Return the extracted text
        return res.status(200).json({
            success: true,
            extractedText: result.response.text()
        });
    } catch (error) {
        console.error("Error extracting text from image:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to extract text from image",
            error: error.message
        });
    }
};
