const express = require("express");
const multer = require("multer");
const OpenAI = require("openai");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = 5000;

app.use(cors());

const upload = multer({ storage: multer.memoryStorage() });

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,  // Store your OpenAI API key in .env file
  organization: process.env.REACT_APP_OPENAI_ORG_ID, // Replace with your organization ID
});

async function analyzeCoinImages(base64DataArray) {
  const imageUrls = base64DataArray.map(base64Data => ({
    type: "image_url",
    image_url: { url: `data:image/jpeg;base64,${base64Data}` },
  }));

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "Analyze these coin images (they are the same coin, front and back images) and provide the country, year, mint, denomination, and a fun fact. Separate each field with a ;" },
          ...imageUrls,
        ],
      },
    ],
  });

  const result = response.choices[0].message.content;
  const [country, year, mint, denomination, funFact] = result.split(";").map(item => item.trim());

  return { country, year, mint, denomination, funFact };
}

app.post("/upload", upload.array("files"), async (req, res) => {
  try {
    const files = req.files;
    const base64DataArray = files.map(file => file.buffer.toString("base64"));
    const result = await analyzeCoinImages(base64DataArray);

    res.json(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred while processing the images." });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});