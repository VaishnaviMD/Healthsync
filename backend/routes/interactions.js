const router = require('express').Router();

const interactionData = {
  "iron": { avoid: ["tea", "coffee", "dairy products", "calcium-rich foods"], recommended: ["vitamin C foods", "orange juice", "strawberries", "bell peppers"] },
  "warfarin": { avoid: ["vitamin K foods", "leafy greens", "kale", "spinach", "broccoli", "alcohol"], recommended: ["consistent diet", "consult your doctor for specific guidance"] },
  "metformin": { avoid: ["alcohol", "high-sugar foods", "processed carbohydrates"], recommended: ["fiber-rich foods", "vegetables", "whole grains", "lean proteins"] },
  "levothyroxine": { avoid: ["calcium supplements", "antacids", "soy products", "high-fiber foods near dosing time"], recommended: ["take on empty stomach", "wait 30-60 minutes before eating"] },
  "statins": { avoid: ["grapefruit", "grapefruit juice", "large amounts of alcohol"], recommended: ["heart-healthy diet", "oats", "fatty fish", "nuts"] },
  "ssri": { avoid: ["alcohol", "tyramine-rich foods", "aged cheese", "cured meats"], recommended: ["balanced diet", "omega-3 foods", "regular meal timing"] },
  "calcium": { avoid: ["iron supplements at same time", "high-oxalate foods", "spinach with calcium"], recommended: ["vitamin D foods", "sunlight exposure", "dairy products"] },
  "vitamin d": { avoid: ["excessive calcium supplements without guidance"], recommended: ["fatty fish", "fortified milk", "eggs", "sunlight exposure"] },
  "aspirin": { avoid: ["alcohol", "blood thinning foods in excess"], recommended: ["stay hydrated", "take with food to reduce stomach upset"] },
  "antibiotics": { avoid: ["dairy products (with some types)", "alcohol", "calcium-fortified foods"], recommended: ["probiotics", "yogurt (after course)", "stay hydrated"] }
};

router.post('/check', (req, res) => {
  const { medicine } = req.body;
  if (!medicine) return res.status(400).json({ message: 'Medicine name required' });
  const key = medicine.toLowerCase().trim();
  const found = Object.keys(interactionData).find(k => key.includes(k) || k.includes(key));
  if (found) {
    res.json({ medicine, ...interactionData[found], found: true });
  } else {
    res.json({ medicine, found: false, message: "No specific interaction data found. Always consult your pharmacist or doctor about food-drug interactions." });
  }
});

module.exports = router;
