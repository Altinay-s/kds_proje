const db = require('../config/db');

class SimulationModel {
    static async getChannels() {
        const [channels] = await db.query('SELECT kanal_id, kanal_adi FROM kanallar');
        return channels;
    }

    static async getAudiences() {
        const [audiences] = await db.query('SELECT kitle_id, kitle_adi FROM hedef_kitleler');
        return audiences;
    }

    static async getChannelCPC(kanalId) {
        const queryCPC = `
            SELECT 
                SUM(gp.gunluk_harcama) as total_spend, 
                SUM(gp.tiklama_sayisi) as total_clicks 
            FROM gunluk_performans gp
            JOIN kampanyalar k ON gp.kampanya_id = k.kampanya_id
            WHERE k.kanal_id = ?
        `;
        const [rowsCPC] = await db.query(queryCPC, [kanalId]);
        return rowsCPC[0];
    }

    static async getSalesMetrics(kanalId, kitleId) {
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
        let [rowsSales] = await db.query(querySales, [kanalId, kitleId, kanalId, kitleId]);
        return rowsSales[0];
    }

    static async getSalesMetricsByChannel(kanalId) {
        const querySales = `
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
        const [rowsSales] = await db.query(querySales, [kanalId, kanalId]);
        return rowsSales[0];
    }
}

module.exports = SimulationModel;
