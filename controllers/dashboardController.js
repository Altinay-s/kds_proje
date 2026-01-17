const DashboardModel = require('../models/DashboardModel');

// 1. Kanal Bazlı ROI Analizi
exports.getChannelROI = async (req, res) => {
    try {
        const rows = await DashboardModel.getChannelROI();
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// 2. Hedef Kitle Karşılaştırması (Tıklama Sayısı)
exports.getAudienceComparison = async (req, res) => {
    try {
        const rows = await DashboardModel.getAudienceComparison();
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// 3. Harcama vs Ciro Trendi (Son 30 gün)
exports.getTrend = async (req, res) => {
    try {
        const rows = await DashboardModel.getTrend();
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// 4. Kampanya Performans Tablosu
exports.getCampaignPerformance = async (req, res) => {
    try {
        const rows = await DashboardModel.getCampaignPerformance();
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// 5. Dönüşüm Oranı (Conversion Rate)
exports.getConversionRate = async (req, res) => {
    try {
        const rows = await DashboardModel.getConversionRate();
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// 6. Materyal Performansı
exports.getMaterialPerformance = async (req, res) => {
    try {
        const rows = await DashboardModel.getMaterialPerformance();
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// 7. Zarar Eden Kampanyalar (ROI < 100%)
exports.getLossMakingCampaigns = async (req, res) => {
    try {
        const rows = await DashboardModel.getLossMakingCampaigns();
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// 8. Kampanya Listesi (Dropdown için)
exports.getCampaignsList = async (req, res) => {
    try {
        const rows = await DashboardModel.getCampaignsList();
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// 9. Kampanya Karşılaştırma
exports.compareCampaigns = async (req, res) => {
    const { id1, id2 } = req.query;
    if (!id1 || !id2) return res.status(400).send('Missing campaign IDs');

    try {
        const rows = await DashboardModel.getCampaignByIds(id1, id2);

        const results = rows.map(camp => {
            const roi = camp.toplam_harcama > 0 ? (camp.toplam_ciro / camp.toplam_harcama) * 100 : 0;
            const conversionRate = camp.toplam_tiklama > 0 ? (camp.satis_adedi / camp.toplam_tiklama) * 100 : 0;
            return { ...camp, roi, conversionRate };
        });

        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// 10. Özet İstatistikler (KPI Kartları için)
exports.getSummaryStats = async (req, res) => {
    try {
        const stats = await DashboardModel.getSummaryStats();
        // ROI Hesapla
        const roi = stats.total_spend > 0 ? ((stats.total_revenue - stats.total_spend) / stats.total_spend) * 100 : 0;

        res.json({ ...stats, roi });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

