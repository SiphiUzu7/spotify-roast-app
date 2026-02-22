import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 8787;

if (!process.env.GEMINI_API_KEY) {
  console.error("Missing GEMINI_API_KEY in server/.env");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/api/roast", async (req, res) => {
  try {
    const profile = req.body?.profile;

    if (!profile?.topArtists?.length && !profile?.topTracks?.length) {
      return res.status(400).json({ error: "Profile listening data missing" });
    }

    const roastSchema = {
      type: "object",
      additionalProperties: false,
      properties: {
        roastText: { type: "string", maxLength: 280 },
        scores: {
          type: "object",
          additionalProperties: false,
          properties: {
            cringe: { type: "number", minimum: 0, maximum: 10 },
            mainCharacterEnergy: { type: "number", minimum: 0, maximum: 10 },
            tasteLevel: { type: "number", minimum: 0, maximum: 10 },
          },
          required: ["cringe", "mainCharacterEnergy", "tasteLevel"],
        },
        footer: { type: "string", maxLength: 40 },
      },
      required: ["roastText", "scores", "footer"],
    };

    const prompt = `
User: ${profile.displayName ?? "Unknown"}
Top artists: ${(profile.topArtists ?? []).slice(0, 10).join(", ")}
Top tracks: ${(profile.topTracks ?? []).slice(0, 10).join(", ")}
Recently played: ${(profile.recentlyPlayed ?? []).slice(0, 10).join(", ")}
`.trim();

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        // Strong steering at the config level
        systemInstruction:
          "Return ONLY valid JSON that matches the provided schema. No markdown, no backticks, no preamble.",
        responseMimeType: "application/json",
        responseJsonSchema: roastSchema,
        maxOutputTokens: 360,
        temperature: 0.35,

        // ✅ Disable thinking so JSON doesn’t get separated into thought parts
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    // ✅ Don’t trust response.text alone — build raw from ALL parts
    const raw = getAllCandidateText(response);

    if (!raw) {
      console.error("Empty model output. Full response:", response);
      return res.status(502).json({ error: "Gemini returned empty output" });
    }

    const roast = parseGeminiJson(raw);

    // Enforce your UI rules server-side
    roast.roastText = enforceOneSentenceTwentyWords(roast.roastText);
    roast.footer = clamp(roast.footer, 40);

    return res.json(roast);
  } catch (err) {
    const msg = err?.message ?? String(err);

    // If rate-limited, forward properly
    if (msg.includes('"code":429') || msg.includes("RESOURCE_EXHAUSTED")) {
      return res.status(429).json({
        error: "Rate limited by Gemini",
        retryAfterSeconds: extractRetryAfterSeconds(msg) ?? 60,
        detail: msg,
      });
    }

    console.error("Roast error:", err);
    return res.status(500).json({
      error: "Roast generation failed",
      detail: msg,
    });
  }
});

/* ---------------- Helpers ---------------- */

function getAllCandidateText(response) {
  // response.text excludes thought parts. :contentReference[oaicite:3]{index=3}
  const parts = response?.candidates?.[0]?.content?.parts ?? [];
  const all = parts.map((p) => p?.text ?? "").join("");

  // Prefer the full parts-join if it contains JSON braces; otherwise fall back.
  const t = response?.text ?? "";
  if (containsJson(all)) return all;
  if (containsJson(t)) return t;

  // If neither contains JSON, still return all (for debugging/extraction attempts).
  return all || t || "";
}

function containsJson(s) {
  return typeof s === "string" && /[\{\[]/.test(s);
}

function parseGeminiJson(rawText) {
  const extracted = extractFirstJsonValue(rawText);

  try {
    return JSON.parse(extracted);
  } catch {
    // common model mistake: trailing commas
    const repaired = extracted.replace(/,\s*([}\]])/g, "$1");
    try {
      return JSON.parse(repaired);
    } catch (e2) {
      console.error("Raw model output:\n", rawText);
      console.error("Extracted JSON candidate:\n", extracted);
      console.error("Repaired JSON candidate:\n", repaired);
      throw new Error(
        `Model output was not valid JSON after extraction. First chars: ${JSON.stringify(
          rawText.slice(0, 80)
        )}`
      );
    }
  }
}

function extractFirstJsonValue(text) {
  if (typeof text !== "string") return "";

  // Strip code fences if present
  let s = text.replace(/```json/gi, "```").trim();

  // Find first { or [
  const start = s.search(/[\{\[]/);
  if (start === -1) return s.trim();
  s = s.slice(start);

  const stack = [];
  let inString = false;
  let quote = "";
  let escaped = false;

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === quote) {
        inString = false;
        quote = "";
      }
      continue;
    }

    if (ch === '"' || ch === "'") {
      inString = true;
      quote = ch;
      continue;
    }

    if (ch === "{" || ch === "[") stack.push(ch);

    if (ch === "}" || ch === "]") {
      stack.pop();
      if (stack.length === 0) {
        return s.slice(0, i + 1).trim();
      }
    }
  }

  return s.trim();
}

function extractRetryAfterSeconds(msg) {
  const m1 = msg.match(/retry in\s+([\d.]+)s/i);
  if (m1) return Math.ceil(Number(m1[1]));
  const m2 = msg.match(/"retryDelay"\s*:\s*"(\d+)s"/i);
  if (m2) return Number(m2[1]);
  return null;
}

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
  const fillers = ["honestly", "somehow", "still", "tonight", "though", "anyway", "maybe", "frankly", "basically", "truly"];

  let finalWords = words;
  if (finalWords.length > 40) finalWords = finalWords.slice(0, 40);
  while (finalWords.length < 40) finalWords.push(fillers[(finalWords.length - 1) % fillers.length]);

  return finalWords.join(" ").trim() + ".";
}

app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});