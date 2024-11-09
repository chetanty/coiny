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
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
});

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const fileBuffer = req.file.buffer;
    const base64Data = fileBuffer.toString("base64");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "what is the country, year, mint, denomination, and fun fact of this coin? Separate each field with a ;" },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64Data}` },
            },
          ],
        },
      ],
    });

    const result = response.choices[0].message.content;
    const [country, year, mint, denomination, funFact] = result.split(";").map(item => item.trim());

    res.json({ country, year, mint, denomination, funFact });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred while processing the image." });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
