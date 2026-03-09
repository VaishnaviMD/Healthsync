const router = require("express").Router();
const { chat } = require("../controllers/chatController");
const { protect } = require("../middleware/auth");

router.post("/", protect, chat);

module.exports = router;
