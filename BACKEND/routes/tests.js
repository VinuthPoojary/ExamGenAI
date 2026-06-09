const express = require('express');
const { protect } = require('../middleware/auth');
const {
  generateTest,
  getTests,
  getTest,
} = require('../controllers/testController');

const router = express.Router();

// Protect all test routes
router.use(protect);

router.post('/generate', generateTest);
router.get('/',          getTests);
router.get('/:id',       getTest);

module.exports = router;
