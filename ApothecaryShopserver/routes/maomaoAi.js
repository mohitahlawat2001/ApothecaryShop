const express = require("express");
const router = express.Router();
const maomaoAiController = require("../controllers/maomaoAiController");
const auth = require("../middleware/auth");

// Routes - protected by auth middleware
// MaoMao AI route
// Usage: POST http://localhost:5000/api/maomao-ai/generate
// Headers: 
//   - Content-Type: application/json
//   - Authorization: Bearer <your-jwt-token>
// Body: { 
//   "prompt": "Tell me about herbs for headaches", 
//   "userName": "Pharmacist",
//   "userContext": "Working at a pharmacy counter helping a customer",
//   "clearHistory": false,
//   "outputFormat": "text", // Options: "text", "list", "sentence", "html", "medical", "recipe"
//   "structuredOutput": false // Set to true to get JSON-structured response based on outputFormat
// }
// 
// For structured outputs (JSON), use these outputFormat values:
// - "list": Returns an array of strings
// - "medical": Returns structured medical information with uses, side effects, etc.
// - "recipe": Returns a medicinal preparation recipe with ingredients and steps
// - others: Returns an object with title, content, and references
router.post("/generate", auth, maomaoAiController.generateResponse);

module.exports = router;