-- Veritabanı Oluşturma
CREATE DATABASE IF NOT EXISTS kds_proje;
USE kds_proje;

-- Tabloları Temizle (Sıfırdan kurulum için)
DROP TABLE IF EXISTS satislar;
DROP TABLE IF EXISTS gunluk_performans;
DROP TABLE IF EXISTS reklam_materyalleri;
DROP TABLE IF EXISTS kampanyalar;
DROP TABLE IF EXISTS hedef_kitleler;
DROP TABLE IF EXISTS kanallar;

-- 1. Kanallar Tablosu
CREATE TABLE kanallar (
    kanal_id INT AUTO_INCREMENT PRIMARY KEY,
    kanal_adi VARCHAR(100) NOT NULL,
    platform_ucreti DECIMAL(10, 2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- 2. Hedef Kitleler Tablosu
CREATE TABLE hedef_kitleler (
    kitle_id INT AUTO_INCREMENT PRIMARY KEY,
    kitle_adi VARCHAR(100) NOT NULL,
    ilgi_alani VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- 3. Kampanyalar Tablosu
CREATE TABLE kampanyalar (
    kampanya_id INT AUTO_INCREMENT PRIMARY KEY,
    kampanya_basligi VARCHAR(255) NOT NULL,
    kanal_id INT,
    kitle_id INT,
    baslangic_tarihi DATE,
    butce DECIMAL(15, 2),
    toplam_harcama DECIMAL(15, 2) DEFAULT 0.00,
    durum ENUM('Aktif', 'Pasif') DEFAULT 'Aktif',
    FOREIGN KEY (kanal_id) REFERENCES kanallar(kanal_id),
    FOREIGN KEY (kitle_id) REFERENCES hedef_kitleler(kitle_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- 4. Reklam Materyalleri Tablosu
CREATE TABLE reklam_materyalleri (
    materyal_id INT AUTO_INCREMENT PRIMARY KEY,
    kampanya_id INT,
    materyal_turu ENUM('Video', 'Görsel') NOT NULL,
    boyut VARCHAR(50),
    FOREIGN KEY (kampanya_id) REFERENCES kampanyalar(kampanya_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- 5. Günlük Performans Tablosu
CREATE TABLE gunluk_performans (
    performans_id INT AUTO_INCREMENT PRIMARY KEY,
    kampanya_id INT,
    tarih DATE,
    gunluk_harcama DECIMAL(10, 2),
    tiklama_sayisi INT,
    goruntulenme INT,
    FOREIGN KEY (kampanya_id) REFERENCES kampanyalar(kampanya_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- 6. Satışlar Tablosu
CREATE TABLE satislar (
    satis_id INT AUTO_INCREMENT PRIMARY KEY,
    kampanya_id INT,
    urun_adi VARCHAR(255),
    satis_tutari DECIMAL(10, 2),
    satis_tarihi DATE,
    FOREIGN KEY (kampanya_id) REFERENCES kampanyalar(kampanya_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- Trigger'lar
DELIMITER //
CREATE TRIGGER harcama_guncelle_insert
AFTER INSERT ON gunluk_performans
FOR EACH ROW
BEGIN
    UPDATE kampanyalar 
    SET toplam_harcama = (SELECT SUM(gunluk_harcama) FROM gunluk_performans WHERE kampanya_id = NEW.kampanya_id)
    WHERE kampanya_id = NEW.kampanya_id;
END;
//
DELIMITER ;

DELIMITER //
CREATE TRIGGER harcama_guncelle_update
AFTER UPDATE ON gunluk_performans
FOR EACH ROW
BEGIN
    UPDATE kampanyalar 
    SET toplam_harcama = (SELECT SUM(gunluk_harcama) FROM gunluk_performans WHERE kampanya_id = NEW.kampanya_id)
    WHERE kampanya_id = NEW.kampanya_id;
END;
//
DELIMITER ;

-- ==========================================
-- GERÇEKÇİ VERİLER (REALISTIC DATA)
-- ==========================================

-- Kanallar
INSERT INTO kanallar (kanal_adi, platform_ucreti) VALUES 
('Instagram', 2000.00),
('Google Ads', 5000.00),
('TikTok', 1500.00),
('LinkedIn', 3000.00);

-- Hedef Kitleler
INSERT INTO hedef_kitleler (kitle_adi, ilgi_alani) VALUES 
('18-25 Yaş Genç/Öğrenci', 'Oyun, Moda, Teknoloji'),
('25-35 Yaş Beyaz Yaka', 'Finans, Kariyer, Seyahat'),
('35-50 Yaş Ebeveyn', 'Ev/Yaşam, Çocuk, Gıda'),
('Lüks Tüketim Kitlesi', 'Gayrimenkul, Otomotiv, Saat');

-- Kampanyalar
-- ID 1: Instagram - Genç (Yüksek Performans)
INSERT INTO kampanyalar (kampanya_basligi, kanal_id, kitle_id, baslangic_tarihi, butce, durum) VALUES 
('Yaz Sonu İndirimi (Genç)', 1, 1, '2023-08-01', 50000.00, 'Pasif');

-- ID 2: Google - Beyaz Yaka (Orta Performans)
INSERT INTO kampanyalar (kampanya_basligi, kanal_id, kitle_id, baslangic_tarihi, butce, durum) VALUES 
('Kurumsal Yazılım Lansmanı', 2, 2, '2023-09-01', 100000.00, 'Aktif');

-- ID 3: TikTok - Genç (Viral)
INSERT INTO kampanyalar (kampanya_basligi, kanal_id, kitle_id, baslangic_tarihi, butce, durum) VALUES 
('Viral Challenge Video', 3, 1, '2023-11-01', 25000.00, 'Aktif');

-- ID 4: LinkedIn - Lüks/Kurumsal (Düşük Hacim, Yüksek Tutar)
INSERT INTO kampanyalar (kampanya_basligi, kanal_id, kitle_id, baslangic_tarihi, butce, durum) VALUES 
('Premium Üyelik Kampanyası', 4, 4, '2023-10-15', 60000.00, 'Aktif');

-- ID 5: Instagram - Ebeveyn (Düşük ROI - Zarar Eden Örnek)
INSERT INTO kampanyalar (kampanya_basligi, kanal_id, kitle_id, baslangic_tarihi, butce, durum) VALUES 
('Okula Dönüş Anneler', 1, 3, '2023-09-01', 40000.00, 'Pasif');


-- Materyaller
INSERT INTO reklam_materyalleri (kampanya_id, materyal_turu, boyut) VALUES 
(1, 'Video', '1080x1920'), (1, 'Görsel', '1080x1080'),
(2, 'Görsel', '300x250'),
(3, 'Video', '1080x1920'),
(4, 'Görsel', '1200x628'),
(5, 'Video', '1080x1350');

-- PERFORMANS VE SATIŞ VERİLERİ (Toplu Ekleme)

-- KAMPANYA 1: Instagram (Genç) - Çok Başarılı
-- Günlük Harcama: ~1,500 TL | Günlük Ciro: ~5,000 TL (ROI: %230)
INSERT INTO gunluk_performans (kampanya_id, tarih, gunluk_harcama, tiklama_sayisi, goruntulenme) VALUES
(1, '2023-08-01', 1450, 800, 25000), (1, '2023-08-02', 1500, 850, 26000), (1, '2023-08-03', 1300, 750, 24000),
(1, '2023-08-04', 1600, 900, 28000), (1, '2023-08-05', 1550, 880, 27500), (1, '2023-08-06', 1700, 950, 30000);

INSERT INTO satislar (kampanya_id, urun_adi, satis_tutari, satis_tarihi) VALUES
(1, 'Sneakers', 1200, '2023-08-01'), (1, 'T-Shirt', 350, '2023-08-01'), (1, 'Çanta', 600, '2023-08-01'),
(1, 'Sneakers', 1200, '2023-08-02'), (1, 'Şapka', 250, '2023-08-02'), (1, 'T-Shirt', 400, '2023-08-02'),
(1, 'Mont', 2500, '2023-08-03'), (1, 'Ayakkabı', 1800, '2023-08-03'),
(1, 'Çanta', 700, '2023-08-04'), (1, 'Gözlük', 500, '2023-08-04'), (1, 'Sneakers', 1300, '2023-08-04'),
(1, 'Saat', 3000, '2023-08-05'), (1, 'T-Shirt', 350, '2023-08-05'),
(1, 'Mont', 2800, '2023-08-06'), (1, 'Bot', 2200, '2023-08-06'); 
-- Kampanya 1 Toplam Ciro çok yüksek olsun diye ekstra
INSERT INTO satislar (kampanya_id, urun_adi, satis_tutari, satis_tarihi) VALUES
(1, 'Toplu Sipariş', 5000, '2023-08-04'), (1, 'Koleksiyon', 7500, '2023-08-05');


-- KAMPANYA 2: Google (Beyaz Yaka) - Stabil
-- Günlük Harcama: ~3,000 TL | Günlük Ciro: ~8,000 TL (ROI: %160)
INSERT INTO gunluk_performans (kampanya_id, tarih, gunluk_harcama, tiklama_sayisi, goruntulenme) VALUES
(2, '2023-09-01', 2800, 400, 15000), (2, '2023-09-02', 2900, 420, 15500), (2, '2023-09-03', 3100, 450, 16000),
(2, '2023-09-04', 3000, 430, 15800), (2, '2023-09-05', 3200, 460, 16500);

INSERT INTO satislar (kampanya_id, urun_adi, satis_tutari, satis_tarihi) VALUES
(2, 'Lisans Paketi Yıllık', 5000, '2023-09-01'), (2, 'Pro Üyelik', 2500, '2023-09-01'),
(2, 'Lisans Paketi Aylık', 800, '2023-09-02'), (2, 'Kurumsal Paket', 12000, '2023-09-02'),
(2, 'Pro Üyelik', 2500, '2023-09-03'), (2, 'Eğitim Seti', 1500, '2023-09-03'),
(2, 'Lisans Paketi Yıllık', 5000, '2023-09-04'), (2, 'Danışmanlık', 4000, '2023-09-05');


-- KAMPANYA 3: TikTok (Viral) - Düşük Maliyet Çok Tık
-- Günlük Harcama: ~800 TL | Günlük Ciro: ~3,000 TL (ROI: %275) - Yüksek marj
INSERT INTO gunluk_performans (kampanya_id, tarih, gunluk_harcama, tiklama_sayisi, goruntulenme) VALUES
(3, '2023-11-01', 750, 2500, 80000), (3, '2023-11-02', 800, 2800, 95000), (3, '2023-11-03', 850, 3000, 100000),
(3, '2023-11-04', 700, 2200, 75000);

INSERT INTO satislar (kampanya_id, urun_adi, satis_tutari, satis_tarihi) VALUES
(3, 'Telefon Kılıfı', 150, '2023-11-01'), (3, 'Kılıf', 150, '2023-11-01'), (3, 'Anahtarlık', 50, '2023-11-01'),
(3, 'Powerbank', 800, '2023-11-02'), (3, 'Kulaklık', 900, '2023-11-02'), (3, 'Kılıf', 150, '2023-11-02'),
(3, 'Akıllı Bileklik', 1200, '2023-11-03'), (3, 'Hoparlör', 1500, '2023-11-03'), (3, 'Kılıf', 150, '2023-11-04');
-- TikTok Sürümden kazanıyor, çok sayıda ucuz satış ekleyelim
INSERT INTO satislar (kampanya_id, urun_adi, satis_tutari, satis_tarihi) VALUES 
(3, 'Promosyon Paketi', 2000, '2023-11-01'), (3, 'Mega Set', 3000, '2023-11-03');


-- KAMPANYA 5: Zarar Eden Örnek (Instagram - Ebeveyn)
-- Günlük Harcama: ~1,500 TL | Günlük Ciro: ~800 TL (ROI: -%45)
INSERT INTO gunluk_performans (kampanya_id, tarih, gunluk_harcama, tiklama_sayisi, goruntulenme) VALUES
(5, '2023-09-01', 1500, 300, 10000), (5, '2023-09-02', 1550, 320, 11000), (5, '2023-09-03', 1450, 280, 9500);

INSERT INTO satislar (kampanya_id, urun_adi, satis_tutari, satis_tarihi) VALUES
(5, 'Beslenme Çantası', 400, '2023-09-01'), (5, 'Suluk', 250, '2023-09-01'),
(5, 'Kalemlik', 150, '2023-09-02'),
(5, 'Defter Seti', 300, '2023-09-03');
