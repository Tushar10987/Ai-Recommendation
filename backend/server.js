require("dotenv").config();

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const CATEGORY_KEYWORDS = {
  phone: ["phone", "smartphone", "mobile"],
  laptop: ["laptop", "notebook"],
  headphones: ["headphone", "headphones", "earbuds", "earphones"],
  smartwatch: ["smartwatch", "watch"]
};

const toNumber = (value) => Number.parseInt(value, 10);

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

function extractRequestedCategories(userInput = "") {
  const text = userInput.toLowerCase();
  const categories = new Set();

  Object.entries(CATEGORY_KEYWORDS).forEach(([category, keywords]) => {
    if (keywords.some((keyword) => text.includes(keyword))) {
      categories.add(category);
    }
  });

  return categories;
}

function extractBudgetRule(userInput = "") {
  const normalized = userInput.toLowerCase().replace(/,/g, "");
  const amountMatch = normalized.match(/\d{2,6}/);

  if (!amountMatch) {
    return null;
  }

  const amount = toNumber(amountMatch[0]);
  const isMinBudget = /(over|above|more than|at least|min)/i.test(normalized);

  return {
    amount,
    type: isMinBudget ? "min" : "max"
  };
}

function matchesBudget(productPrice, budgetRule) {
  if (!budgetRule) {
    return true;
  }

  if (budgetRule.type === "min") {
    return productPrice >= budgetRule.amount;
  }

  return productPrice <= budgetRule.amount;
}

function buildFallbackReason(product, context) {
  const reasonParts = [];

  if (context.budgetRule && matchesBudget(product.price, context.budgetRule)) {
    reasonParts.push(
      context.budgetRule.type === "max"
        ? "fits your budget"
        : "matches your target price range"
    );
  }

  if (context.categories.size > 0 && context.categories.has(product.category)) {
    reasonParts.push(`matches your ${product.category} preference`);
  }

  if (reasonParts.length === 0) {
    reasonParts.push("is a good overall fit for your search");
  }

  return `${capitalize(reasonParts.join(" and "))}.`;
}

function fallbackRecommendations(userInput, products) {
  const context = {
    categories: extractRequestedCategories(userInput),
    budgetRule: extractBudgetRule(userInput)
  };

  const filtered = products.filter((product) => {
    if (context.categories.size > 0 && !context.categories.has(product.category)) {
      return false;
    }

    if (!matchesBudget(product.price, context.budgetRule)) {
      return false;
    }

    return true;
  });

  return filtered
    .sort((a, b) => a.price - b.price)
    .slice(0, 6)
    .map((product) => ({
      name: product.name,
      reason: buildFallbackReason(product, context)
    }));
}

function parseAIJson(content) {
  if (!content || typeof content !== "string") {
    return null;
  }

  try {
    return JSON.parse(content);
  } catch (error) {
    const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (codeBlockMatch) {
      try {
        return JSON.parse(codeBlockMatch[1]);
      } catch {
        return null;
      }
    }

    const arrayMatch = content.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try {
        return JSON.parse(arrayMatch[0]);
      } catch {
        return null;
      }
    }
  }

  return null;
}

function sanitizeAIRecommendations(rawRecommendations, products, userInput) {
  if (!Array.isArray(rawRecommendations)) {
    return [];
  }

  const productLookup = new Map(
    products.map((product) => [product.name.toLowerCase(), product])
  );
  const context = {
    categories: extractRequestedCategories(userInput),
    budgetRule: extractBudgetRule(userInput)
  };

  const output = [];
  const seen = new Set();

  rawRecommendations.forEach((item) => {
    const name = typeof item === "string" ? item : item?.name;
    const reason = typeof item === "object" && item !== null ? item.reason : "";

    if (!name || typeof name !== "string") {
      return;
    }

    const matchedProduct = productLookup.get(name.toLowerCase());
    if (!matchedProduct || seen.has(matchedProduct.id)) {
      return;
    }

    output.push({
      name: matchedProduct.name,
      reason:
        typeof reason === "string" && reason.trim()
          ? reason.trim()
          : buildFallbackReason(matchedProduct, context)
    });

    seen.add(matchedProduct.id);
  });

  return output.slice(0, 6);
}

app.post("/recommend", async (req, res) => {
  const userInput = typeof req.body?.userInput === "string" ? req.body.userInput : "";
  const products = Array.isArray(req.body?.products) ? req.body.products : [];

  const fallback = () => fallbackRecommendations(userInput, products);

  try {
    if (openai) {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content:
              "You are a product recommendation assistant. Return ONLY a JSON array of up to 6 objects with keys: name and reason. name must be from the provided list only. reason must be a single line."
          },
          {
            role: "user",
            content: `User query: ${userInput}\nProducts: ${JSON.stringify(products)}`
          }
        ]
      });

      const content = response?.choices?.[0]?.message?.content || "";
      const parsed = parseAIJson(content);
      const aiRecommendations = sanitizeAIRecommendations(parsed, products, userInput);

      if (aiRecommendations.length > 0) {
        return res.json({ recommendations: aiRecommendations });
      }
    }

    return res.json({ recommendations: fallback() });
  } catch (error) {
    console.error("AI request failed, using fallback.", error.message);
    return res.json({ recommendations: fallback() });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
