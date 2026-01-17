const SimulationModel = require('../models/SimulationModel');

// 1. Form Seçeneklerini Getir (Kanallar ve Kitleler)
exports.getFormOptions = async (req, res) => {
    try {
        const channels = await SimulationModel.getChannels();
        const audiences = await SimulationModel.getAudiences();

        res.json({ channels, audiences });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// 2. Simülasyon Hesapla
exports.simulateScenario = async (req, res) => {
    const { scenarioA, scenarioB } = req.body;

    if (!scenarioA || !scenarioB) {
        return res.status(400).send('Eksik senaryo verisi');
    }

    try {
        // Helper function to calculate stats for a single scenario
        const calculateStats = async (scenario) => {
            const { kanal_id, kitle_id, butce } = scenario;

            // Kanalın CPC'si
            const rowCPC = await SimulationModel.getChannelCPC(kanal_id);
            let avgCPC = 0;
            if (rowCPC && rowCPC.total_clicks > 0) {
                avgCPC = rowCPC.total_spend / rowCPC.total_clicks;
            } else {
                avgCPC = 5; // Default fallback cost
            }

            // Kitle ve Kanalın Ortak Dönüşüm ve Sepet Verisi
            let rowSales = await SimulationModel.getSalesMetrics(kanal_id, kitle_id);

            // Eğer spesifik eşleşme yoksa (NULL ise veya click yoksa), sadece kanala göre bak
            if (!rowSales || !rowSales.total_clicks_context) {
                rowSales = await SimulationModel.getSalesMetricsByChannel(kanal_id);
            }

            const total_sales = rowSales ? rowSales.total_sales : 0;
            const total_revenue = rowSales ? rowSales.total_revenue : 0;
            const total_clicks = (rowSales && rowSales.total_clicks_context) ? rowSales.total_clicks_context : 1;

            let cvr = total_clicks > 0 ? total_sales / total_clicks : 0.02; // Default %2
            let aov = total_sales > 0 ? total_revenue / total_sales : 100; // Default 100 TL

            // Eğer veri çok azsa mantıklı sınırlar koy
            if (cvr === 0) cvr = 0.015;
            if (aov === 0) aov = 150;

            // Tahminler
            const estimatedClicks = butce / avgCPC;
            const estimatedSales = estimatedClicks * cvr;
            const estimatedRevenue = estimatedSales * aov;
            const estimatedROI = ((estimatedRevenue - butce) / butce) * 100;

            return {
                avgCPC,
                cvr,
                aov,
                estimatedClicks: Math.round(estimatedClicks),
                estimatedSales: Math.round(estimatedSales),
                estimatedRevenue: estimatedRevenue.toFixed(2),
                estimatedROI: estimatedROI.toFixed(2)
            };
        };

        const resultA = await calculateStats(scenarioA);
        const resultB = await calculateStats(scenarioB);

        // Kazananı Belirle
        let recommendation = "";
        if (parseFloat(resultA.estimatedROI) > parseFloat(resultB.estimatedROI)) {
            const diff = parseFloat(resultA.estimatedROI) - parseFloat(resultB.estimatedROI);
            recommendation = `Sistem <strong>Senaryo A</strong>'yı öneriyor. Çünkü tahmini ROI oranı Senaryo B'den <strong>%${diff.toFixed(1)}</strong> daha yüksek.`;
        } else {
            const diff = parseFloat(resultB.estimatedROI) - parseFloat(resultA.estimatedROI);
            recommendation = `Sistem <strong>Senaryo B</strong>'yi öneriyor. Çünkü tahmini ROI oranı Senaryo A'dan <strong>%${diff.toFixed(1)}</strong> daha yüksek.`;
        }

        res.json({
            scenarioA: resultA,
            scenarioB: resultB,
            recommendation
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

