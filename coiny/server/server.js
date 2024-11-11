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
async function ggShopping(query) {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    throw new Error("SerpAPI key is missing");
  }

  return new Promise((resolve, reject) => {
    getJson(
      {
        api_key: apiKey,
        engine: "google_shopping",
        google_domain: "google.com",
        q: query,
        num: "20", // Fetch more results for better filtering
        hl: "en",
        gl: "us",
        no_cache: "true",
        direct_link: "true",
      },
      (json) => {
        if (json && json.shopping_results) {
          // Filter out results without a valid price
          let validResults = json.shopping_results.filter(item => item.extracted_price);

          // Sort results by price in ascending order
          validResults.sort((a, b) => a.extracted_price - b.extracted_price);

          // Remove duplicates based on the item title
          const uniqueResultsMap = new Map();
          validResults.forEach(item => {
            if (!uniqueResultsMap.has(item.title.toLowerCase())) {
              uniqueResultsMap.set(item.title.toLowerCase(), item);
            }
          });

          // Convert map back to an array and take the top 5 lowest-priced unique items
          const uniqueResults = Array.from(uniqueResultsMap.values()).slice(0, 5);

          // Map to the final output format
          const lowestPricedResults = uniqueResults.map(item => ({
            title: item.title,
            price: item.extracted_price,
            link: item.product_link,
            thumbnail: item.thumbnail,
          }));

          resolve(lowestPricedResults);
        } else {
          resolve([]);
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
            text: "Analyze these coin images (they are the same coin, front and back images) and provide the country, year, mint, denomination, estimated price in today's market and a fun fact briefly without the heading. Separate each field with a ;. Do not include anything else other than the information i asked for, if you don't know, try a guess but keep it briefly",
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