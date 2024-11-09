const express = require("express");
const multer = require("multer");
const OpenAI = require("openai");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = 5000;

// Enable CORS
app.use(cors());

// Set up file upload with multer
const upload = multer({ storage: multer.memoryStorage() }); // Store file in memory as buffer

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: "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",  // Store your OpenAI API key in .env file
    organization: "org-31Y7dSscnPnwYM4Mmh8xat13", // Replace with your organization ID
//   project: "$PROJECT_ID", // Replace with your project ID
});

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const fileBuffer = req.file.buffer; // Access file as buffer

    // Convert the file buffer to a Base64 string
    const base64Data = fileBuffer.toString('base64');

    // Send the image data to OpenAI's model
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "What’s in this image?" },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Data}`,
              },
            },
          ],
        },
      ],
    });

    // Send response back to the client
    res.json({ text: response.choices[0].message.content });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred while processing the image." });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});