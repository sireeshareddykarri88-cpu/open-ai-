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

app.get("/", (req, res) => {
  res.send("Server Running");
});

app.post("/chat", async (req, res) => {

  try {

    console.log(req.body);

    const message = req.body.message;

    if (!message) {

      return res.status(400).json({
        reply: "Message required"
      });

    }

    const aiResponse = await fetch(
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

    const data = await aiResponse.json();

    console.log(data);

    const reply =
      data?.choices?.[0]?.message?.content
      || "No AI response";

    await supabase.from("chats").insert([
      {
        user_message: message,
        ai_reply: reply
      }
    ]);

    return res.json({
      reply
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      reply: "Backend Server Error"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
