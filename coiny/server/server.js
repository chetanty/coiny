const express = require("express");
const multer = require("multer");
const OpenAI = require("openai");
const cors = require("cors");
const { getJson } = require("serpapi");
require("dotenv").config();

const app = express();
const port = 5000;

app.use(cors());

const upload = multer({ storage: multer.memoryStorage() });

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  organization: process.env.REACT_APP_OPENAI_ORG_ID,
});

// Update ggShopping function to handle async properly and extract shopping_results
async function ggShopping(q) {
  return new Promise((resolve, reject) => {
    getJson(
      {
        api_key: "8350eade01527f51a9edf4a0056b4aba30a1dd63fec69d0782a312c18c423d77",
        engine: "google",
        q: q,
        location: "Edmonton, Alberta, Canada",
        google_domain: "google.ca",
        gl: "ca",
        hl: "en",
        tbm: "shop",
        num: "5"
      },
      (json) => {
        if (json && json.shopping_results) {
          // Limit to the first 5 results manually
          resolve(json.shopping_results.slice(0, 5));
        } else {
          reject("Failed to fetch shopping data");
        }
      }
    );
  });
}


async function analyzeCoinImages(base64DataArray) {
  const imageUrls = base64DataArray.map((base64Data) => ({
    type: "image_url",
    image_url: { url: `data:image/jpeg;base64,${base64Data}` },
  }));

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Analyze these coin images (they are the same coin, front and back images) and provide the country, year, mint, denomination, estimated price in today's market and a fun fact briefly without the heading. Separate each field with a ;",
          },
          ...imageUrls,
        ],
      },
    ],
  });

  const result = response.choices[0].message.content;
  const [country, year, mint, denomination, estimatedPrice, funFact] = result
    .split(";")
    .map((item) => item.trim());

  return { country, year, mint, denomination, estimatedPrice, funFact };
}

// Make /price route async to await ggShopping response
app.get("/price", async (req, res) => {
  try {
    const price = await ggShopping("1916 canadian penny");
    res.json(price);
  } catch (error) {
    console.error("Error fetching price:", error);
    res.status(500).json({ error: "An error occurred while fetching the price." });
  }
});

app.post("/upload", upload.array("files"), async (req, res) => {
  try {
    const files = req.files;
    const base64DataArray = files.map((file) => file.buffer.toString("base64"));
    const result = await analyzeCoinImages(base64DataArray);

    // Fetch eBay information for the coin
    const ebayResults = await ggShopping(`${result.country} ${result.year} ${result.denomination}`);

    // Combine analysis result with eBay results
    const combinedResult = {
      ...result,
      ebayResults,
    };

    res.json(combinedResult);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred while processing the images." });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});