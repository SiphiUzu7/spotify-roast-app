import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json({ limit: "1mb"}));

const PORT = process.env.PORT || 8787;

if (!process.env.GEMINI_API_KEY) {
    console.error("Missing GEMINI_API_KEY in server/ .env")
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY});


/*Health Check for server test*/
app.get("/api/health", (req, res) => {
    res.json({ok:true});
});


app.post("/api/roast", async(req, res) => {
    try{
        const profile = req.body?.profile;

        if(!profile?.topArtists?.length && !profile?.topTracks?.length){
            return res.status(400).json({ error:"Profile listening data missing"});
        }

        const roastSchema = {
            type: "object",
            additionalProperties: false,
            properties: {
                roastText: {
                    type: "string", 
                    description: "Main roast paragraph. Funnt, sharp, quirky and not hateful.", 
                    maxLength: 120
                },
                scores: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                        cringe: {type: "number", minimum: 0, maximum: 10},
                        mainCharacterEnergy: {type: "number", minimum: 0, maximum: 10},
                        tasteLevel: {type: "number", minimum: 0, maximum: 10},
                    },
                    required: ["cringe","mainCharacterEnergy","tasteLevel"]
                },
                footer: {
                    type: "string", 
                    description: "Short closer line. Encouraging-ish", 
                    maxLength: 20}
            },
            required: ["roastText", "scores", "footer"]
        };

        const prompt = `
        You are a comedic and edgy music critic. Roast the user's music taste in a playful way.

        Rules:
        - No slurs, no hate, no protected-class insults, no real-world threats.
        - roastText must be EXACTLY 1 sentence of EXACTLY 20 words.
        - footer must be under 20 characters.
        - Scores are 0.0 to 10.0 (one decimal is nice).

        User: ${profile.displayName ?? "Unknown"}
        Top artist: ${(profile.topArtists ?? []).slice(0, 10).join(", ")}
        Top tracks: ${(profile.topTracks ?? []).slice(0, 10).join(", ")}
        Recently played: ${(profile.recentlyPlayed ?? []).slice(0, 10).join(", ")}
        `.trim();

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseJsonSchema: roastSchema,
                maxOutputTokens: 200,
            },
        });

        const raw = response?.text ?? "";

        if (!raw) {
            console.error("Gemini response had no .text:", response);
            return res.status(502).json({ error: "Gemini returned empty response" });
        } 

        let roast;
        try{
            roast = JSON.parse(raw);
        } catch (parseErr) {
            console.error("Failed to parse Gemini JSON. Raw output:\n", raw);
            throw parseErr;
        }


        roast.roastText = enforceOneSentenceTwentyWords(roast.roastText);
        roast.footer = clamp(roast.footer, 20);


        res.json(roast);
    } catch(err) {
        console.error(err);
        res.status(500).json({
            error: "Roast generation failed",
            detail: err?.message ?? String(err),
        });
    }
});

function clamp(value, maxChars) {
  if (typeof value !== "string") return "";
  const s = value.replace(/\s+/g, " ").trim();
  return s.length > maxChars ? s.slice(0, maxChars).trim() : s;
}

function firstSentence(value) {
  if (typeof value !== "string") return "";
  const s = value.replace(/\s+/g, " ").trim();
  const m = s.match(/^(.+?[.!?])\s|^(.+)$/);
  return (m?.[1] ?? m?.[2] ?? "").trim();
}

function enforceOneSentenceTwentyWords(value) {
  let s = firstSentence(value);
  s = s.replace(/[.!?]+$/, "").trim();

  const words = s.split(" ").filter(Boolean);
  const fillers = [
    "honestly",
    "somehow",
    "still",
    "tonight",
    "though",
    "anyway",
    "maybe",
    "frankly",
    "basically",
    "truly"
];

  let finalWords = words;

  if (finalWords.length > 20) finalWords = finalWords.slice(0, 20);

  while (finalWords.length < 20) {
    finalWords.push(fillers[(finalWords.length - 1) % fillers.length]);
  }

  return finalWords.join(" ").trim() + ".";
}


app.listen(PORT, () => {
    console.log(`Server running: http://localhost:${PORT}`);
});

