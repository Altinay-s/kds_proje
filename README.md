# Pazarlama Kampanyası Karar Destek Sistemi (Marketing KDS)

## Proje Açıklaması
Bu proje, pazarlama yöneticilerinin farklı kanallar (Instagram, Google, TikTok, LinkedIn) ve hedef kitleler üzerindeki kampanya verilerini analiz ederek, veriye dayalı ve doğru kararlar almasını sağlayan web tabanlı bir yönetim sistemidir. Sistem, sadece satış ve tıklama rakamlarını göstermekle kalmaz; "What-If" simülasyonları ile hangi stratejinin daha kârlı olacağını tahmin eder ve ROI (Yatırım Getirisi) analizi sunar.

## Sistemin Çözdüğü Temel Sorunlar ve Özellikler
*   **Kampanya Başarı Analizi (ROI Skoru):** Sistem; bütçe, harcama, tıklama ve satış verilerini birleştirerek her kampanyanın ROI (Yatırım Getirisi) oranını hesaplar. Hangi kampanyanın kâr, hangisinin zarar ettiğini (ROI < %100) otomatik tespit eder.
*   **Senaryo Simülasyonu (What-If Analizi):** Yöneticiye "Geleceği görme" imkanı sunar. Örneğin; "Instagram'da Öğrenci kitlesine 50.000 TL bütçe ayırırsam ne kazanırım?" sorusunun cevabını, geçmiş verilerle eğitilmiş algoritma ile simüle eder ve iki farklı senaryoyu kıyaslayıp öneride bulunur.
*   **Kanal ve Kitle Performansı:** Hangi sosyal medya kanalının (Kanal Bazlı ROI) veya hangi hedef kitlenin (Kitle Karşılaştırması) daha verimli olduğunu grafiksel verilerle sunar.
*   **Otomatik Dönüşüm Takibi:** Tıklamaların ne kadarının satışa döndüğünü (Conversion Rate) analiz eder.

## 🛠 Projenin Teknik Yapısı
Proje, sürdürülebilir ve güvenli yazılım standartlarına göre geliştirilmiştir:

*   **Düzenli Kod Yapısı:** Kodlar, geliştirilmesi ve yönetilmesi kolay olan **MVC (Model-View-Controller)** yapısında klasörlenmiştir.
*   **Veri Güvenliği:** Veritabanı şifreleri kodun içinde açıkça yazmaz, özel güvenlik dosyalarında (`.env`) saklanır.
*   **Veri Yönetimi:** Sistem üzerinden kampanya verileri ve performans metrikleri yönetilebilir.

## Senaryo Tanımı ve İş Kuralları
Bu proje, verilerin analiz edildiği ve yöneticinin yönlendirildiği bir yapıya sahiptir. Sistemde tanımlı temel analiz senaryoları:

### 1. Senaryo: Gelecek Tahmini ve Karar Karşılaştırması (Simulation)
Pazarlama bütçesinin yanlış kanallarda harcanmasını önlemek için simülasyon modülü geliştirilmiştir.

*   **Olay:** Yönetici iki farklı kampanya senaryosu (Örn: Senaryo A: TikTok-Genç, Senaryo B: LinkedIn-Kurumsal) ve bütçeleri girer.
*   **İş Kuralı:** Sistem, geçmiş `gunluk_performans` ve `satislar` verilerinden ilgili kanalın Ortalama Tıklama Maliyetini (CPC) ve Dönüşüm Oranını (CVR) çeker.
*   **Sistem Aksiyonu:**
    1.  Her iki senaryo için Tahmini Satış ve Tahmini Ciro hesaplanır.
    2.  Sistem, **ROI (Yatırım Getirisi)** en yüksek olan senaryoyu "Önerilen Strateji" olarak işaretler ve kullanıcıya "Senaryo A, Senaryo B'den %X daha kârlı" şeklinde rapor sunar.

### 2. Senaryo: Zarar Eden Kampanya Tespiti (Loss Aversion)
Bütçenin verimsiz kampanyalarda erimesini önlemek için finansal analiz yapılır.

*   **Olay:** Kampanya performans verileri çekildiğinde.
*   **İş Kuralı:** "Bir kampanyanın ROI oranı %100'ün altındaysa (Getiri < Harcama), bu kampanya zarar etmektedir."
*   **Sistem Aksiyonu:**
    1.  Sistem tüm aktif kampanyaları tarar.
    2.  Zarar eden kampanyalar `getLossMakingCampaigns` servisi ile ayrı bir listede, "Zarar" uyarısı ile yöneticinin dikkatine sunulur.

## Kurulum Adımları
Projenin yerel makinede çalıştırılması için aşağıdaki adımları takip ediniz:

1.  **Projeyi Bilgisayarınıza İndirin:**
    Projeyi GitHub üzerinden klonlayın veya ZIP olarak indirip bir klasöre çıkarın.

2.  **Gerekli Paketleri Yükleyin:**
    Proje dizininde terminali açın ve bağımlılıkları yüklemek için şu komutu çalıştırın:
    ```bash
    npm install
    ```

3.  **Veritabanı Bağlantı Ayarlarını Yapın (.env):**
    *   Ana dizinde bulunan `.env.example` dosyasının adını `.env` olarak değiştirin.
    *   Bu dosyanın içine kendi MySQL bağlantı bilgilerinizi (Kullanıcı adı, Şifre vb.) girin.

4.  **Veritabanını İçe Aktarın:**
    *   MySQL arayüzünüzü (phpMyAdmin veya Workbench) açın.
    *   `database.sql` dosyasını "Import" (İçe Aktar) seçeneği ile sisteme yükleyin. (Tablolar: kanallar, kampanyalar, satislar, gunluk_performans vb.)

5.  **Projeyi Başlatın:**
    Aşağıdaki komut ile sunucusu ayağa kaldırın:
    ```bash
    node app.js
    ```
    Tarayıcınızdan `http://localhost:3000` adresine giderek uygulamayı görüntüleyebilirsiniz.

## API Endpoint Listesi
Proje, istemci (frontend) ve sunucu (backend) arasındaki iletişimi aşağıdaki RESTful API uç noktaları üzerinden sağlamaktadır.

### 1. Dashboard & Analiz Servisleri
Yönetici paneli için gerekli özet ve detay verileri sağlar.

| Metot | Endpoint | Açıklama |
| --- | --- | --- |
| GET | `/api/summary-stats` | Toplam harcama, ciro, şampiyon kanal ve genel ROI özetini getirir. |
| GET | `/api/channel-roi` | Kanalların (Instagram, Google vb.) ciro performansını sıralar. |
| GET | `/api/audience-comparison` | Hedef kitlelerin tıklama yoğunluğunu karşılaştırır. |
| GET | `/api/trend` | Son 30 günün Harcama vs Ciro trend grafiği verisini sunar. |
| GET | `/api/campaign-performance` | Kampanyaların bütçe, harcama ve kalan bütçe durumlarını listeler. |
| GET | `/api/conversion-rate` | Kampanyaların dönüşüm oranlarını (Satış / Tıklama) getirir. |
| GET | `/api/material-performance` | Video vs Görsel materyallerin performansını kıyaslar. |
| GET | `/api/loss-making` | Zarar eden (ROI < %100) kampanyaları listeler. |

### 2. Simülasyon Servisleri
Karar destek mekanizması için kullanılan servisler.

| Metot | Endpoint | Açıklama |
| --- | --- | --- |
| GET | `/api/simulation/form-options` | Simülasyon formu için kanal ve kitle seçeneklerini getirir. |
| POST | `/api/simulation/calculate` | İki senaryo verisini alır, tahminleri hesaplar ve öneriyi (Recommendation) döner. |

### 3. Genel Kampanya Servisleri
| Metot | Endpoint | Açıklama |
| --- | --- | --- |
| GET | `/api/campaigns-list` | Dropdownlar için basit kampanya listesi döner. |
| GET | `/api/compare` | Seçilen iki kampanyanın detaylı metriklerini (ROI, CVR) karşılaştırır. |
