require("dotenv").config();

const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const EMAIL = process.env.OFFICIAL_EMAIL;

/* -------- HEALTH CHECK -------- */

app.get("/health", (req, res) => {
  res.json({
    is_success: true,
    official_email: EMAIL
  });
});

/* -------- MATH HELPERS -------- */

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
const lcm = (a, b) => (a * b) / gcd(a, b);

const isPrime = (n) => {
  if (n <= 1) return false;
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false;
  }
  return true;
};

/* -------- MAIN API -------- */

app.post("/bfhl", async (req, res) => {
  try {
    const body = req.body;
    let result;

    /* Fibonacci */
    if (body.fibonacci !== undefined) {
      let n = Number(body.fibonacci);
      if (!Number.isInteger(n) || n < 1)
        return res.status(400).json({ is_success: false, official_email: EMAIL, data: "Input must be a positive integer" });

      let fib = [0, 1];
      if (n === 1) result = [0];
      else {
        for (let i = 2; i < n; i++) {
          fib[i] = fib[i - 1] + fib[i - 2];
        }
        result = fib.slice(0, n);
      }
    }

    /* Prime */
    else if (body.prime) {
      if (!Array.isArray(body.prime) || body.prime.some(x => !Number.isInteger(x)))
        return res.status(400).json({ is_success: false, official_email: EMAIL, data: "Input must be an integer array" });

      result = body.prime.filter(isPrime);
    }

    /* LCM */
    else if (body.lcm) {
      if (!Array.isArray(body.lcm) || body.lcm.some(x => !Number.isInteger(x)))
        return res.status(400).json({ is_success: false, official_email: EMAIL, data: "Input must be an integer array" });

      result = body.lcm.reduce(lcm);
    }

    /* HCF */
    else if (body.hcf) {
      if (!Array.isArray(body.hcf) || body.hcf.some(x => !Number.isInteger(x)))
        return res.status(400).json({ is_success: false, official_email: EMAIL, data: "Input must be an integer array" });

      result = body.hcf.reduce(gcd);
    }

    /* -------- AI PART -------- */

    else if (body.AI) {
      if (typeof body.AI !== "string" || !body.AI.trim()) {
        return res.status(400).json({ is_success: false, official_email: EMAIL, data: "Invalid AI input" });
      }
      try {
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.API_KEY}`,
          {
            contents: [
              {
                parts: [{ text: "Answer the following question in a single word only: " + body.AI }]
              }
            ]
          },
          {
            headers: { "Content-Type": "application/json" }
          }
        );

        result =
          response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
          "No AI response";

        // Remove any extra punctuation or spaces if needed, theoretically the prompt handles it
        // result = result.split(/\s+/)[0]; 

      } catch (err) {
        console.error("Gemini API Error:", err.response?.data || err.message);
        return res.status(500).json({ is_success: false, official_email: EMAIL });
      }
    }

    else {
      return res.status(400).json({ is_success: false, official_email: EMAIL });
    }

    res.json({
      is_success: true,
      official_email: EMAIL,
      data: result
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ is_success: false });
  }
});

/* -------- SERVER START -------- */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
