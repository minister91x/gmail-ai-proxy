import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

app.post("/api/reply", async (req, res) => {
  const { emailBody, language, tone } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;

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
          { role: "system", content: `Bạn là trợ lý AI, hãy trả lời email bằng giọng ${tone || "chuyên nghiệp"} và giữ nguyên ngôn ngữ gốc (${language}).` },
          { role: "user", content: emailBody }
        ]
      }),
    });
    const data = await r.json();
    res.json({ reply: data.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("Server running"));
