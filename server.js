import fetch from "node-fetch";

export default async function handler(req, res) {
  // Thêm CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Xử lý preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Chỉ cho phép POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

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

    if (!data.choices?.[0]?.message) {
      return res.status(500).json({ error: "Invalid response from OpenAI" });
    }

    res.json({ reply: data.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
