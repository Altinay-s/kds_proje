const express = require('express');
const router = express.Router();
const simulationController = require('../controllers/simulationController');

router.get('/options', simulationController.getFormOptions);
router.post('/simulate', simulationController.simulateScenario);

module.exports = router;
