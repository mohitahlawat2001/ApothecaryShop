const express = require("express");
const router = express.Router();
const maomaoAiController = require("../controllers/maomaoAiController");

/**
 * @swagger
 * /api/maomao-ai/generate:
 *   post:
 *     tags:
 *       - AI Assistant
 *     summary: Generate AI pharmaceutical response
 *     description: Generate AI-powered pharmaceutical knowledge responses using MaoMao AI assistant
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: The question or prompt for the AI
 *                 example: "Tell me about herbs for headaches"
 *               userName:
 *                 type: string
 *                 description: Name or role of the user asking
 *                 example: "Pharmacist"
 *               userContext:
 *                 type: string
 *                 description: Context of the user's situation
 *                 example: "Working at a pharmacy counter helping a customer"
 *               clearHistory:
 *                 type: boolean
 *                 description: Whether to clear conversation history before responding
 *                 default: false
 *               outputFormat:
 *                 type: string
 *                 enum: ["text", "list", "sentence", "html", "medical", "recipe"]
 *                 description: |
 *                   Format for the AI response:
 *                   - **text**: Plain text paragraphs (default)
 *                   - **list**: Comma-separated list of items
 *                   - **sentence**: Single concise sentence
 *                   - **html**: Formatted HTML content
 *                   - **medical**: Medical information with uses, side effects, etc.
 *                   - **recipe**: Medicinal preparation recipe with ingredients and steps
 *                 default: "text"
 *               structuredOutput:
 *                 type: boolean
 *                 description: |
 *                   Whether to return structured JSON output based on outputFormat:
 *                   - **list**: Returns array of strings
 *                   - **medical**: Returns structured medical information object
 *                   - **recipe**: Returns recipe object with ingredients and steps
 *                   - **others**: Returns object with title, content, and references
 *                 default: false
 *           examples:
 *             basicQuery:
 *               summary: Basic pharmaceutical query
 *               value:
 *                 prompt: "What are the side effects of ibuprofen?"
 *                 userName: "Pharmacist"
 *                 userContext: "Consulting with patient"
 *                 outputFormat: "text"
 *             structuredMedical:
 *               summary: Structured medical information
 *               value:
 *                 prompt: "Tell me about paracetamol dosage and contraindications"
 *                 userName: "Doctor"
 *                 userContext: "Prescribing medication"
 *                 outputFormat: "medical"
 *                 structuredOutput: true
 *             herbalRecipe:
 *               summary: Herbal preparation recipe
 *               value:
 *                 prompt: "How to prepare ginger tea for nausea?"
 *                 userName: "Herbalist"
 *                 userContext: "Preparing natural remedy"
 *                 outputFormat: "recipe"
 *                 structuredOutput: true
 *     responses:
 *       200:
 *         description: AI response generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   oneOf:
 *                     - type: string
 *                       description: Plain text response (when structuredOutput is false)
 *                     - type: object
 *                       description: Structured response (when structuredOutput is true)
 *                     - type: array
 *                       description: Array response (for list format with structuredOutput true)
 *                 conversationId:
 *                   type: string
 *                   description: ID for conversation tracking
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   description: Response generation timestamp
 *             examples:
 *               textResponse:
 *                 summary: Plain text response
 *                 value:
 *                   response: "Ibuprofen is a nonsteroidal anti-inflammatory drug (NSAID) that can cause side effects including stomach upset, heartburn, dizziness, and in rare cases, more serious effects like gastrointestinal bleeding..."
 *                   conversationId: "conv_123456"
 *                   timestamp: "2023-07-15T14:30:00Z"
 *               structuredMedical:
 *                 summary: Structured medical response
 *                 value:
 *                   response:
 *                     medication: "Paracetamol"
 *                     dosage: "Adults: 500-1000mg every 4-6 hours, maximum 4g daily"
 *                     contraindications: ["Severe liver disease", "Known hypersensitivity"]
 *                     sideEffects: ["Rare liver toxicity with overdose", "Skin reactions"]
 *                     interactions: ["Warfarin", "Alcohol"]
 *                   conversationId: "conv_123457"
 *                   timestamp: "2023-07-15T14:32:00Z"
 *       400:
 *         description: Bad request - Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error or AI service error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/generate", maomaoAiController.generateResponse);

module.exports = router;