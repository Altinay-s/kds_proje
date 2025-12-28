document.addEventListener('DOMContentLoaded', () => {
    // Tüm grafikleri yükle
    loadSummaryStats();
    loadChannelROI();
    loadCampaignOptions();
    loadSimulationOptions();
    loadAudienceComparison();
    loadTrend();
    loadCampaignPerformance();
    loadConversionRate();
    loadMaterialPerformance();
    checkLossMakingCampaigns();
});

// Ortak Chart Renkleri
const colors = [
    'rgba(255, 99, 132, 0.7)',
    'rgba(54, 162, 235, 0.7)',
    'rgba(255, 206, 86, 0.7)',
    'rgba(75, 192, 192, 0.7)',
    'rgba(153, 102, 255, 0.7)',
    'rgba(255, 159, 64, 0.7)'
];

// 1. Kanal Bazlı ROI Analizi (Bar Chart)
async function loadChannelROI() {
    try {
        const response = await fetch('/api/channel-roi');
        const data = await response.json();

        const ctx = document.getElementById('roiChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(item => item.kanal_adi),
                datasets: [{
                    label: 'Toplam Ciro (TL)',
                    data: data.map(item => item.toplam_ciro),
                    backgroundColor: colors,
                    borderColor: colors.map(c => c.replace('0.7', '1')),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    } catch (err) { console.error('Error loading ROI chart:', err); }
}

// 2. Hedef Kitle Karşılaştırması (Polar Area)
async function loadAudienceComparison() {
    try {
        const response = await fetch('/api/audience-comparison');
        const data = await response.json();

        const ctx = document.getElementById('audienceChart').getContext('2d');
        new Chart(ctx, {
            type: 'polarArea',
            data: {
                labels: data.map(item => item.kitle_adi),
                datasets: [{
                    label: 'Tıklama Sayısı',
                    data: data.map(item => item.toplam_tiklama),
                    backgroundColor: colors
                }]
            },
            options: { responsive: true }
        });
    } catch (err) { console.error('Error loading Audience chart:', err); }
}

// 3. Harcama vs Ciro Trendi (Line Chart - Çift Eksenli)
async function loadTrend() {
    try {
        const response = await fetch('/api/trend');
        const data = await response.json();

        const ctx = document.getElementById('trendChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(item => new Date(item.tarih).toLocaleDateString('tr-TR')),
                datasets: [
                    {
                        label: 'Günlük Harcama (TL)',
                        data: data.map(item => item.toplam_harcama),
                        borderColor: 'rgba(255, 99, 132, 1)',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        yAxisID: 'y',
                    },
                    {
                        label: 'Günlük Ciro (TL)',
                        data: data.map(item => item.toplam_ciro),
                        borderColor: 'rgba(54, 162, 235, 1)',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        yAxisID: 'y1',
                    }
                ]
            },
            options: {
                responsive: true,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: { display: true, text: 'Harcama' }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: { display: true, text: 'Ciro' },
                        grid: { drawOnChartArea: false }
                    }
                }
            }
        });
    } catch (err) { console.error('Error loading Trend chart:', err); }
}

// 4. Kampanya Performans Tablosu
async function loadCampaignPerformance() {
    try {
        const response = await fetch('/api/campaign-performance');
        const data = await response.json();
        const tbody = document.getElementById('campaignTableBody');
        tbody.innerHTML = '';

        data.forEach(item => {
            const row = `
                <tr>
                    <td>${item.kampanya_basligi}</td>
                    <td><span class="badge bg-secondary">${item.kanal_adi}</span></td>
                    <td>${formatCurrency(item.butce)}</td>
                    <td>${formatCurrency(item.toplam_harcama)}</td>
                    <td class="${item.kalan_butce < 0 ? 'text-danger fw-bold' : 'text-success'}">${formatCurrency(item.kalan_butce)}</td>
                    <td><span class="badge ${item.durum === 'Aktif' ? 'bg-success' : 'bg-secondary'}">${item.durum}</span></td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    } catch (err) { console.error('Error loading Campaign table:', err); }
}

// 5. Dönüşüm Oranı (Bar Chart)
async function loadConversionRate() {
    try {
        const response = await fetch('/api/conversion-rate');
        const data = await response.json();

        const ctx = document.getElementById('conversionChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(item => item.kampanya_basligi),
                datasets: [{
                    label: 'Dönüşüm Oranı (%)',
                    data: data.map(item => item.donusum_orani),
                    backgroundColor: 'rgba(75, 192, 192, 0.7)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                scales: { x: { beginAtZero: true } }
            }
        });
    } catch (err) { console.error('Error loading Conversion chart:', err); }
}

// 6. Materyal Performansı (Pie Chart)
async function loadMaterialPerformance() {
    try {
        const response = await fetch('/api/material-performance');
        const data = await response.json();

        const ctx = document.getElementById('materialChart').getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: data.map(item => item.materyal_turu),
                datasets: [{
                    data: data.map(item => item.satis_sayisi),
                    backgroundColor: ['rgba(54, 162, 235, 0.7)', 'rgba(255, 99, 132, 0.7)']
                }]
            },
            options: { responsive: true }
        });
    } catch (err) { console.error('Error loading Material chart:', err); }
}

// 7. Zarar Edenleri Durdurma Önerisi
async function checkLossMakingCampaigns() {
    try {
        const response = await fetch('/api/loss-making');
        const data = await response.json();
        const container = document.getElementById('loss-alert-container');

        if (data.length > 0) {
            let listItems = data.map(c => `<li><strong>${c.kampanya_basligi}</strong> (ROI: %${parseFloat(c.roi).toFixed(2)})</li>`).join('');

            container.innerHTML = `
                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                    <h5 class="alert-heading">⚠️ Dikkat: Zarar Eden Kampanyalar Tespit Edildi!</h5>
                    <p>Aşağıdaki kampanyaların getirisi harcamasını karşılamıyor (ROI < %100). Durdurulması önerilir:</p>
                    <ul>${listItems}</ul>
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            `;
        }
    } catch (err) { console.error('Error checking loss making campaigns:', err); }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
}

// Kampanya Seçeneklerini Yükle
async function loadCampaignOptions() {
    try {
        const response = await fetch('/api/campaigns');
        const data = await response.json();
        const select1 = document.getElementById('campaign1');
        const select2 = document.getElementById('campaign2');

        data.forEach(camp => {
            const option = `<option value="${camp.kampanya_id}">${camp.kampanya_basligi}</option>`;
            select1.innerHTML += option;
            select2.innerHTML += option;
        });
    } catch (err) { console.error('Error loading options:', err); }
}

let compareFinancialChart = null;
let compareEfficiencyChart = null;

async function compareCampaigns() {
    const id1 = document.getElementById('campaign1').value;
    const id2 = document.getElementById('campaign2').value;

    if (!id1 || !id2 || id1 === "Seçiniz..." || id2 === "Seçiniz...") {
        alert("Lütfen iki kampanya seçiniz.");
        return;
    }

    try {
        const response = await fetch(`/api/compare?id1=${id1}&id2=${id2}`);
        const data = await response.json();

        if (data.length < 2) return;

        document.getElementById('comparisonResults').style.display = 'block';

        const labels = data.map(d => d.kampanya_basligi);
        const spend = data.map(d => parseFloat(d.toplam_harcama));
        const revenue = data.map(d => parseFloat(d.toplam_ciro));
        const roi = data.map(d => parseFloat(d.roi));
        const conversion = data.map(d => parseFloat(d.conversionRate));

        // Grafik 1: Finansal (Harcama vs Ciro)
        const ctx1 = document.getElementById('compareFinancialChart').getContext('2d');
        if (compareFinancialChart) compareFinancialChart.destroy();

        compareFinancialChart = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    { label: 'Harcama (TL)', data: spend, backgroundColor: 'rgba(255, 99, 132, 0.6)' },
                    { label: 'Ciro (TL)', data: revenue, backgroundColor: 'rgba(54, 162, 235, 0.6)' }
                ]
            },
            options: { responsive: true, scales: { y: { beginAtZero: true } } }
        });

        // Grafik 2: Verimlilik (ROI vs Dönüşüm)
        const ctx2 = document.getElementById('compareEfficiencyChart').getContext('2d');
        if (compareEfficiencyChart) compareEfficiencyChart.destroy();

        compareEfficiencyChart = new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'ROI (%)',
                        data: roi,
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        yAxisID: 'y'
                    },
                    {
                        label: 'Dönüşüm Oranı (%)',
                        data: conversion,
                        backgroundColor: 'rgba(255, 206, 86, 0.6)',
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'ROI %' } },
                    y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Dönüşüm %' } }
                }
            }
        });

        // KDS Önerisi
        const c1 = data[0];
        const c2 = data[1];
        let suggestion = "";

        // ROI karşılaştırması
        if (c1.roi > c2.roi) {
            suggestion = `<strong>${c1.kampanya_basligi}</strong> kampanyasının ROI oranı (%${c1.roi.toFixed(1)}), <strong>${c2.kampanya_basligi}</strong> kampanyasından daha yüksektir. Bütçe önceliği <strong>${c1.kampanya_basligi}</strong> tarafına kaydırılmalıdır.`;
        } else {
            suggestion = `<strong>${c2.kampanya_basligi}</strong> kampanyasının ROI oranı (%${c2.roi.toFixed(1)}), <strong>${c1.kampanya_basligi}</strong> kampanyasından daha yüksektir. Bütçe önceliği <strong>${c2.kampanya_basligi}</strong> tarafına kaydırılmalıdır.`;
        }

        document.getElementById('kdsRecommendation').innerHTML = suggestion;

    } catch (err) { console.error('Compare Error:', err); }
}

// ==========================================
// GELECEK SİMÜLASYONU
// ==========================================

async function loadSimulationOptions() {
    try {
        const response = await fetch('/api/simulation/options');
        const data = await response.json();

        // Kanalları Doldur
        const channels = data.channels.map(c => `<option value="${c.kanal_id}">${c.kanal_adi}</option>`).join('');
        document.getElementById('simChannelA').innerHTML = channels;
        document.getElementById('simChannelB').innerHTML = channels;

        // Kitleleri Doldur
        const audiences = data.audiences.map(k => `<option value="${k.kitle_id}">${k.kitle_adi}</option>`).join('');
        document.getElementById('simAudienceA').innerHTML = audiences;
        document.getElementById('simAudienceB').innerHTML = audiences;

    } catch (err) { console.error('Error loading simulation options:', err); }
}

let simRevenueChart = null;
let simRoiChart = null;

async function runSimulation() {
    const scenarioA = {
        kanal_id: document.getElementById('simChannelA').value,
        kitle_id: document.getElementById('simAudienceA').value,
        butce: document.getElementById('simBudgetA').value
    };
    const scenarioB = {
        kanal_id: document.getElementById('simChannelB').value,
        kitle_id: document.getElementById('simAudienceB').value,
        butce: document.getElementById('simBudgetB').value
    };

    try {
        const response = await fetch('/api/simulation/simulate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scenarioA, scenarioB })
        });
        const data = await response.json();

        document.getElementById('simulationResults').style.display = 'block';

        // Karar Metni
        document.getElementById('simulationDecision').innerHTML = data.recommendation;

        // Grafik 1: Tahmini Gelir
        const ctx1 = document.getElementById('simRevenueChart').getContext('2d');
        if (simRevenueChart) simRevenueChart.destroy();

        simRevenueChart = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: ['Senaryo A', 'Senaryo B'],
                datasets: [{
                    label: 'Tahmini Ciro (TL)',
                    data: [data.scenarioA.estimatedRevenue, data.scenarioB.estimatedRevenue],
                    backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(255, 99, 132, 0.6)']
                }]
            },
            options: { responsive: true, scales: { y: { beginAtZero: true } } }
        });

        // Grafik 2: Tahmini ROI
        const ctx2 = document.getElementById('simRoiChart').getContext('2d');
        if (simRoiChart) simRoiChart.destroy();

        simRoiChart = new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: ['Senaryo A', 'Senaryo B'],
                datasets: [{
                    label: 'Tahmini ROI (%)',
                    data: [data.scenarioA.estimatedROI, data.scenarioB.estimatedROI],
                    backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 206, 86, 0.6)']
                }]
            },
            options: { responsive: true, scales: { y: { beginAtZero: true } } }
        });

    } catch (err) { console.error('Simulation Error:', err); }
}

// 11. Özet İstatistikleri (KPI) Yükle
async function loadSummaryStats() {
    try {
        const response = await fetch('/api/summary');
        const data = await response.json();

        document.getElementById('kpiTotalSpend').innerText = formatCurrency(data.total_spend);
        document.getElementById('kpiTotalRevenue').innerText = formatCurrency(data.total_revenue);
        document.getElementById('kpiRoi').innerText = `%${parseFloat(data.roi).toFixed(2)}`;
        document.getElementById('kpiActiveCount').innerText = data.active_campaigns;
        document.getElementById('kpiTopChannel').innerText = data.top_channel || '-';

        // ROI Rengi
        const roiEl = document.getElementById('kpiRoi');
        if (data.roi > 0) roiEl.classList.add('text-success');
        else roiEl.classList.add('text-danger');

    } catch (err) { console.error('Error loading Summary Stats:', err); }
}
