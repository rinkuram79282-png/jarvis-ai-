import express from "express";
import cors from "cors";
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const app = express();

app.use(cors());
app.use(express.json({ limit: "5mb" }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

app.get("/", (req, res) => {
  res.send("JARVIS backend is running!");
});

app.post("/api/analyze", async (req, res) => {
  try {
    const image = req.body.image;

    if (
      typeof image !== "string" ||
      !image.startsWith("data:image/jpeg;base64,")
    ) {
      return res.status(400).json({
        error: "Valid JPEG image required"
      });
    }

    const base64 = image.split(",")[1];

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64
            }
          },
          {
            text: "Is image mein jo dikh raha hai, use simple Roman Hindi mein samjhao. Objects identify karo aur agar sure nahi ho to batao."
          }
        ]
      }]
    });

    res.json({
      answer: result.text || "Analysis nahi mil saka."
    });
  } catch (error) {
    console.error("Gemini error:", error.message);
    res.status(500).json({
      error: "AI analysis failed. Server settings check karo."
    });
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("JARVIS backend running on port " + port);
});
