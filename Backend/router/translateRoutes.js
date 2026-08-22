const express = require("express");
const router = express.Router();
const {
  detectLanguage,
  translateText,
  getSupportedLanguages,
} = require("../controller/translateController");

router.get("/detect-language", detectLanguage);

router.post("/translate", translateText);

router.get("/languages", getSupportedLanguages);

module.exports = router;