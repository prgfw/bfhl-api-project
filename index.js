require("dotenv").config();

const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const EMAIL = process.env.OFFICIAL_EMAIL;



app.get("/health", (req, res) => {
  res.json({
    is_success: true,
    official_email: EMAIL
  });
});



const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

const lcm = (a, b) => (a * b) / gcd(a, b);

const isPrime = (n) => {
  if (n <= 1) return false;
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false;
  }
  return true;
};


app.post("/bfhl", async (req, res) => {
  try {
    const body = req.body;
    let result;

    
    if (body.fibonacci !== undefined) {
      let n = body.fibonacci;
      if (typeof n !== "number" || n < 1)
        return res.status(400).json({ is_success: false });

      let fib = [0, 1];
      for (let i = 2; i < n; i++) {
        fib[i] = fib[i - 1] + fib[i - 2];
      }
      result = fib.slice(0, n);
    }

    
    else if (body.prime) {
      if (!Array.isArray(body.prime))
        return res.status(400).json({ is_success: false });

      result = body.prime.filter(isPrime);
    }

 
    else if (body.lcm) {
      if (!Array.isArray(body.lcm))
        return res.status(400).json({ is_success: false });

      result = body.lcm.reduce(lcm);
    }

   
    else if (body.hcf) {
      if (!Array.isArray(body.hcf))
        return res.status(400).json({ is_success: false });

      result = body.hcf.reduce(gcd);
    }

    else if (body.AI) {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.API_KEY}`,
        {
          contents: [{ parts: [{ text: body.AI }] }]
        }
      );

      result =
        response.data.candidates[0].content.parts[0].text
          .split(" ")[0]; 
    }

    else {
      return res.status(400).json({ is_success: false });
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



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
