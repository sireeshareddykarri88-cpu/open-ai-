import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import supabase from "./supabase.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: message
            }
          ]
        })
      }
    );

    const data = await response.json();

    const aiReply =
      data.choices?.[0]?.message?.content ||
      "No response from AI";

    await supabase.from("chats").insert([
      {
        user_message: message,
        ai_reply: aiReply
      }
    ]);

    res.json({
      reply: aiReply
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Server Error"
    });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server Running...");
});
