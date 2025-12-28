const db = require('../config/db');

// 1. Form Seçeneklerini Getir (Kanallar ve Kitleler)
exports.getFormOptions = async (req, res) => {
    try {
        const [channels] = await db.query('SELECT kanal_id, kanal_adi FROM kanallar');
        const [audiences] = await db.query('SELECT kitle_id, kitle_adi FROM hedef_kitleler');

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
        const results = {};

        // Helper function to calculate stats for a single scenario
        const calculateStats = async (scenario) => {
            const { kanal_id, kitle_id, butce } = scenario;

            // Verilen Kanal ve Kitleye ait geçmiş verileri çek
            // Not: Hem kanal hem kitle aynı anda eşleşen kampanya bulamayabiliriz, 
            // bu yüzden ayrı ayrı ağırlıklı da bakılabilir ama basitlik adına 
            // o kanaldaki ve o kitledeki ortalamaları ayrı alıp harmanlayacağız.
            // veya direkt sadece kanala göre CPC, kitleye göre dönüşüm vs. varsayımı yapabiliriz.
            // Burada kullanıcı isteğine göre: "Seçilen Kanal ve Kitle eşleşmesine ait geçmiş" denmiş.
            // Ancak veri az ise specific match bulamayabiliriz. 
            // Mock data'da her kombinasyon yok. 
            // Çözüm: Genelleştirilmiş bir yaklaşım:
            // 1. Kanalın ortalama CPC'si
            // 2. Kitlenin (veya Genel) Dönüşüm Oranı ve Sepet Tutarı

            // Kanalın CPC'si
            const queryCPC = `
                SELECT 
                    SUM(gp.gunluk_harcama) as total_spend, 
                    SUM(gp.tiklama_sayisi) as total_clicks 
                FROM gunluk_performans gp
                JOIN kampanyalar k ON gp.kampanya_id = k.kampanya_id
                WHERE k.kanal_id = ?
            `;
            const [rowsCPC] = await db.query(queryCPC, [kanal_id]);
            let avgCPC = 0;
            if (rowsCPC[0].total_clicks > 0) {
                avgCPC = rowsCPC[0].total_spend / rowsCPC[0].total_clicks;
            } else {
                avgCPC = 5; // Default fallback cost
            }

            // Kitle ve Kanalın Ortak Dönüşüm ve Sepet Verisi
            // Eğer veri yoksa sadece Kanal bazlı bak
            let querySales = `
                SELECT 
                    COUNT(s.satis_id) as total_sales,
                    SUM(s.satis_tutari) as total_revenue,
                    (SELECT SUM(gp.tiklama_sayisi) 
                     FROM gunluk_performans gp 
                     JOIN kampanyalar k ON gp.kampanya_id = k.kampanya_id 
                     WHERE k.kanal_id = ? AND k.kitle_id = ?) as total_clicks_context
                FROM satislar s
                JOIN kampanyalar k ON s.kampanya_id = k.kampanya_id
                WHERE k.kanal_id = ? AND k.kitle_id = ?
            `;
            let [rowsSales] = await db.query(querySales, [kanal_id, kitle_id, kanal_id, kitle_id]);

            // Eğer spesifik eşleşme yoksa (NULL ise), sadece kanala göre bak
            if (!rowsSales[0].total_clicks_context) {
                querySales = `
                    SELECT 
                        COUNT(s.satis_id) as total_sales,
                        SUM(s.satis_tutari) as total_revenue,
                        (SELECT SUM(gp.tiklama_sayisi) 
                         FROM gunluk_performans gp 
                         JOIN kampanyalar k ON gp.kampanya_id = k.kampanya_id 
                         WHERE k.kanal_id = ?) as total_clicks_context
                    FROM satislar s
                    JOIN kampanyalar k ON s.kampanya_id = k.kampanya_id
                    WHERE k.kanal_id = ?
                `;
                [rowsSales] = await db.query(querySales, [kanal_id, kanal_id]);
            }

            const total_sales = rowsSales[0].total_sales || 0;
            const total_revenue = rowsSales[0].total_revenue || 0;
            const total_clicks = rowsSales[0].total_clicks_context || 1; // avoid div by zero

            let cvr = total_clicks > 0 ? total_sales / total_clicks : 0.02; // Default %2
            let aov = total_sales > 0 ? total_revenue / total_sales : 100; // Default 100 TL

            // Eğer veri çok azsa mantıklı sınırlar koy (Mock data sorunu olmaması için)
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
