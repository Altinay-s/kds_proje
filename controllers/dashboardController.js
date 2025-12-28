const db = require('../config/db');

// 1. Kanal Bazlı ROI Analizi
exports.getChannelROI = async (req, res) => {
    try {
        const query = `
            SELECT 
                k.kanal_adi, 
                SUM(s.satis_tutari) AS toplam_ciro
            FROM satislar s
            JOIN kampanyalar kam ON s.kampanya_id = kam.kampanya_id
            JOIN kanallar k ON kam.kanal_id = k.kanal_id
            GROUP BY k.kanal_adi
            ORDER BY toplam_ciro DESC
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// 2. Hedef Kitle Karşılaştırması (Tıklama Sayısı)
exports.getAudienceComparison = async (req, res) => {
    try {
        const query = `
            SELECT 
                hk.kitle_adi, 
                SUM(gp.tiklama_sayisi) AS toplam_tiklama
            FROM gunluk_performans gp
            JOIN kampanyalar kam ON gp.kampanya_id = kam.kampanya_id
            JOIN hedef_kitleler hk ON kam.kitle_id = hk.kitle_id
            GROUP BY hk.kitle_adi
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// 3. Harcama vs Ciro Trendi (Son 30 gün)
exports.getTrend = async (req, res) => {
    try {
        // İdealde son 30 günü filtrelemek gerekir ama mock dataya göre tüm veriyi çekiyoruz
        const query = `
            SELECT 
                DATE_FORMAT(tarih, '%Y-%m-%d') as tarih, 
                SUM(gunluk_harcama) as toplam_harcama, -- gunluk_performans'tan
                (
                    SELECT IFNULL(SUM(satis_tutari), 0) 
                    FROM satislar s 
                    WHERE s.satis_tarihi = gp.tarih
                ) as toplam_ciro
            FROM gunluk_performans gp
            GROUP BY tarih
            ORDER BY tarih ASC
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// 4. Kampanya Performans Tablosu
exports.getCampaignPerformance = async (req, res) => {
    try {
        const query = `
            SELECT 
                kam.kampanya_basligi, 
                k.kanal_adi,
                kam.butce,
                kam.toplam_harcama,
                (kam.butce - kam.toplam_harcama) as kalan_butce,
                kam.durum
            FROM kampanyalar kam
            JOIN kanallar k ON kam.kanal_id = k.kanal_id
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// 5. Dönüşüm Oranı (Conversion Rate)
exports.getConversionRate = async (req, res) => {
    try {
        const query = `
            SELECT 
                kam.kampanya_basligi,
                SUM(gp.tiklama_sayisi) as toplam_tiklama,
                (SELECT COUNT(*) FROM satislar s WHERE s.kampanya_id = kam.kampanya_id) as satis_adedi,
                CASE 
                    WHEN SUM(gp.tiklama_sayisi) > 0 THEN 
                        ((SELECT COUNT(*) FROM satislar s WHERE s.kampanya_id = kam.kampanya_id) / SUM(gp.tiklama_sayisi)) * 100
                    ELSE 0 
                END as donusum_orani
            FROM kampanyalar kam
            JOIN gunluk_performans gp ON kam.kampanya_id = gp.kampanya_id
            GROUP BY kam.kampanya_id, kam.kampanya_basligi
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// 6. Materyal Performansı
exports.getMaterialPerformance = async (req, res) => {
    try {
        const query = `
            SELECT 
                rm.materyal_turu, 
                COUNT(s.satis_id) as satis_sayisi
            FROM satislar s
            JOIN reklam_materyalleri rm ON s.kampanya_id = rm.kampanya_id
            GROUP BY rm.materyal_turu
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// 7. Zarar Eden Kampanyalar (ROI < 100%)
exports.getLossMakingCampaigns = async (req, res) => {
    try {
        const query = `
            SELECT 
                kam.kampanya_basligi,
                kam.toplam_harcama,
                IFNULL(SUM(s.satis_tutari), 0) as toplam_getiri,
                CASE 
                    WHEN kam.toplam_harcama > 0 THEN (IFNULL(SUM(s.satis_tutari), 0) / kam.toplam_harcama) * 100
                    ELSE 0 
                END as roi
            FROM kampanyalar kam
            LEFT JOIN satislar s ON kam.kampanya_id = s.kampanya_id
            GROUP BY kam.kampanya_id, kam.kampanya_basligi, kam.toplam_harcama
            HAVING roi < 100 AND kam.toplam_harcama > 0
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// 8. Kampanya Listesi (Dropdown için)
exports.getCampaignsList = async (req, res) => {
    try {
        const query = 'SELECT kampanya_id, kampanya_basligi FROM kampanyalar ORDER BY kampanya_basligi ASC';
        const [rows] = await db.query(query);
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
        const query = `
            SELECT 
                kam.kampanya_id,
                kam.kampanya_basligi,
                kam.toplam_harcama,
                kam.butce,
                (SELECT COUNT(*) FROM satislar s WHERE s.kampanya_id = kam.kampanya_id) as satis_adedi,
                (SELECT IFNULL(SUM(s.satis_tutari), 0) FROM satislar s WHERE s.kampanya_id = kam.kampanya_id) as toplam_ciro,
                (SELECT IFNULL(SUM(gp.tiklama_sayisi), 0) FROM gunluk_performans gp WHERE gp.kampanya_id = kam.kampanya_id) as toplam_tiklama
            FROM kampanyalar kam
            WHERE kam.kampanya_id IN (?, ?)
        `;
        const [rows] = await db.query(query, [id1, id2]);

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
        const query = `
            SELECT 
                (SELECT COUNT(*) FROM kampanyalar WHERE durum = 'Aktif') as active_campaigns,
                (SELECT IFNULL(SUM(toplam_harcama), 0) FROM kampanyalar) as total_spend,
                (SELECT IFNULL(SUM(satis_tutari), 0) FROM satislar) as total_revenue,
                (SELECT k.kanal_adi FROM kanallar k 
                 JOIN kampanyalar c ON k.kanal_id = c.kanal_id 
                 JOIN satislar s ON c.kampanya_id = s.kampanya_id 
                 GROUP BY k.kanal_id ORDER BY SUM(s.satis_tutari) DESC LIMIT 1) as top_channel
        `;
        const [rows] = await db.query(query);
        const stats = rows[0];

        // ROI Hesapla
        const roi = stats.total_spend > 0 ? ((stats.total_revenue - stats.total_spend) / stats.total_spend) * 100 : 0;

        res.json({ ...stats, roi });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
