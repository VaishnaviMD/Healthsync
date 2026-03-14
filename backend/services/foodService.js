const fs = require('fs');
const path = require('path');

const foodsPath = path.join(__dirname, '../data/foods.json');
let foodsCache = null;

function getFoods() {
  if (!foodsCache) {
    const data = fs.readFileSync(foodsPath, 'utf8');
    foodsCache = JSON.parse(data);
  }
  return foodsCache;
}

function searchFoods(query, limit = 15) {
  const q = (query || '').toLowerCase().trim();
  if (!q || q.length < 2) return [];
  const foods = getFoods();
  const scored = foods.map(f => {
    const name = f.name.toLowerCase();
    const idx = name.indexOf(q);
    let score = 0;
    if (name === q) score = 100;
    else if (name.startsWith(q)) score = 80;
    else if (idx >= 0) score = 60 - idx;
    else if (name.includes(q)) score = 40;
    else if (q.split(/\s+/).every(w => name.includes(w))) score = 30;
    return { ...f, _score: score };
  }).filter(f => f._score > 0).sort((a, b) => b._score - a._score);
  return scored.slice(0, limit).map(({ _score, ...f }) => f);
}

function getNutritionForQuantity(food, quantityGrams) {
  const factor = (quantityGrams || 100) / 100;
  return {
    name: food.name,
    calories: Math.round((food.calories || 0) * factor),
    protein: Math.round((food.protein || 0) * factor * 10) / 10,
    carbs: Math.round((food.carbs || 0) * factor * 10) / 10,
    fats: Math.round((food.fats || 0) * factor * 10) / 10,
    fiber: Math.round((food.fiber || 0) * factor * 10) / 10,
  };
}

function parseIngredient(text) {
  const t = text.trim();
  const numMatch = t.match(/^(\d+(?:\.\d+)?)\s*(g|gram|grams|oz|ml|cup|cups|tbsp|tbspn|tsp|serving|servings|slice|slices|piece|pieces|egg|eggs)?\s+(.+)$/i)
    || t.match(/^(\d+(?:\.\d+)?)\s+(.+)$/);
  let quantityGrams = 100;
  let foodPart = t;
  if (numMatch) {
    const num = parseFloat(numMatch[1]);
    const unit = (numMatch[2] || '').toLowerCase();
    foodPart = (numMatch[3] || numMatch[2] || t).trim();
    if (unit === 'g' || unit === 'gram' || unit === 'grams') quantityGrams = num;
    else if (unit === 'oz') quantityGrams = num * 28.35;
    else if (unit === 'ml') quantityGrams = num;
    else if (unit === 'cup' || unit === 'cups') quantityGrams = num * 240;
    else if (unit === 'tbsp' || unit === 'tbspn') quantityGrams = num * 15;
    else if (unit === 'tsp') quantityGrams = num * 5;
    else if (unit === 'serving' || unit === 'servings') quantityGrams = num * 100;
    else if (unit === 'egg' || unit === 'eggs') quantityGrams = num * 50;
    else if (unit === 'slice' || unit === 'slices') quantityGrams = num * 30;
    else if (unit === 'piece' || unit === 'pieces') quantityGrams = num * 85;
    else if (!unit && foodPart) {
      const lower = foodPart.toLowerCase();
      if (lower.includes('egg')) quantityGrams = num * 50;
      else quantityGrams = num * 100;
    }
  }
  const food = searchFoods(foodPart, 1)[0];
  if (!food) return null;
  return getNutritionForQuantity(food, quantityGrams);
}

function parseIngredients(ingredientLines) {
  const lines = Array.isArray(ingredientLines)
    ? ingredientLines
    : (typeof ingredientLines === 'string' ? ingredientLines.split(/[,;\n]/) : []);
  const results = [];
  let total = { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, items: [] };
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const parsed = parseIngredient(trimmed);
    if (parsed) {
      results.push(parsed);
      total.calories += parsed.calories;
      total.protein += parsed.protein;
      total.carbs += parsed.carbs;
      total.fats += parsed.fats;
      total.fiber += parsed.fiber;
      total.items.push(parsed.name);
    }
  }
  return { items: results, total };
}

async function searchUSDA(query, apiKey) {
  if (!apiKey) return null;
  try {
    const res = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, pageSize: 10 }),
    });
    const data = await res.json();
    const foods = (data.foods || []).map(f => {
      const nutrients = (f.foodNutrients || []).reduce((acc, n) => {
        const name = (n.nutrientName || '').toLowerCase();
        const unit = (n.unitName || '').toLowerCase();
        if (name.includes('energy') && !unit.includes('kj') && acc.calories === 0) acc.calories = n.value || 0;
        else if (name.includes('protein')) acc.protein = n.value || 0;
        else if (name.includes('carbohydrate') && !name.includes('fiber')) acc.carbs = n.value || 0;
        else if (name.includes('total lipid') || name.includes('total fat')) acc.fats = n.value || 0;
        else if (name.includes('fiber')) acc.fiber = n.value || 0;
        return acc;
      }, { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 });
      const serving = f.servingSize || 100;
      const servingUnit = (f.servingSizeUnit || 'g').toLowerCase();
      const servingGrams = servingUnit === 'oz' ? serving * 28.35 : serving;
      const factor = 100 / (servingGrams || 100);
      return {
        name: f.description || f.foodCode,
        calories: Math.round((nutrients.calories || 0) * factor),
        protein: Math.round((nutrients.protein || 0) * factor * 10) / 10,
        carbs: Math.round((nutrients.carbs || 0) * factor * 10) / 10,
        fats: Math.round((nutrients.fats || 0) * factor * 10) / 10,
        fiber: Math.round((nutrients.fiber || 0) * factor * 10) / 10,
        source: 'usda',
      };
    });
    return foods;
  } catch (err) {
    console.error('USDA search error:', err.message);
    return null;
  }
}

async function analyzeImageWithVision(imageData, openaiKey) {
  if (!openaiKey) return null;
  const imageUrl = imageData.startsWith('data:') ? imageData : `data:image/jpeg;base64,${imageData}`;
  try {
    const OpenAI = require('openai');
    const client = new OpenAI({ apiKey: openaiKey });
    const res = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this food image. List each food item you see with estimated portion in grams (e.g. "150g chicken breast", "100g rice"). 
Return ONLY a JSON array of strings, one per food. Example: ["200g grilled chicken", "150g white rice", "50g broccoli"].
If you cannot identify foods, return ["unknown"].`,
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
      max_tokens: 300,
    });
    const text = res.choices[0]?.message?.content || '[]';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const arr = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    return Array.isArray(arr) ? arr : [];
  } catch (err) {
    console.error('Vision analyze error:', err.message);
    return null;
  }
}

module.exports = {
  searchFoods,
  getNutritionForQuantity,
  parseIngredient,
  parseIngredients,
  searchUSDA,
  analyzeImageWithVision,
  getFoods,
};
