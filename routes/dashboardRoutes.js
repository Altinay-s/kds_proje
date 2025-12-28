const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/channel-roi', dashboardController.getChannelROI);
router.get('/audience-comparison', dashboardController.getAudienceComparison);
router.get('/trend', dashboardController.getTrend);
router.get('/campaign-performance', dashboardController.getCampaignPerformance);
router.get('/conversion-rate', dashboardController.getConversionRate);
router.get('/material-performance', dashboardController.getMaterialPerformance);
router.get('/loss-making', dashboardController.getLossMakingCampaigns);
router.get('/campaigns', dashboardController.getCampaignsList);
router.get('/compare', dashboardController.compareCampaigns);
router.get('/summary', dashboardController.getSummaryStats);

module.exports = router;
