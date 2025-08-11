import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// Middleware CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200); // Dừng ở đây cho preflight request
  }
  next();
});

app.post("/api/reply", async (req, res) => {
  const { emailBody, language, tone } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!emailBody) {
    return res.status(400).json({ error: "Missing emailBody" });
  }

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Bạn là trợ lý AI, hãy trả lời email bằng giọng ${tone || "chuyên nghiệp"} và giữ nguyên ngôn ngữ gốc (${language || "không xác định"}).`
          },
          { role: "user", content: emailBody }
        ]
      }),
    });

    const data = await r.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return res.status(500).json({ error: "Invalid response from OpenAI" });
    }

    res.json({ reply: data.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
