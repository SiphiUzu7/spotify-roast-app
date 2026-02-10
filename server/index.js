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

const ai = new GoogleGenAI({ apiKey: process.env.HEMINI_API_KEY});


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
                roastText: {type: "string", description: "Main roast paragraph. Funnt, sharp, quirky and not hateful."},
                scores: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                        cringe: {type: "number", minimum: 0, maximum: 0},
                        mainCharacterEnergy: {type: "number", minimum: 0, maximum: 0},
                        tasteLevel: {type: "number", minimum: 0, maximum: 0},
                    },
                    required: ["cringe","mainCharacterEnergy","tasteLevel"]
                },
                footer: {type: "string", description: "Short closer line. Encouraging-ish"}
            },
            required: ["roastText", "scores", "footer"]
        };

        const prompt = `
        You are a comedic and edgy music critic. Roast the user's music taste in a playful way.

        Rules:
        - No slurs, no hate, no protected-class insults, no real-world threats.
        - Keep it punchy (max ~80 words for roastText).
        - Scores are 0.0 to 10.0 (one decimal is nice).

        User: ${profile.displayName ?? "Unknown"}
        Top artist: ${(profile.topArtists ?? []).slice(0, 10).join(", ")}
        Top tracks: ${(profile.topTracks ?? []).slice(0, 10).join(", ")}
        Recently played: ${(profile.recentlyPlayed ?? []).slice(0, 10).join(", ")}
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseJsonSchema: roastSchema
            }
        });

        const roast = JSON.parse(response.text);

        res.json(roast);
    } catch(err) {
        console.error(err);
        res.status(500).json({error: "Roast generation failed"});
    }
});
app.listen(PORT, () => {
    console.log(`Server running: http://localhost:${PORT}`);
});

