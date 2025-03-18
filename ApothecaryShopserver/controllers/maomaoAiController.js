const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");
require('dotenv').config();

// In-memory store for conversation history (in a production app, use a database)
const userConversations = new Map();

// Controller for MaoMao AI
const maomaoAiController = {
  generateResponse: async (req, res) => {
    try {
      const { 
        prompt, 
        userName, 
        userContext, 
        clearHistory = false,
        outputFormat = "text", // Default output format is plain text
        structuredOutput = false // Whether to use JSON schema for response
      } = req.body;
      
      const userId = req.user.id; // Get the user ID from the authenticated request
      
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      // Initialize the AI with the API key from environment variables
      const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY);
      
      let model;
      let response;
      
      // Updated personality - more professional, less anime-like
      const maomaoPersonality = 
        "I am MaoMao AI, an expert pharmaceutical assistant with comprehensive knowledge of medicines, remedies, and medical ingredients. " +
        "I provide factual, science-based information about pharmaceuticals and traditional remedies. " +
        "I communicate clearly and professionally, focusing on accuracy and practical applications. " +
        "I can help discover connections between ingredients and their medicinal properties, and provide information about appropriate usage and potential side effects. " +
        "My responses are concise, informative and evidence-based.";

      // Get or initialize conversation history for this user
      if (!userConversations.has(userId) || clearHistory) {
        userConversations.set(userId, []);
      }
      const conversationHistory = userConversations.get(userId);

      // Build the prompt with conversation context
      let contextualPrompt = maomaoPersonality + "\n\n";
      
      // Add user-specific context if provided
      if (userName || userContext) {
        contextualPrompt += "Current situation:\n";
        if (userName) {
          contextualPrompt += `You are assisting ${userName}. `;
        }
        if (userContext) {
          contextualPrompt += `${userContext}`;
        }
        contextualPrompt += "\n\n";
      }
      
      // Add previous conversation context if available
      if (conversationHistory.length > 0) {
        contextualPrompt += "Previous conversation:\n";
        for (let i = 0; i < conversationHistory.length; i += 2) {
          if (i+1 < conversationHistory.length) {
            contextualPrompt += `User: ${conversationHistory[i].text}\n`;
            contextualPrompt += `MaoMao AI: ${conversationHistory[i+1].text}\n\n`;
          }
        }
      }
      
      // Add current prompt
      contextualPrompt += `User: ${prompt}\n\nMaoMao AI: `;

      // Check if structured output is requested
      if (structuredOutput) {
        // Define the JSON schema based on the output format
        let schema;
        
        switch(outputFormat.toLowerCase()) {
          case "list":
            schema = {
              type: SchemaType.ARRAY,
              description: "A list of items related to the query",
              items: {
                type: SchemaType.STRING
              }
            };
            break;
            
          case "medical":
            schema = {
              type: SchemaType.OBJECT,
              properties: {
                name: {
                  type: SchemaType.STRING,
                  description: "Name of the medicine or ingredient"
                },
                uses: {
                  type: SchemaType.ARRAY,
                  items: { type: SchemaType.STRING },
                  description: "List of medical uses"
                },
                sideEffects: {
                  type: SchemaType.ARRAY,
                  items: { type: SchemaType.STRING },
                  description: "Potential side effects"
                },
                dosage: {
                  type: SchemaType.STRING,
                  description: "Recommended dosage information"
                },
                interactions: {
                  type: SchemaType.ARRAY,
                  items: { type: SchemaType.STRING },
                  description: "Potential interactions with other substances"
                }
              },
              required: ["name", "uses"]
            };
            break;
            
          case "recipe":
            schema = {
              type: SchemaType.OBJECT,
              properties: {
                name: {
                  type: SchemaType.STRING,
                  description: "Name of the medicinal preparation"
                },
                ingredients: {
                  type: SchemaType.ARRAY,
                  items: { type: SchemaType.STRING },
                  description: "List of ingredients with approximate quantities"
                },
                preparation: {
                  type: SchemaType.ARRAY,
                  items: { type: SchemaType.STRING },
                  description: "Step by step preparation instructions"
                },
                applications: {
                  type: SchemaType.ARRAY,
                  items: { type: SchemaType.STRING },
                  description: "How to apply or administer this preparation"
                }
              },
              required: ["name", "ingredients", "preparation"]
            };
            break;
            
          default:
            schema = {
              type: SchemaType.OBJECT,
              properties: {
                title: {
                  type: SchemaType.STRING,
                  description: "A title summarizing the response"
                },
                content: {
                  type: SchemaType.STRING,
                  description: "The main content of the response"
                },
                references: {
                  type: SchemaType.ARRAY,
                  items: { type: SchemaType.STRING },
                  description: "References or sources for this information if applicable"
                }
              },
              required: ["title", "content"]
            };
        }
        
        // Configure the model with the schema
        model = genAI.getGenerativeModel({
          model: "gemini-2.0-flash",
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema,
            maxOutputTokens: 1000,
          }
        });
        
        // Generate structured content
        const result = await model.generateContent(contextualPrompt);
        response = JSON.parse(result.response.text());
        
      } else {
        // Regular text generation with formatting instructions
        model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        
        // Add output format instructions
        let formattingPrompt = contextualPrompt;
        switch(outputFormat.toLowerCase()) {
          case "list":
            formattingPrompt += "Please format your response as a comma-separated list of items.\n\n";
            break;
          case "sentence":
          case "sentance": // Handle common misspelling
            formattingPrompt += "Please provide your response as a single concise sentence.\n\n";
            break;
          case "html":
            formattingPrompt += "Please format your response as valid HTML that can be directly inserted into a webpage. Use appropriate HTML tags for structure.\n\n";
            break;
          default:
            formattingPrompt += "Please format your response as plain text with clear paragraphs.\n\n";
        }
        
        // Generate content with updated personality and conversation context
        const result = await model.generateContent(formattingPrompt);
        response = result.response.text();
      }

      // Store the conversation exchange in history with timestamps
      conversationHistory.push({
        text: prompt,
        timestamp: new Date().toISOString(),
        metadata: { userName, userContext, outputFormat, structuredOutput }
      });
      
      conversationHistory.push({
        text: typeof response === 'object' ? JSON.stringify(response) : response,
        timestamp: new Date().toISOString()
      });
      
      // Keep only the last 10 exchanges (20 messages - 10 from user, 10 from model)
      while (conversationHistory.length > 20) {
        conversationHistory.shift();
      }
      
      // Update the conversation history
      userConversations.set(userId, conversationHistory);

      res.json({ 
        response,
        outputFormat,
        structuredOutput,
        conversationHistory: conversationHistory,
        conversationLength: conversationHistory.length / 2 // Number of exchanges
      });
    } catch (error) {
      console.error("Error generating AI response:", error);
      res.status(500).json({ error: "Failed to generate response", details: error.message });
    }
  }
};

module.exports = maomaoAiController;
