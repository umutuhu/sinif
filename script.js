// Global değişkenler
let aktifKategori = '';
let secilenZorluk = '';
let aktifSoruIndex = 0;
let dogruSayisi = 0;
let yanlisSayisi = 0;
let sure = 25;
let zamanlayici;

// SEVIYELER objesi
const SEVIYELER = {
    CAYLAK: {  // Yeni başlangıç seviyesi
        ad: "Çaylak",
        emoji: "🍃",
        min: 0
    },
    CIRAK: {
        ad: "Çırak",
        emoji: "🌱",
        min: 1000  // 100'den 1000'e yükseltildi
    },
    ACEMI: {
        ad: "Acemi",
        emoji: "🌿",
        min: 2350  // Diğer seviyeleri de orantılı artıralım
    },
    USTA: {
        ad: "Usta",
        emoji: "🌺",
        min: 3850
    },
    UZMAN: {
        ad: "Uzman",
        emoji: "🌸",
        min: 6300
    },
    EFSANE: {
        ad: "Efsane",
        emoji: "👑",
        min: 9000
    }
};

let eskiRozet = 'CIRAK';

// Yasaklı kelimeler listesi
const YASAKLI_KELIMELER = [
   'argo', 'küfür', 'sik', 'göt', 'rak', 'am', 'yar', 'piç', 'rus', 'pu', 'çük','siz','ler','lar'
];

// Kullanıcı adı kontrolü
function isimKontrol(isim) {
    if (!isim || isim.trim().length === 0) return false;
    if (isim.length < 3) return false;
    if (YASAKLI_KELIMELER.some(kelime => 
        isim.toLowerCase().includes(kelime.toLowerCase()))) return false;
    if (!/^[a-zA-ZğüşıöçĞÜŞİÖÇ0-9 ]+$/.test(isim)) return false;
    return true;
}

// Kullanıcı adı kaydetme
function kullaniciAdiKaydet() {
    const isimInput = document.getElementById('kullanici-adi');
    const isim = isimInput.value.trim();
    const hataMsg = document.getElementById('isim-hata');
    
    if (isimKontrol(isim)) {
        localStorage.setItem('oyuncuIsmi', isim);
        document.getElementById('isim-giris-panel').classList.add('gizli');
        document.getElementById('secim-panel').classList.remove('gizli');
        
        // Puan tablosunu gizli tut
        document.getElementById('skor-tablosu').classList.add('gizli');

        // Varsayılan olarak Matematik dersini göster
        siralamayiGoster('matematik');

        // Input'u temizle
        isimInput.value = '';
        hataMsg.classList.add('gizli');
    } else {
        hataMsg.textContent = 'Geçerli bir kullanıcı adı girin! (3-10 karakter)';
        hataMsg.classList.remove('gizli');
    }
}

// Ders seçimi
function dersSec(ders) {
    aktifKategori = ders;
    
    // Aktif ders butonunu işaretle
    document.querySelectorAll('.ders-btn').forEach(btn => {
        btn.classList.remove('aktif');
    });
    document.querySelector(`.ders-btn.${ders}`).classList.add('aktif');
    
    // Başlat butonunu kontrol et
    kontrolBaslatButonu();
    
    // Puan tablosunu gizle
    document.getElementById('skor-tablosu').classList.add('gizli');
}

// Zorluk seçimi
function zorlukSec(zorluk) {
    secilenZorluk = zorluk;
    
    // Aktif zorluk butonunu işaretle
    document.querySelectorAll('.zorluk-btn').forEach(btn => {
        btn.classList.remove('aktif');
    });
    document.querySelector(`.zorluk-btn.${zorluk}`).classList.add('aktif');
    
    // Başlat butonunu kontrol et
    kontrolBaslatButonu();
}

// Başlat butonunu kontrol et
function kontrolBaslatButonu() {
    const baslatBtn = document.getElementById('basla-btn');
    const gecisBtn = document.getElementById('gecis-btn');
    
    if (aktifKategori && secilenZorluk) {
        baslatBtn.classList.remove('gizli');
        baslatBtn.classList.add('aktif');
        gecisBtn.classList.remove('gizli'); // Zorluk değiştirme butonunu göster
    } else {
        baslatBtn.classList.add('gizli');
        baslatBtn.classList.remove('aktif');
        gecisBtn.classList.add('gizli'); // Zorluk değiştirme butonunu gizle
    }
}

// Testi başlat
function testBaslat() {
    // Seçim panelini gizle
    document.getElementById('secim-panel').classList.add('gizli');
    document.getElementById('skor-tablosu').classList.add('gizli');
    
    // Quiz panelini göster
    document.getElementById('quiz-panel').classList.remove('gizli');
    
    // Değişkenleri sıfırla
    aktifSoruIndex = 0;
    dogruSayisi = 0;
    yanlisSayisi = 0;
    document.getElementById('toplam-puan').textContent = '0';
    
    // Arka plan müziğini başlat
    const music = document.getElementById('background-music');
    music.volume = 0.1; // Ses seviyesini ayarlayın (0.0 - 1.0 arası)
    music.play(); // Müziği başlat

    // İlk soruyu göster
    soruGoster();
    sureyiBaslat();
}

// Quiz bitirme
function quizBitir() {
    const toplamPuan = parseInt(document.getElementById('toplam-puan').textContent);
    const isim = localStorage.getItem('oyuncuIsmi');
    
    puanKaydet(aktifKategori, isim, toplamPuan);
    
    alert(`Quiz bitti!\nDoğru: ${dogruSayisi}\nYanlış: ${yanlisSayisi}\nToplam Puan: ${toplamPuan}`);
    
    // Quiz panelini gizle
    document.getElementById('quiz-panel').classList.add('gizli');
    
    // Seçim paneli ve skor tablosunu göster
    document.getElementById('secim-panel').classList.remove('gizli');
    document.getElementById('skor-tablosu').classList.remove('gizli');
    
    // Skor tablosunu güncelle
    siralamayiGoster(aktifKategori);
}

// Sayfa yüklendiğinde
window.addEventListener('load', () => {
    // Her program başladığında localStorage'ı temizle
    localStorage.removeItem('oyuncuIsmi');
    
    // Panelleri düzenle
    document.getElementById('secim-panel').classList.add('gizli');
    document.getElementById('skor-tablosu').classList.add('gizli');
    document.getElementById('isim-giris-panel').classList.remove('gizli');
    
    // Sayfa yüklendiğinde müziği başlat
    const music = document.getElementById('background-music');
    music.volume = 0.3; // Ses seviyesini ayarlayın (0.0 - 1.0 arası)
    music.play(); // Müziği başlat
});

// Program kapatıldığında
window.addEventListener('beforeunload', () => {
    // Program kapanırken localStorage'ı temizle
    localStorage.removeItem('oyuncuIsmi');
});

// Süre kontrolü
function sureyiBaslat() {
    clearInterval(zamanlayici);
    sure = 25;
    document.getElementById('sure').textContent = sure;
    
    zamanlayici = setInterval(() => {
        sure--;
        document.getElementById('sure').textContent = sure;
        if (sure <= 0) {
            clearInterval(zamanlayici);
            cevapKontrol(null);
        }
    }, 1000);
}

// Parlama efekti
function parlamaEfektiOlustur() {
    const parlamaDiv = document.createElement('div');
    parlamaDiv.className = 'parlama';
    document.body.appendChild(parlamaDiv);
    
    setTimeout(() => {
        parlamaDiv.remove();
    }, 500);
}

// Puan kaydetme ve sıralama
function puanKaydet(kategori, isim, puan) {
    let yuksekPuanlar = JSON.parse(localStorage.getItem('yuksekPuanlar')) || {};
    if (!yuksekPuanlar[kategori]) yuksekPuanlar[kategori] = [];
    
    // Kullanıcının önceki puanını bul
    let kullaniciIndex = yuksekPuanlar[kategori].findIndex(k => k.isim === isim);
    
    // Rozet belirleme
    let toplamPuan = puan;
    
    if (kullaniciIndex !== -1) {
        // Kullanıcı daha önce bu dersten puan almış
        toplamPuan += yuksekPuanlar[kategori][kullaniciIndex].puan;
        yuksekPuanlar[kategori].splice(kullaniciIndex, 1); // Eski kaydı sil
    }
    
    let rozet = SEVIYELER.CAYLAK.emoji;  // Varsayılan olarak Çaylak rozeti
    
    if (toplamPuan >= SEVIYELER.EFSANE.min) rozet = SEVIYELER.EFSANE.emoji;
    else if (toplamPuan >= SEVIYELER.UZMAN.min) rozet = SEVIYELER.UZMAN.emoji;
    else if (toplamPuan >= SEVIYELER.USTA.min) rozet = SEVIYELER.USTA.emoji;
    else if (toplamPuan >= SEVIYELER.ACEMI.min) rozet = SEVIYELER.ACEMI.emoji;
    else if (toplamPuan >= SEVIYELER.CIRAK.min) rozet = SEVIYELER.CIRAK.emoji;
    
    // Yeni puanı ekle
    yuksekPuanlar[kategori].push({
        isim: isim,
        puan: toplamPuan,
        rozet: rozet,
        tarih: new Date().toLocaleDateString()
    });
    
    // Puanlara göre sırala
    yuksekPuanlar[kategori].sort((a, b) => b.puan - a.puan);
    
    // İlk 30'u tut
    if (yuksekPuanlar[kategori].length > 15) {
        yuksekPuanlar[kategori].length = 15;
    }
    
    localStorage.setItem('yuksekPuanlar', JSON.stringify(yuksekPuanlar));
}

// Sıralama gösterimi
function siralamayiGoster(kategori) {
    const yuksekPuanlar = JSON.parse(localStorage.getItem('yuksekPuanlar')) || {};
    const liste = document.getElementById('siralama-liste');
    liste.innerHTML = ''; // Önceki verileri temizle
    
    if (yuksekPuanlar[kategori]) {
        yuksekPuanlar[kategori].forEach((kayit, index) => {
            const siralamaSatiri = document.createElement('div');
            siralamaSatiri.className = 'siralama-item';
            siralamaSatiri.innerHTML = `
                <div class="siralama-sira">${index + 1}</div>
                <div class="siralama-isim">${kayit.isim}</div>
                <div class="siralama-puan">Toplam: ${kayit.puan} puan</div>
                <div class="siralama-rozet">${kayit.rozet}</div>
            `;
            liste.appendChild(siralamaSatiri);
        });
    } else {
        liste.innerHTML = '<p>Henüz puan kaydedilmemiş.</p>'; // Eğer puan yoksa mesaj göster
    }
}

// Sorular objesi
const sorular = {
    matematik: {
        kolay: [
            {
                soru: "5 + 18 = ?",
                cevaplar: ["22", "13", "23", "43"],
                dogruCevap: "23"
            },
            {
                soru: "56 - 54 = ?",
                cevaplar: ["12", "10", "32", "2"],
                dogruCevap: "2"
            },
            {
                soru: "15 + 37 = ?",
                cevaplar: ["51", "52", "50", "53"],
                dogruCevap: "52"
            },
            {
                soru: "63 + 15 = ?",
                cevaplar: ["78", "77", "88", "28"],
                dogruCevap: "78"
            },
            {
                soru: "67 + 16 = ?",
                cevaplar: ["93", "82", "83", "91"],
                dogruCevap: "83"
            },
            {
                soru: "84 - 56 = ?",
                cevaplar: ["18", "27", "28", "26"],
                dogruCevap: "28"
            },
            {
                soru: "24 + 18 = ?",
                cevaplar: ["42", "23", "52", "43"],
                dogruCevap: "42"
            },
            {
                soru: "73 + 19 = ?",
                cevaplar: ["92", "91", "93", "90"],
                dogruCevap: "92"
            },
            {
                soru: "33 - 8 = ?",
                cevaplar: ["27", "35", "23", "25"],
                dogruCevap: "25"
            },
            {
                soru: "22 + 35 = ?",
                cevaplar: ["58", "57", "117", "55"],
                dogruCevap: "57"
            },
            {
                soru: "91 - 47 = ?",
                cevaplar: ["44", "43", "45", "46"],
                dogruCevap: "44"
            },
            {
                soru: "28 + 35 = ?",
                cevaplar: ["62", "61", "63", "64"],  // Doğru cevap 3. sıraya
                dogruCevap: "63"
            },
            {
                soru: "72 - 45 = ?",
                cevaplar: ["28", "26", "29", "27"],  // Doğru cevap 4. sıraya
                dogruCevap: "27"
            },
            {
                soru: "44 + 39 = ?",
                cevaplar: ["83", "82", "84", "81"],  // Doğru cevap 1. sıraya
                dogruCevap: "83"
            },
            {
                soru: "98 - 48 = ?",
                cevaplar: ["05", "60", "50", "40"],
                dogruCevap: "50"
            },
            {
                soru: "13 + 19 = ?",
                cevaplar: ["22", "32", "33", "30"],
                dogruCevap: "32"
            },
            {
                soru: "25 + 14 = ?",
                cevaplar: ["39", "38", "40", "37"],
                dogruCevap: "39"
            },
            {
                soru: "27 - 13 = ?",
                cevaplar: ["15", "14", "16", "4"],
                dogruCevap: "14"
            },
            {
                soru: "42 - 17 = ?",
                cevaplar: ["20", "24", "26", "25"],
                dogruCevap: "25"
            },
            {
                soru: "21 + 46 = ?",
                cevaplar: ["77", "67", "68", "75"],
                dogruCevap: "67"
            },
            {
                soru: "85 - 38 = ?",
                cevaplar: ["37", "46", "47", "46"],
                dogruCevap: "47"
            },
            {
                soru: "54 + 27 = ?",
                cevaplar: ["81", "80", "82", "79"],
                dogruCevap: "81"
            },
            {
                soru: "92 - 85 = ?",
                cevaplar: ["7", "6", "8", "5"],
                dogruCevap: "7"
            },
            {
                soru: "36 + 58 = ?",
                cevaplar: ["84", "93", "95", "94"],
                dogruCevap: "94"
            },
            {
                soru: "76 - 26 = ?",
                cevaplar: ["47", "45", "50", "45"],
                dogruCevap: "50"
            },
            {
                soru: "64 + 19 = ?",
                cevaplar: ["83", "82", "84", "81"],
                dogruCevap: "83"
            },
            {
                soru: "82 + 19 = ?",
                cevaplar: ["101", "99", "100", "102"],  // Doğru cevap 1. sıraya
                dogruCevap: "101"
            },
            {
                soru: "95 - 28 = ?",
                cevaplar: ["68", "65", "66", "67"],  // Doğru cevap 4. sıraya
                dogruCevap: "67"
            },
            {
                soru: "150 + 275 = ?",
                cevaplar: ["425", "435", "415", "445"],  // Doğru cevap 1. sıraya
                dogruCevap: "425"
            },
            {
                soru: "16 x 14 = ?",
                cevaplar: ["214", "224", "234", "244"],  // Doğru cevap 2. sıraya
                dogruCevap: "224"
            },
            {
                soru: "150 - 75 = ?",
                cevaplar: ["75", "80", "70", "65"],  // Doğru cevap 1. sıraya
                dogruCevap: "75"
            },
            {
                soru: "175 + 225 = ?",
                cevaplar: ["390", "400", "410", "420"],  // Doğru cevap 2. sıraya
                dogruCevap: "400"
            },
           
            
        ],
        orta: [
            {
                soru: "8 x 7 = ?",
                cevaplar: ["54", "58", "56", "55"],  // Doğru cevap 3. sıraya
                dogruCevap: "56"
            },
            {
                soru: "63 ÷ 9 = ?",
                cevaplar: ["8", "6", "9", "7"],  // Doğru cevap 4. sıraya
                dogruCevap: "7"
            },
            {
                soru: "45 + 38 = ?",
                cevaplar: ["83", "82", "84", "81"],
                dogruCevap: "83"
            },
            {
                soru: "96 - 57 = ?",
                cevaplar: ["39", "38", "40", "37"],
                dogruCevap: "39"
            },
            {
                soru: "6 x 9 = ?",
                cevaplar: ["54", "52", "56", "53"],
                dogruCevap: "54"
            },
            {
                soru: "72 ÷ 8 = ?",
                cevaplar: ["8", "6", "9", "7"],
                dogruCevap: "9"
            },
            {
                soru: "125 + 67 = ?",
                cevaplar: ["193", "191", "192", "190"],
                dogruCevap: "192"
            },
            {
                soru: "144 - 76 = ?",
                cevaplar: ["63", "67", "69", "68"],
                dogruCevap: "68"
            },
            {
                soru: "115 + 17 = ?",
                cevaplar: ["122", "131", "143", "132"],
                dogruCevap: "132"
            },
            {
                soru: "6 x 8 = ?",
                cevaplar: ["56", "44", "48", "58"],
                dogruCevap: "48"
            },
            {
                soru: "81 ÷ 9 = ?",
                cevaplar: ["9", "8", "10", "7"],
                dogruCevap: "9"
            },
            {
                soru: "11 x 8 = ?",
                cevaplar: ["96", "84", "88", "78"],
                dogruCevap: "88"
            },
            {
                soru: "45 ÷ 9 = ?",
                cevaplar: ["7", "9", "10", "5"],
                dogruCevap: "5"
            },
            {
                soru: "15 x 7 = ?",
                cevaplar: ["104", "106", "105", "103"],  // Doğru cevap 3. sıraya
                dogruCevap: "105"
            },
            
            {
                soru: "64 ÷ 8 = ?",
                cevaplar: ["7", "9", "6", "8"],  // Doğru cevap 4. sıraya
                dogruCevap: "8"
            },
            {
                soru: "13 x 6 = ?",
                cevaplar: ["78", "77", "79", "76"],
                dogruCevap: "78"
            },
            {
                soru: "7 x 6 = ?",
                cevaplar: ["41", "42", "43", "40"],
                dogruCevap: "42"
            },
            {
                soru: "56 ÷ 7 = ?",
                cevaplar: ["9", "7", "8", "6"],
                dogruCevap: "8"
            },
            {
                soru: "18 x 6 = ?",
                cevaplar: ["103", "102", "108", "106"],
                dogruCevap: "108"
            },
            {
                soru: "9 x 8 = ?",
                cevaplar: ["72", "71", "73", "70"],
                dogruCevap: "72"
            },
            {
                soru: "23 x 2 = ?",
                cevaplar: ["66", "36", "16", "46"],
                dogruCevap: "46"
            },
            {
                soru: "48 ÷ 4 = ?",
                cevaplar: ["18", "17", "9", "12"],
                dogruCevap: "12"
            },
            {
                soru: "5 x 12 = ?",
                cevaplar: ["60", "58", "62", "59"],
                dogruCevap: "60"
            },
            {
                soru: "6 x 9 = ?",
                cevaplar: ["58", "52", "54", "53"],
                dogruCevap: "54"
            },
            {
                soru: "49 ÷ 7 = ?",
                cevaplar: ["7", "6", "8", "9"],
                dogruCevap: "7"
            },
            {
                soru: "36 ÷ 6 = ?",
                cevaplar: ["3", "5", "6", "8"],
                dogruCevap: "6"
            },
            {
                soru: "12 x 8 = ?",
                cevaplar: ["94", "96", "95", "98"],  // Doğru cevap 2. sıraya
                dogruCevap: "96"
            },
            {
                soru: "76 ÷ 2 = ?",
                cevaplar: ["37", "46", "38", "48"],
                dogruCevap: "38"
            },
            {
                soru: "120 ÷ 6 = ?",
                cevaplar: ["18", "20", "19", "21"],  // Doğru cevap 2. sıraya
                dogruCevap: "20"
            },
            
        ],
        zor: [
            
            {
                soru: "17 x 13 = ?",
                cevaplar: ["219", "221", "220", "222"],  // Doğru cevap 2. sıraya
                dogruCevap: "221"
            },
            {
                soru: "15 x 5 = ?",
                cevaplar: ["75", "65", "55", "25"],
                dogruCevap: "75"
            },
            {
                soru: "96 ÷ 3 = ?",
                cevaplar: ["33", "32", "34", "31"],
                dogruCevap: "32"
            },
            {
                soru: "18 x 15 = ?",
                cevaplar: ["260", "270", "280", "290"],  // Doğru cevap 2. sıraya
                dogruCevap: "270"
            },
            {
                soru: "15 x 13 = ?",
                cevaplar: ["195", "194", "196", "193"],
                dogruCevap: "195"
            },
            {
                soru: "45 x 5 = ?",
                cevaplar: ["220", "225", "235", "240"],
                dogruCevap: "225"
            },
            {
                soru: "248 ÷ 8 = ?",
                cevaplar: ["30", "31", "32", "29"],  // Doğru cevap 2. sıraya
                dogruCevap: "31"
            },
            {
                soru: "225 ÷ 15 = ?",
                cevaplar: ["15", "14", "16", "13"],
                dogruCevap: "15"
            },
            
            {
                soru: "135 ÷ 15 = ?",
                cevaplar: ["9", "8", "10", "7"],
                dogruCevap: "9"
            },
            {
                soru: "110 x 5 = ?",
                cevaplar: ["550", "500", "5000", "510"],
                dogruCevap: "550"
            },
            {
                soru: "17 x 11 = ?",
                cevaplar: ["183", "186", "187", "185"],
                dogruCevap: "187"
            },
            {
                soru: "208 ÷ 16 = ?",
                cevaplar: ["14", "12", "13", "11"],
                dogruCevap: "13"
            },
            {
                soru: "18 x 12 = ?",
                cevaplar: ["215", "214", "218", "216"],
                dogruCevap: "216"
            },
            {
                soru: "88 ÷ 22 = ?",
                cevaplar: ["4", "3", "8", "2"],
                dogruCevap: "4"
            },
            {
                soru: "148 ÷ 4 = ?",
                cevaplar: ["33", "36", "48", "37"],
                dogruCevap: "37"
            },
            {
                soru: "17 x 4 = ?",
                cevaplar: ["64", "67", "69", "68"],
                dogruCevap: "68"
            },
            {
                soru: "156 ÷ 6 = ?",
                cevaplar: ["22", "24", "25", "26"],
                dogruCevap: "26"
            },
            {
                soru: "240 ÷ 4 = ?",
                cevaplar: ["66", "60", "70", "67"],
                dogruCevap: "60"
            },
            {
                soru: "23 x 15 = ?",
                cevaplar: ["345", "344", "346", "343"],
                dogruCevap: "345"
            },
            {
                soru: "1000 ÷ 20 = ?",
                cevaplar: ["40", "51", "50", "53"],
                dogruCevap: "50"
            },
            {
                soru: "125 ÷ 5 = ?",
                cevaplar: ["25", "24", "26", "23"],
                dogruCevap: "25"
            },
            {
                soru: "16 x 7 = ?",
                cevaplar: ["114", "113", "112", "110"],
                dogruCevap: "112"
            },
            {
                soru: "144 ÷ 12 = ?",
                cevaplar: ["10", "11", "13", "12"],
                dogruCevap: "12"
            },
            
            {
                soru: "96 ÷ 8 = ?",
                cevaplar: ["13", "11", "12", "10"],
                dogruCevap: "12"
            },
           
            {
                soru: "180 ÷ 15 = ?",
                cevaplar: ["22", "13", "14", "12"], 
                dogruCevap: "12"
            },
            {
                soru: "1000 ÷ 100 = ?",
                cevaplar: ["10", "11", "100", "1"],
                dogruCevap: "10"
            },
        ]
    },
    ingilizce: {
        kolay: [
            {
                soru: "'Apple' kelimesinin Türkçe anlamı nedir?",
                cevaplar: ["Armut", "Elma", "Portakal", "Muz"],  // Doğru cevap 2. sıraya
                dogruCevap: "Elma"
            },
            {
                soru: "'Red' hangi renktir?",
                cevaplar: ["Mavi", "Yeşil", "Kırmızı", "Sarı"],  // Doğru cevap 3. sıraya
                dogruCevap: "Kırmızı"
            },
            {
                soru: "'Cat' ne demektir?",
                cevaplar: ["Köpek", "Kuş", "Fare", "Kedi"],  // Doğru cevap 4. sıraya
                dogruCevap: "Kedi"
            },
            {
                soru: "'Book' kelimesinin anlamı nedir?",
                cevaplar: ["Defter", "Kitap", "Kalem", "Silgi"],  // Doğru cevap 2. sıraya
                dogruCevap: "Kitap"
            },
            {
                soru: "'Water' ne demektir?",
                cevaplar: ["Kahve", "Süt", "Su", "Çay"],  // Doğru cevap 3. sıraya
                dogruCevap: "Su"
            },
            {
                soru: "'Dog' kelimesinin anlamı nedir?",
                cevaplar: ["Kedi", "Balık", "Köpek", "Kuş"],  // Doğru cevap 3. sıraya
                dogruCevap: "Köpek"
            },
            {
                soru: "'Blue' hangi renktir?",
                cevaplar: ["Kırmızı", "Mavi", "Yeşil", "Sarı"],  // Doğru cevap 2. sıraya
                dogruCevap: "Mavi"
            },
            {
                soru: "'House' ne demektir?",
                cevaplar: ["Okul", "Bahçe", "Park", "Ev"],  // Doğru cevap 4. sıraya
                dogruCevap: "Ev"
            },
            {
                soru: "'School' kelimesinin anlamı nedir?",
                cevaplar: ["Bahçe", "Park", "Okul", "Ev"],  // Doğru cevap 3. sıraya
                dogruCevap: "Okul"
            },
            {
                soru: "'Yellow' hangi renktir?",
                cevaplar: ["Mavi", "Sarı", "Yeşil", "Kırmızı"],  // Doğru cevap 2. sıraya
                dogruCevap: "Sarı"
            },
            {
                soru: "'Bird' ne demektir?",
                cevaplar: ["Kedi", "Balık", "Kuş", "Köpek"],  // Doğru cevap 3. sıraya
                dogruCevap: "Kuş"
            },
            {
                soru: "'Five' sayısının anlamı nedir?",
                cevaplar: ["Üç", "Dört", "Altı", "Beş"],  // Doğru cevap 4. sıraya
                dogruCevap: "Beş"
            },
            {
                soru: "'Mother' kelimesinin anlamı nedir?",
                cevaplar: ["Baba", "Anne", "Kardeş", "Abla"],  // Doğru cevap 2. sıraya
                dogruCevap: "Anne"
            },
            {
                soru: "'Run' fiilinin anlamı nedir?",
                cevaplar: ["Yürümek", "Uyumak", "Koşmak", "Oturmak"],  // Doğru cevap 3. sıraya
                dogruCevap: "Koşmak"
            },
            {
                soru: "'Jump' fiilinin anlamı nedir?",
                cevaplar: ["Koşmak", "Zıplamak", "Yüzmek", "Yürümek"],  // Doğru cevap 2. sıraya
                dogruCevap: "Zıplamak"
            },
            {
                soru: "'Sleep' fiilinin anlamı nedir?",
                cevaplar: ["Yemek", "İçmek", "Oturmak", "Uyumak"],  // Doğru cevap 4. sıraya
                dogruCevap: "Uyumak"
            },
            {
                soru: "'Pencil' kelimesinin anlamı nedir?",
                cevaplar: ["Defter", "Silgi", "Kalem", "Kitap"],  // Doğru cevap 3. sıraya
                dogruCevap: "Kalem"
            },
            {
                soru: "'Table' kelimesinin anlamı nedir?",
                cevaplar: ["Dolap", "Masa", "Yatak", "Ev"],  // Doğru cevap 2. sıraya
                dogruCevap: "Masa"
            },
            {
                soru: "'Chair' kelimesinin anlamı nedir?",
                cevaplar: ["Masa", "Dolap", "Yatak", "Sandalye"],  // Doğru cevap 4. sıraya
                dogruCevap: "Sandalye"
            },
            {
                soru: "'Green' hangi renktir?",
                cevaplar: ["Mor", "Kırmızı", "Yeşil", "Sarı"],  // Doğru cevap 3. sıraya
                dogruCevap: "Yeşil"
            },
          
            {
                soru: "'Eat' fiilinin anlamı nedir?",
                cevaplar: ["Yemek", "İçmek", "Uyumak", "Koşmak"],
                dogruCevap: "Yemek"
            },
            {
                soru: "'Drink' fiilinin anlamı nedir?",
                cevaplar: ["Koşmak", "Yemek", "Uyumak", "İçmek"],
                dogruCevap: "İçmek"
            },
            {
                soru: "'Walk' fiilinin anlamı nedir?",
                cevaplar: ["Yürümek", "Koşmak", "Zıplamak", "Oturmak"],
                dogruCevap: "Yürümek"
            },
            {
                soru: "'Bag' kelimesinin anlamı nedir?",
                cevaplar: ["Çanta", "Kalem", "Kitap", "Defter"],
                dogruCevap: "Çanta"
            },
            {
                soru: "'Door' kelimesinin anlamı nedir?",
                cevaplar: ["Cam", "Pencere", "Kapı", "Tavan"],
                dogruCevap: "Kapı"
            },
            {
                soru: "'Window' kelimesinin anlamı nedir?",
                cevaplar: ["Duvar", "Kapı", "Pencere", "Tavan"],
                dogruCevap: "Pencere"
            },
            {
                soru: "'Brown' hangi renktir?",
                cevaplar: ["Mor", "Kahverengi", "Pembe", "Turuncu"],
                dogruCevap: "Kahverengi"
            },
            {
                soru: "'Purple' hangi renktir?",
                cevaplar: ["Mor", "Pembe", "Turuncu", "Kahverengi"],
                dogruCevap: "Mor"
            },
            {
                soru: "'Orange' hangi renktir?",
                cevaplar: ["Mavi", "Turuncu", "Pembe", "Kahverengi"],  // Doğru cevap 2. sıraya
                dogruCevap: "Turuncu"
            },
            {
                soru: "'Write' fiilinin anlamı nedir?",
                cevaplar: ["Okumak", "Çizmek", "Silmek", "Yazmak"],  // Doğru cevap 4. sıraya
                dogruCevap: "Yazmak"
            },
            {
                soru: "'Board' kelimesinin anlamı nedir?",
                cevaplar: ["Sıra", "Tahta", "Sandalye", "Dolap"],  // Doğru cevap 2. sıraya
                dogruCevap: "Tahta"
            },
           
            {
                soru: "'Draw' fiilinin anlamı nedir?",
                cevaplar: ["Yazmak", "Silmek", "Çizmek", "Okumak"],  // Doğru cevap 3. sıraya
                dogruCevap: "Çizmek"
            },
            {
                soru: "'Read' fiilinin anlamı nedir?",
                cevaplar: ["Yazmak", "Okumak", "Çizmek", "Silmek"],  // Doğru cevap 2. sıraya
                dogruCevap: "Okumak"
            },
            {
                soru: "'Desk' kelimesinin anlamı nedir?",
                cevaplar: ["Sandalye", "Tahta", "Dolap", "Sıra"],  // Doğru cevap 4. sıraya
                dogruCevap: "Sıra"
            },
          
            {
                soru: "'Ruler' kelimesinin anlamı nedir?",
                cevaplar: ["Kalem", "Silgi", "Cetvel", "Kalemtıraş"],  // Doğru cevap 3. sıraya
                dogruCevap: "Cetvel"
            },
            {
                soru: "'Eraser' kelimesinin anlamı nedir?",
                cevaplar: ["Kalem", "Silgi", "Cetvel", "Kalemtıraş"],  // Doğru cevap 2. sıraya
                dogruCevap: "Silgi"
            },
            {
                soru: "'Pencil sharpener' kelimesinin anlamı nedir?",
                cevaplar: ["Silgi", "Cetvel", "Kalem", "Kalemtıraş"],  // Doğru cevap 4. sıraya
                dogruCevap: "Kalemtıraş"
            },
            {
                soru: "'Notebook' kelimesinin anlamı nedir?",
                cevaplar: ["Kitap", "Kalem", "Defter", "Çanta"],  // Doğru cevap 3. sıraya
                dogruCevap: "Defter"
            },
            {
                soru: "'Pen' kelimesinin anlamı nedir?",
                cevaplar: ["Kurşun kalem", "Tükenmez kalem", "Silgi", "Defter"],  // Doğru cevap 2. sıraya
                dogruCevap: "Tükenmez kalem"
            },
            {
                soru: "'Teacher' kelimesinin anlamı nedir?",
                cevaplar: ["Müdür", "Doktor", "Öğretmen", "Öğrenci"],  // Doğru cevap 3. sıraya
                dogruCevap: "Öğretmen"
            },
            {
                soru: "'Student' kelimesinin anlamı nedir?",
                cevaplar: ["Müdür", "Doktor", "Öğretmen", "Öğrenci"],  // Doğru cevap 4. sıraya
                dogruCevap: "Öğrenci"
            },
            {
                soru: "'How are you?' cümlesinin anlamı nedir?",
                cevaplar: ["Kimsin?", "Nasılsın?", "Nerelisin?", "Kaç yaşındasın?"],  // Doğru cevap 2. sıraya
                dogruCevap: "Nasılsın?"
            },
            {
                soru: "'Good night' ne zaman kullanılır?",
                cevaplar: ["Sabah", "Gece", "Öğlen", "Akşam"],  // Doğru cevap 2. sıraya
                dogruCevap: "Gece"
            },
            {
                soru: "'Breakfast' kelimesinin anlamı nedir?",
                cevaplar: ["Öğle yemeği", "Kahvaltı", "Akşam yemeği", "Yemek"],  // Doğru cevap 2. sıraya
                dogruCevap: "Kahvaltı"
            },
            {
                soru: "'Goodbye' ne zaman kullanılır?",
                cevaplar: ["Karşılaşınca", "Ayrılırken", "Yemekte", "Sabah"],  // Doğru cevap 2. sıraya
                dogruCevap: "Ayrılırken"
            },
            {
                soru: "'Kitchen' kelimesinin anlamı nedir?",
                cevaplar: ["Salon", "Banyo", "Mutfak", "Yatak odası"],  // Doğru cevap 3. sıraya
                dogruCevap: "Mutfak"
            },
            {
                soru: "'Please' kelimesinin anlamı nedir?",
                cevaplar: ["Teşekkürler", "Rica ederim", "Güle güle", "Lütfen"],  // Doğru cevap 4. sıraya
                dogruCevap: "Lütfen"
            },
            {
                soru: "'School bag' kelimesinin anlamı nedir?",
                cevaplar: ["Okul çantası", "Okul kitabı", "Okul defteri", "Okul kalemi"],  // Doğru cevap 1. sıraya
                dogruCevap: "Okul çantası"
            },
           
        ],
        orta: [
            {
                soru: "'What is your name?' ne demektir?",
                cevaplar: ["Kaç yaşındasın?", "Adın ne?", "Nerelisin?", "Nasılsın?"],  // Doğru cevap 2. sıraya
                dogruCevap: "Adın ne?"
            },
            {
                soru: "'How old are you?' cümlesinin anlamı nedir?",
                cevaplar: ["Nerelisin?", "Nasılsın?", "Kaç yaşındasın?", "Adın ne?"],  // Doğru cevap 3. sıraya
                dogruCevap: "Kaç yaşındasın?"
            },
            {
                soru: "'Open the window' cümlesinin anlamı nedir?",
                cevaplar: ["Kapıyı kapat", "Pencereyi aç", "Lambayı yak", "Masayı topla"],  // Doğru cevap 2. sıraya
                dogruCevap: "Pencereyi aç"
            },
            {
                soru: "'I am a student' cümlesinin anlamı nedir?",
                cevaplar: ["Ben öğrenciyim", "Ben öğretmenim", "Ben doktorum", "Ben mühendisim"],
                dogruCevap: "Ben öğrenciyim"
            },
            {
                soru: "'Good morning' ne zaman kullanılır?",
                cevaplar: ["Akşam", "Öğlen", "Sabah", "Gece"],
                dogruCevap: "Sabah"
            },
            
            {
                soru: "'My favorite color is blue' cümlesinin anlamı nedir?",
                cevaplar: ["En sevdiğim renk mavidir", "Mavi rengi sevmem", "Kırmızı rengini severim", "Renkleri sevmem"],
                dogruCevap: "En sevdiğim renk mavidir"
            },
            {
                soru: "'Where are you from?' sorusunun anlamı nedir?",
                cevaplar: ["Adın ne?", "Nasılsın?", "Nerelisin?", "Kaç yaşındasın?"],  // Doğru cevap 3. sıraya
                dogruCevap: "Nerelisin?"
            },
            {
                soru: "'I like playing football' cümlesinin anlamı nedir?",
                cevaplar: ["Tenis oynamayı severim", "Futbol oynamayı severim", "Futbol sevmem", "Spor yapmam"],
                dogruCevap: "Futbol oynamayı severim"
            },
            {
                soru: "'She is my sister' cümlesinin anlamı nedir?",
                cevaplar: ["O benim kardeşim", "O benim ablam", "O benim kız kardeşim", "O benim erkek kardeşim"],
                dogruCevap: "O benim kız kardeşim"
            },
            {
                soru: "'Can you help me?' cümlesinin anlamı nedir?",
                cevaplar: ["Bana yardım eder misin?", "Nasılsın?", "Nereye gidiyorsun?", "Ne yapıyorsun?"],
                dogruCevap: "Bana yardım eder misin?"
            },
            {
                soru: "'What is your favorite color?' sorusunun anlamı nedir?",
                cevaplar: ["En sevdiğin renk nedir?", "Hangi rengi seversin?", "Renklerin ne?", "Renkleri seviyor musun?"],  // Doğru cevap 1. sıraya
                dogruCevap: "En sevdiğin renk nedir?"
            },
            {
                soru: "'I am happy' cümlesinin anlamı nedir?",
                cevaplar: ["Ben üzgünüm", "Ben mutluyum", "Ben yorgunum", "Ben açım"],
                dogruCevap: "Ben mutluyum"
            },
            {
                soru: "'What time is it?' sorusunun anlamı nedir?",
                cevaplar: ["Nasılsın?", "Nerelisin?", "Saat kaç?", "Kaç yaşındasın?"],
                dogruCevap: "Saat kaç?"
            },
            {
                soru: "'My father is a doctor' cümlesinin anlamı nedir?",
                cevaplar: ["Babam ustadır", "Babam doktordur", "Babam mühendistir", "Babam polisdir"],
                dogruCevap: "Babam doktordur"
            },
          
            {
                soru: "'I am going to school' cümlesinin anlamı nedir?",
                cevaplar: ["Okula gidiyorum", "Okuldan geliyorum", "Okulda çalışıyorum", "Okulu seviyorum"],
                dogruCevap: "Okula gidiyorum"
            }
        ],
        zor: [
            {
                soru: "'I like swimming' cümlesinin anlamı nedir?",
                cevaplar: ["Koşmayı severim", "Yüzmek istemem", "Yüzmeyi severim", "Yüzme bilmem"],
                dogruCevap: "Yüzmeyi severim"
            },
            {
                soru: "'What is your favorite food?' sorusunun anlamı nedir?",
                cevaplar: [ "Ne yemek istersin?","En sevdiğin yemek nedir?", "Yemek yedin mi?", "Yemek yapabilir misin?"],
                dogruCevap: "En sevdiğin yemek nedir?"
            },
            {
                soru: "'My mum is a teacher' cümlesinin anlamı nedir?",
                cevaplar: ["Annen öğretmendir", "Babam öğretmendir", "Annem öğretmendir", "Öğretmeni severim"],
                dogruCevap: "Annem öğretmendir"
            },
            {
                soru: "'Do you have a pet?' sorusunun anlamı nedir?",
                cevaplar: [ "Hayvanları sever misin?", "Köpeğin var mı?","Evcil hayvanın var mı?", "Kedi ister misin?"],
                dogruCevap: "Evcil hayvanın var mı?"
            },
            {
                soru: "'I am hungry' cümlesinin anlamı nedir?",
                cevaplar: ["Açım", "Tokum", "Susamışım", "Uykum var"],
                dogruCevap: "Açım"
            },
            {
                soru: "'What is the weather like today?' sorusunun anlamı nedir?",
                cevaplar: [ "Yarın hava nasıl olacak?", "Hava sıcak mı?", "Yağmur yağacak mı?", "Bugün hava nasıl?",],
                dogruCevap: "Bugün hava nasıl?"
            },
            {
                soru: "'I love my family' cümlesinin anlamı nedir?",
                cevaplar: [ "Arkadaşlarımı seviyorum", "Okulu seviyorum","Ailemi seviyorum", "Oyun oynamayı seviyorum"],
                dogruCevap: "Ailemi seviyorum"
            },
            {
                soru: "'What time do you wake up?' sorusunun anlamı nedir?",
                cevaplar: ["Saat kaçta uyanırsın?", "Saat kaçta uyursun?", "Kaçta okula gidersin?", "Ne zaman eve gelirsin?"],
                dogruCevap: "Saat kaçta uyanırsın?"
            },
            {
                soru: "'His favorite subject is English' cümlesinin anlamı nedir?",
                cevaplar: [ "İngilizce çok zor","En sevdiğim ders İngilizce", "En sevdiği ders İngilizce","İngilizce konuşabiliyorum"],
                dogruCevap: "En sevdiği ders İngilizce"
            },
            {
                soru: "'Do you like ice cream?' sorusunun anlamı nedir?",
                cevaplar: ["Dondurma sever misin?", "Çikolata sever misin?", "Dondurma ister misin?", "Tatlı sever misin?"],
                dogruCevap: "Dondurma sever misin?"
            },
            {
                soru: "'What would you like to drink?' sorusunun anlamı nedir?",
                cevaplar: ["Ne yersin?","Ne içmek istersin?",  "Ne yapıyorsun?", "Nereye gidiyorsun?"],
                dogruCevap: "Ne içmek istersin?"
            },
            {
                soru: "'She is 11 years' cümlesinin anlamı nedir?",
                cevaplar: ["11 yaşındadır", "11 yaşındayız", "11 yaşındayım", "11 yaşındalar"],
                dogruCevap: "11 yaşındadır"
            },
        
            {
                soru: "'Would you like to join us for dinner?' cümlesinin anlamı nedir?",
                cevaplar: [ "Yemek pişirebilir misin?","Bize akşam yemeğinde katılmak ister misin?", "Akşam yemeği yedin mi?", "Ne yemek istiyorsun?"],
                dogruCevap: "Bize akşam yemeğinde katılmak ister misin?"
            }
        ]
    },
    hayatBilgisi: {
        kolay: [
            {
                soru: "Hangisi kişisel bakım alışkanlıklarından biridir?",
                cevaplar: ["Geç uyumak", "Düzenli diş fırçalamak", "Bilgisayar oynamak", "Televizyon izlemek"],  // Doğru cevap 2. sıraya
                dogruCevap: "Düzenli diş fırçalamak"
            },
            {
                soru: "Hangisi sağlıklı beslenme alışkanlığıdır?",
                cevaplar: ["Fast food tüketmek", "Düzensiz beslenmek", "Bol su içmek", "Çok şeker yemek"],  // Doğru cevap 3. sıraya
                dogruCevap: "Bol su içmek"
            },
            {
                soru: "Trafik ışıklarında kırmızı ışık ne anlama gelir?",
                cevaplar: ["Hızlan", "Geç", "Dur", "Yavaşla"],  // Doğru cevap 3. sıraya
                dogruCevap: "Dur"
            },
            {
                soru: "Acil durumlarda hangi numarayı aramalıyız?",
                cevaplar: ["124", "133", "112", "155"],  // Doğru cevap 3. sıraya
                dogruCevap: "112"
            },
            {
                soru: "Türkiye'nin en yüksek dağı hangisidir?",
                cevaplar: ["Erciyes", "Ağrı Dağı", "Uludağ", "Kocatepe"],
                dogruCevap: "Ağrı Dağı"
            },
            
            {
                soru: "Hangisi tasarruf için yapılması gerekenlerden biridir?",
                cevaplar: ["Suyu açık bırakmak", "Gereksiz yanan ışıkları kapatmak", "Pencereyi açık bırakmak", "Klimayı açık tutmak"],  // Doğru cevap 2. sıraya
                dogruCevap: "Gereksiz yanan ışıkları kapatmak"
            },
            {
                soru: "Hangisi okul kurallarından biridir?",
                cevaplar: ["Sınıfta koşmak", "Ödevleri yapmamak", "Derse zamanında gelmek", "Arkadaşlarıyla kavga etmek"],  // Doğru cevap 3. sıraya
                dogruCevap: "Derse zamanında gelmek"
            },
            {
                soru: "Türkiye'nin en büyük gölü hangisidir?",
                cevaplar: ["Van Gölü", "Beyşehir Gölü", "İznik Gölü", "Tuz Gölü"],
                dogruCevap: "Van Gölü"
            },
            {
                soru: "Hangisi aile içi sorumluluklardan biridir?",
                cevaplar: ["Sürekli oyun oynamak", "Kardeşiyle kavga etmek", "Dağınık bırakmak", "Odasını toplamak"],  // Doğru cevap 4. sıraya
                dogruCevap: "Odasını toplamak"
            },
            {
                soru: "Hangisi doğa dostu bir davranıştır?",
                cevaplar: ["Çöp atmak", "Ağaç dikmek", "Çiçekleri koparmak", "Hayvanları rahatsız etmek"],  // Doğru cevap 2. sıraya
                dogruCevap: "Ağaç dikmek"
            },
            {
                soru: "Hangisi sağlıklı bir uyku alışkanlığıdır?",
                cevaplar: ["Erken yatmak", "Geç yatmak", "Düzensiz uyumak", "Gece oyun oynamak"],
                dogruCevap: "Erken yatmak"
            },
            {
                soru: "Hangi mevsimde havalar ısınır?",
                cevaplar: ["Kış", "Sonbahar", "İlkbahar", "Yaz"],  // Doğru cevap 3. sıraya
                dogruCevap: "İlkbahar"
            },
            {
                soru: "Türkiye'nin en kalabalık şehri hangisidir?",
                cevaplar: ["Ankara", "İzmir", "Bursa", "İstanbul"],  // Doğru cevap 4. sıraya
                dogruCevap: "İstanbul"
            },
            {
                soru: "Hangi yönde güneş doğar?",
                cevaplar: ["Doğu", "Batı", "Kuzey", "Güney"],
                dogruCevap: "Doğu"
            },
            {
                soru: "Dünya'nın şekli neye benzer?",
                cevaplar: ["Küre", "Küp", "Piramit", "Kare"],
                dogruCevap: "Küre"
            },
            { 
                soru: "Türkiye'nin kurucusu kimdir?",
                cevaplar: ["Fatih Sultan Mehmet", "Mustafa Kemal Atatürk", "Süleyman Demirel", "Abdülhamid Han"],
                dogruCevap: "Mustafa Kemal Atatürk"},


            {
                soru: "Türkiye'nin en büyük gölü hangisidir?",
                cevaplar: ["Tuz Gölü", "Beyşehir Gölü", "Van Gölü", "İznik Gölü"],  // Doğru cevap 3. sıraya
                dogruCevap: "Van Gölü"
            },
            {
                soru: "Hangi mevsimde kar yağar?",
                cevaplar: ["İlkbahar", "Yaz", "Kış", "Sonbahar"],
                dogruCevap: "Kış"
            },
            {
                soru: "Ülkemizin bayrağında hangi şekiller vardır?",
                cevaplar: ["Ay ve Yıldız", "Güneş", "Yıldız", "Üçgen"],
                dogruCevap: "Ay ve Yıldız"
            },
            {
                soru: "Hangi şehrimizde deniz yoktur?",
                cevaplar: [ "İstanbul", "İzmir", "Ankara", "Antalya"],
                dogruCevap: "Ankara"
            },
          
            {
                soru: "Hangi mevsimde okullar açılır?",
                cevaplar: ["Sonbahar", "İlkbahar", "Yaz", "Kış"],
                dogruCevap: "Sonbahar"
            },
            {
                soru: "Türkiye Cumhuriyeti'nin ilk Cumhurbaşkanı kimdir?",
                cevaplar: ["İsmet İnönü", "Recep Tayyip Erdoğan", "Mustafa Kemal Atatürk", "Süleyman Demirel"],
                dogruCevap: "Mustafa Kemal Atatürk"
            },
           
            {
                soru: "Türkiye'nin başkenti hangi şehirdir?",
                cevaplar: ["İstanbul", "Ankara", "İzmir", "Bursa"],  // Doğru cevap 2. sıraya
                dogruCevap: "Ankara"
            },
            {
                soru: "Hangi davranış arkadaşlarımızla ilişkilerimizi güçlendirir?",
                cevaplar: ["Paylaşmak", "Başkalarına yardım etmemek", "Kendini yalnız bırakmak", "Hep kendi fikirlerini savunmak"],
                dogruCevap: "Paylaşmak"
            },
            {
                soru: "Hangi deniz, Türkiye'nin güneyinde yer alır?",
                cevaplar: ["Karadeniz", "Ege Denizi", "Akdeniz", "Marmara Denizi"],
                dogruCevap: "Akdeniz"
            },
            {
                soru: "Türkiye kaç coğrafi bölgeye ayrılmıştır?",
                cevaplar: ["5", "6", "7", "8"],  // Doğru cevap 3. sıraya
                dogruCevap: "7"
            },
            {
                soru: "Hangisi Ege Bölgesi'nde yer alır?",
                cevaplar: ["Ankara", "İzmir", "Antalya", "İstanbul"],  // Doğru cevap 2. sıraya
                dogruCevap: "İzmir"
            },
            {  soru: "Türkiye Cumhuriyeti hangi yıl kuruldu?",
                cevaplar: ["1919", "1920", "1923", "1924"],
                 dogruCevap: "1923"
            },
            {
                soru: "Aşağıdaki hangi davranış sağlıklı bir yaşam için gereklidir?",
                cevaplar: ["Aç kalmak", "Bol su içmek", "Çok fazla televizyon izlemek", "Yalnız kalmak"],
                dogruCevap: "Bol su içmek"
            },

        ],
        orta: [
          
           
            {
                soru: "Hangisi iyi bir vatandaşın özelliklerinden biridir?",
                cevaplar: ["Kurallara uymamak", "Çevreyi kirletmek", "Vergisini ödemek", "Başkalarına saygısızlık yapmak"],  // Doğru cevap 3. sıraya
                dogruCevap: "Vergisini ödemek"
            },
          
            {
                soru: "Türkiye'nin en uzun nehri hangisidir?",
                cevaplar: ["Kızılırmak", "Yeşil��rmak", "Fırat", "Dicle"],
                dogruCevap: "Kızılırmak"
            },
            {
                soru: "Türkiye'nin Akdeniz Bölgesi'nde yer alan ve ünlü Alanya Kalesi'ne sahip olan şehir hangisidir?",
                cevaplar: ["Antalya", "Mersin", "Hatay", "Adana"],
                dogruCevap: "Antalya"
            },
           
            {
                soru: "Hangisi demokratik bir davranıştır?",
                cevaplar: ["Kendi düşüncesini zorla kabul ettirmek", "Arkadaşlarını dışlamak", "Kurallara uymamak", "Başkalarının fikirlerini dinlemek"],  // Doğru cevap 4. sıraya
                dogruCevap: "Başkalarının fikirlerini dinlemek"
            },
            {
                soru: "Türk milletinin ulusal bayramlarından biri olan 23 Nisan hangi yıl kutlanmaya başlanmıştır?",
                cevaplar: ["1920", "1923", "1927", "1930"],
                dogruCevap: "1920"
            },
            {
                soru: "Türkiye'nin en fazla yağış alan bölgesi hangisidir?",
                cevaplar: ["Karadeniz Bölgesi", "Akdeniz Bölgesi", "Güneydoğu Anadolu Bölgesi", "Marmara Bölgesi"],
                dogruCevap: "Karadeniz Bölgesi"
            },
            {
                soru: "Toprak alanı bakımından Türkiye'nin en büyük ili hangisidir?",
                cevaplar: ["Konya", "Ankara", "Bursa", "İzmir"],
                dogruCevap: "Konya"
            },
            {
                soru: "Dünya'nın uydusu hangisidir?",
                cevaplar: ["Güneş", "Ay", "Mars", "Kutup Yıldızı"],  // Doğru cevap 2. sıraya
                dogruCevap: "Ay"
            },
            {
                soru: "Türkiye'nin en batı noktası hangi ildedir?",
                cevaplar: ["Nevşehir", "Çanakkale", "Ordu", "Van"],  // Doğru cevap 2. sıraya
                dogruCevap: "Çanakkale"
            },
            {
                soru: "Hangi hayvan yumurtlayarak çoğalır?",
                cevaplar: ["Kedi", "Köpek", "Tavuk", "İnek"],  // Doğru cevap 3. sıraya
                dogruCevap: "Tavuk"
            },
            {
                soru: "Hangi gezegen 'Kırmızı Gezegen' olarak bilinir?",
                cevaplar: ["Venüs", "Jüpiter", "Merkür", "Mars"],  // Doğru cevap 4. sıraya
                dogruCevap: "Mars"
            },
            {
                soru: "Türkiye'nin Karadeniz Bölgesi'nde yer alan en büyük il hangisidir?",
                cevaplar: ["Trabzon", "Samsun", "Rize", "Artvin"],
                dogruCevap: "Samsun"
            },
            {
                soru: "Türkiye'nin en yüksek dağı hangisidir?",
                cevaplar: ["Erciyes", "Uludağ", "Ağrı Dağı", "Palandöken"],  // Doğru cevap 3. sıraya
                dogruCevap: "Ağrı Dağı"
            },
            {
                soru: "Hangisi Türkiye'nin en uzun nehridir?",
                cevaplar: ["Sakarya", "Kızılırmak", "Fırat", "Dicle"],  // Doğru cevap 2. sıraya
                dogruCevap: "Kızılırmak"
            },
           
           
            {
                soru: "Hangisi doğal afetlerden korunma yöntemidir?",
                cevaplar: ["Pencereyi açık bırakmak", "Deprem çantası hazırlamak", "Lambayı açık bırakmak", "Kapıyı kilitlememek"],  // Doğru cevap 2. sıraya
                dogruCevap: "Deprem çantası hazırlamak"
            },
            {
                soru: "Hangisi sağlıklı beslenme için önemlidir?",
                cevaplar: ["Az su içmek", "Sebze ve meyve yemek", "Çok şeker yemek", "Fast food yemek"],  // Doğru cevap 2. sıraya
                dogruCevap: "Sebze ve meyve yemek"
            }
        ],
        zor: [
            {
                soru: "Hangisi milli kültürümüzün özelliklerinden biridir?",
                cevaplar: ["Bencillik", "Misafirperverlik", "Saygısızlık", "Hoşgörüsüzlük"],  // Doğru cevap 2. sıraya
                dogruCevap: "Misafirperverlik"
            },
            {
                soru: "Hangisi Türkiye'nin en az yağış alan bölgesidir?",
                cevaplar: ["Akdeniz", "İç Anadolu", "Karadeniz", "Marmara"],  // Doğru cevap 2. sıraya
                dogruCevap: "İç Anadolu"
            },
            {
                soru: "Hangisi çevre kirliliğini önlemek için yapılabilecek davranışlardan biridir?",
                cevaplar: ["Çöpleri yere atmak", "Ağaçları kesmek", "Geri dönüşüm yapmak", "Suyu boşa akıtmak"],  // Doğru cevap 3. sıraya
                dogruCevap: "Geri dönüşüm yapmak"
            },
            {
                soru: "Hangisi toplum kurallarına uygun bir davranıştır?",
                cevaplar: ["Yüksek sesle konuşmak", "Çöp atmak", "Başkalarını rahatsız etmek", "Sıra beklemek"],  // Doğru cevap 4. sıraya
                dogruCevap: "Sıra beklemek"
            },
            {
                soru: "Türkiye'nin hangi bölgesinde daha çok tarım yapılır?",
                cevaplar: ["İç Anadolu Bölgesi", "Marmara Bölgesi", "Karadeniz Bölgesi", "Ege Bölgesi"],
                dogruCevap: "İç Anadolu Bölgesi"
            },
            {
                soru: "Dünyadaki en uzun nehir hangisidir?",
                cevaplar: ["Amazon Nehri", "Nil Nehri", "Yangtze Nehri", "Mısır Nehri"],
                dogruCevap: "Nil Nehri"
            },
            {
                soru: "Dünyanın en büyük okyanusu hangisidir?",
                cevaplar: ["Atlas Okyanusu", "Pasifik Okyanusu", "Hint Okyanusu", "Arktik Okyanusu"],
                dogruCevap: "Pasifik Okyanusu"
            },
            {
                soru: "Hangi ülke Avrupa kıtasında yer almaz?",
                cevaplar: ["Fransa", "İspanya", "Brezilya", "Almanya"],
                dogruCevap: "Brezilya"
            },
            {
                soru: "Aşağıdakilerden hangisi bir enerji kaynağı değildir?",
                cevaplar: ["Güneş", "Plastik", "Rüzgar", "Su"],  // Doğru cevap 2. sıraya
                dogruCevap: "Plastik"
            },
            {
                soru: "Dünya'nın en büyük okyanusu hangisidir?",
                cevaplar: ["Atlantik Okyanusu", "Hint Okyanusu", "Pasifik Okyanusu", "Arktik Okyanusu"],  // Doğru cevap 3. sıraya
                dogruCevap: "Pasifik Okyanusu"
            },
         
            {
                soru: "Hangisi bir mıknatıs tarafından çekilmez?",
                cevaplar: ["Tahta", "Demir", "Nikel", "Kobalt"],  // Doğru cevap 1. sıraya
                dogruCevap: "Tahta"
            },
            {
                soru: "Hangi ülke, dünyanın en kalabalık nüfusuna sahip ülkedir?",
                cevaplar: ["Çin", "Hindistan", "Amerika", "Brezilya"],
                dogruCevap: "Çin"
            },
            {
                soru: "Hangisi bir yalıtkan maddedir?",
                cevaplar: ["Bakır", "Plastik", "Demir", "Altın"],  // Doğru cevap 2. sıraya
                dogruCevap: "Plastik"
            },
            {
                soru: "Dünyadaki en büyük orman hangisidir?",
                cevaplar: ["Amazon Ormanı", "Sibirya Ormanı", "Kongo Ormanı", "Afrika Ormanı"],
                dogruCevap: "Amazon Ormanı"
            },
        ]
    },
    fenBilgisi: {
        kolay: [
            {
                soru: "Aşağıdakilerden hangisi bir duyu organı değildir?",
                cevaplar: ["Göz", "Kulak", "Dirsek", "Burun"],
                dogruCevap: "Dirsek"
            },
            
            {
                soru: "Suyun donma noktası kaç derecedir?",
                cevaplar: ["0", "-1", "1", "2"],
                dogruCevap: "0"
            },
            {
                soru: "İnsan vücudundaki en büyük organ hangisidir?",
                cevaplar: ["Kalp", "Deri", "Mide", "Karaciğer"],
                dogruCevap: "Deri"
            },
            {
                soru: "Hangi hayvan memeli değildir?",
                cevaplar: ["Yunus", "Yarasa", "Kertenkele", "Kanguru"],
                dogruCevap: "Kertenkele"
            },
            
            {
                soru: "Bitkilerin besin üretmek için ihtiyaç duymadığı şey nedir?",
                cevaplar: ["Su", "Işık", "Toprak", "Televizyon"],
                dogruCevap: "Televizyon"
            },
            {
                soru: "Hangi madde katı halden sıvı hale geçer?",
                cevaplar: ["Buz", "Su", "Buhar", "Gaz"],
                dogruCevap: "Buz"
            },
           
            {
                soru: "Dünya'nın uydusu hangisidir?",
                cevaplar: ["Güneş", "Mars", "Ay", "Yıldızlar"],
                dogruCevap: "Ay"
            },
           
            {
                soru: "Hangi hayvan yumurtlayarak çoğalır?",
                cevaplar: ["Kedi", "Köpek", "Tavuk", "İnek"],
                dogruCevap: "Tavuk"
            },
            {
                soru: "Hangi gezegen 'Kırmızı Gezegen' olarak bilinir?",
                cevaplar: ["Mars", "Venüs", "Jüpiter", "Merkür"],
                dogruCevap: "Mars"
            },
            {
                soru: "Hangi hayvan memeli değildir?",
                cevaplar: ["Balina", "Yunus", "Timsah", "Fok"],
                dogruCevap: "Timsah"
            },
            {
                soru: "Dünya'nın uydusunun adı nedir?",
                cevaplar: ["Ay", "Güneş", "Mars", "Venüs"],
                dogruCevap: "Ay"
            },
            {
                soru: "Aşağıdakilerden hangisi bir enerji kaynağı değildir?",
                cevaplar: ["Rüzgar", "Güneş", "Plastik", "Su"],
                dogruCevap: "Plastik"
            },
            {
                soru: "Hangi hayvanın sırtında dikenleri vardır?",
                cevaplar: ["Köpek", "İguana", "Kirpi", "Yarasa"],
                dogruCevap: "Kirpi"
            },
           
            {
                soru: "Hangi hayvan uçamaz?",
                cevaplar: ["Penguen", "Serçe", "Güvercin", "Kartal"],
                dogruCevap: "Penguen"
            },
            {
                soru: "Hangi hayvan uçabilen tek memelidir?",
                cevaplar: ["Yarasa", "Penguen", "Tavuk", "Kedi"],
                dogruCevap: "Yarasa"
            },
           
            {
                soru: "Hangisi bir katı maddedir?",
                cevaplar: ["Su", "Taş", "Hava", "Buhar"],  // Doğru cevap 2. sıraya
                dogruCevap: "Taş"
            },
            
            {
                soru: "Hangisi bir doğal ses kaynağıdır?",
                cevaplar: ["Radyo", "Şelale", "Telefon", "Televizyon"],  // Doğru cevap 2. sıraya
                dogruCevap: "Şelale"
            },
            {
                soru: "Hangisi bir yapay ışık kaynağıdır?",
                cevaplar: ["Güneş", "Fener", "Yıldızlar", "Ateş böceği"],  // Doğru cevap 2. sıraya
                dogruCevap: "Fener"
            },
            {
                soru: "Hangisi bir sıvı maddedir?",
                cevaplar: ["Kalem", "Süt", "Masa", "Duman"],  // Doğru cevap 2. sıraya
                dogruCevap: "Süt"
            },
            {
                soru: "Hangisi bir gaz maddedir?",
                cevaplar: ["Su", "Hava", "Demir", "Tahta"],  // Doğru cevap 2. sıraya
                dogruCevap: "Hava"
            },
            {
                soru: "Hangisi bir doğal ışık kaynağıdır?",
                cevaplar: ["Ampul", "Yıldız", "Mum", "El feneri"],  // Doğru cevap 2. sıraya
                dogruCevap: "Yıldız"
            },
          
            {
                soru: "Hangisi bir sindirim sistemi organıdır?",
                cevaplar: ["Mide", "Akciğer", "Kalp", "Beyin"],  // Doğru cevap 1. sıraya
                dogruCevap: "Mide"
            },
            {
                soru: "Hangisi hava olaylarından biridir?",
                cevaplar: ["Deprem", "Rüzgar", "Volkan patlaması", "Heyelan"],
                dogruCevap: "Rüzgar"
            },
            {
                soru: "Hangisi omurgasız bir hayvandır?",
                cevaplar: ["Kedi", "Ahtapot", "Balık", "İnek"],  // Doğru cevap 2. sıraya
                dogruCevap: "Ahtapot"
            },
            {
                soru: "Hangisi bir çözünme olayıdır?",
                cevaplar: ["Camın kırılması", "Kağıdın yırtılması", "Şekerin suda erimesi", "Buzun kırılması"],  // Doğru cevap 3. sıraya
                dogruCevap: "Şekerin suda erimesi"
            },
         
        ],
        orta: [
            {
                soru: "Hangi vitamin güneş ışığı yardımıyla derimizde üretilir?",
                cevaplar: ["B vitamini", "C vitamini", "A vitamini", "D vitamini"],  // Doğru cevap 4. sıraya
                dogruCevap: "D vitamini"
            },
           
            {
                soru: "Hangi gezegen Güneş'e en yakındır?",
                cevaplar: ["Venüs", "Merkür", "Mars", "Dünya"],  // Doru cevap 2. sıraya
                dogruCevap: "Merkür"
            },
            {
                soru: "Dünyanın kendi ekseni etrafında dönmesi sonucu hangi olay gerçekleşir?",
                cevaplar: ["Mevsimler", "Gece ve gündüz", "Ay Tutulması", "Güneş Tutulması"],
                dogruCevap: "Gece ve gündüz"
            },
            {
                "soru": "Hangisi çevremizi kirleten bir etki değildir?",
                "cevaplar": ["Sanayi atıkları", "Orman yangınları", "Geri dönüşüm", "Egzoz gazları"],
                "dogruCevap": "Geri dönüşüm"
            },
            {
                soru: "Hangi besin maddesi bağışıklık sistemini güçlendirir?",
                cevaplar: ["Protein", "Yağ", "Vitamin C", "Karbonhidrat"],
                dogruCevap: "Vitamin C"
            },
           
            {
                soru: "Hangi hayvan hem karada hem suda yaşar?",
                cevaplar: ["Balık", "Kurbağa", "Kuş", "Aslan"],  // Doğru cevap 2. sıraya
                dogruCevap: "Kurbağa"
            },
            {
                soru: "Dünya'nın en dış tabakası hangisidir?",
                cevaplar: ["Çekirdek", "Manto", "Kabuk", "Atmosfer"],
                dogruCevap: "Atmosfer"
            },
            {
                soru: "Gökkuşağı oluşması için hangi iki doğa olayı gereklidir?",
                cevaplar: ["Rüzgar ve Güneş", "Yağmur ve Rüzgar", "Güneş ve Yağmur", "Kar ve Güneş"],
                dogruCevap: "Güneş ve Yağmur"
            },
            {
                soru: "Hangi organ kanı vücuda pompalar?",
                cevaplar: ["Akciğer", "Böbrek", "Kalp", "Karaciğer"],  // Doğru cevap 3. sıraya
                dogruCevap: "Kalp"
            },
            {
                soru: "Ay neden ışık saçar gibi görünür?",
                cevaplar: ["Kendi ışığını üretir", "Güneş ışığını yansıtır", "Dünya'dan gelen ışığı yansıtır", "Atmosferden gelen ışığı emer"],
                dogruCevap: "Güneş ışığını yansıtır"
            },
            {
                soru: "Hangi hayvan hem karada hem suda yaşar?",
                cevaplar: ["Balık", "Kurbağa", "Kuş", "Aslan"],  // Doğru cevap 2. sıraya
                dogruCevap: "Kurbağa"
            },
           
            {
                soru: "Hangi element saf halde oda sıcaklığında sıvıdır?",
                cevaplar: ["Altın", "Bakır", "Cıva", "Demir"],  // Doğru cevap 3. sıraya
                dogruCevap: "Cıva"
            },
          
            {
                soru: "İnsan vücudunda kaç çeşit kan grubu vardır?",
                cevaplar: ["2", "4", "6", "8"],
                dogruCevap: "4"
            },

        ],
        zor: [

            {
                soru: "İnsan vücudundaki en küçük kemik hangisidir?",
                cevaplar: ["Çekiç", "Bilek", "Örs", "Üzengi"],  // Doğru cevap 4. sıraya
                dogruCevap: "Üzengi"
            },
            {
                soru: "Hangi madde doğada sıvı, katı ve gaz halinde bulunabilir?",
                cevaplar: ["Hava", "Su", "Toprak", "Ateş"],
                dogruCevap: "Su"
            },
           
            {
                soru: "Hangisi bir enerji kaynağı değildir?",
                cevaplar: ["Güneş", "Plastik", "Rüzgar", "Su"],  // Doğru cevap 2. sıraya
                dogruCevap: "Plastik"
            },
            {
                soru: "İnsan vücudundaki en uzun kemik hangisidir?",
                cevaplar: ["Kaval kemiği", "Kaburga", "Kol kemiği", "Uyluk kemiği"],  // Doğru cevap 4. sıraya
                dogruCevap: "Uyluk kemiği"
            },
            {
                soru: "Hangisi bir fiziksel değişimdir?",
                cevaplar: ["Ekmeğin küflenmesi", "Demirin paslanması", "Yaprağın sararması", "Suyun donması"],  // Doğru cevap 4. sıraya
                dogruCevap: "Suyun donması"
            },
            {
                soru: "Hangi besin kaynağı kemiklerimizi güçlendirir?",
                cevaplar: ["Protein", "Vitamin C", "Kalsiyum", "Demir"],
                dogruCevap: "Kalsiyum"
            },
            {
                soru: "Elektrik akımını en iyi ileten madde hangisidir?",
                 cevaplar: ["Ahşap", "Demir", "Plastik", "Cam"],
                dogruCevap: "Demir"
            },
            {
                soru: "Bitkiler fotosentez yaparken hangi gazı kullanır?",
                cevaplar: ["Oksijen", "Karbondioksit", "Azot", "Helyum"],
                dogruCevap: "Karbondioksit"
            },
            {
                soru: "Hangisi bir doğal ışık kaynağıdır?",
                cevaplar: ["Ampul", "Güneş", "Mum", "El feneri"],  // Doğru cevap 2. sıraya
                dogruCevap: "Güneş"
            },
            {
                soru: "İnsan vücudundaki kemik sayısı kaçtır?",
                cevaplar: ["206", "205", "207", "208"],  // Doğru cevap 1. sıraya
                dogruCevap: "206"
            },
            {
                soru: "Ses hangi ortamda yayılmaz?",
                cevaplar: ["Uzay boşluğu", "Su", "Hava", "Metal"],  // Doğru cevap 1. sıraya
                dogruCevap: "Uzay boşluğu"
            },
            {
                soru: "Hangi element suyun bileşenidir?",
                cevaplar: ["Hidrojen", "Demir", "Karbon", "Azot"],  // Doğru cevap 1. sıraya
                dogruCevap: "Hidrojen"
            },

            {
                soru: "Hangi element saf halde oda sıcaklığında sıvıdır?",
                cevaplar: ["Altın", "Bakır", "Cıva", "Demir"],  // Doğru cevap 3. sıraya
                dogruCevap: "Cıva"
            },
            {
                soru: "Dünya'nın en dış tabakası hangisidir?",
                cevaplar: ["Çekirdek", "Manto", "Kabuk", "Atmosfer"],  // Doğru cevap 4. sıraya
                dogruCevap: "Atmosfer"
            },
            {
                soru: "Hangi hayvan memeli değildir?",
                cevaplar: ["Yunus", "Yarasa", "Kertenkele", "Kanguru"],  // Doğru cevap 3. sıraya
                dogruCevap: "Kertenkele"
            },
            {
                soru: "Dünya'nın hangi katmanı üzerinde yaşam süreriz?",
                cevaplar: ["Çekirdek", "Manto", "Yerkabuğu", "Atmosfer"],
                dogruCevap: "Yerkabuğu"
            },
          
            
          
        ]
    }
};

// Rastgele sayı üretme fonksiyonu (0 ile max-1 arası)
function rastgeleSayi(max) {
    return Math.floor(Math.random() * max);
}

// Soru gösterme fonksiyonu - güncellendi
function soruGoster() {
    const aktifSorular = sorular[aktifKategori][secilenZorluk];
    
    if (aktifSoruIndex >= aktifSorular.length) {
        alert('Tüm sorular bitti!');
        return;
    }

    const soru = aktifSorular[aktifSoruIndex];
    document.getElementById('soru').textContent = soru.soru;
    
    const cevaplarDiv = document.getElementById('cevaplar');
    cevaplarDiv.innerHTML = '';
    
    // Cevapları karıştır
    const karisikCevaplar = [...soru.cevaplar];
    const dogruCevapIndex = karisikCevaplar.indexOf(soru.dogruCevap);
    const yeniIndex = rastgeleSayi(4); // 0-3 arası rastgele sayı
    
    // Doğru cevabın yerini değiştir
    [karisikCevaplar[dogruCevapIndex], karisikCevaplar[yeniIndex]] = 
    [karisikCevaplar[yeniIndex], karisikCevaplar[dogruCevapIndex]];
    
    karisikCevaplar.forEach(cevap => {
        const button = document.createElement('button');
        button.className = 'cevap-button';
        button.textContent = cevap;
        button.onclick = () => cevapKontrol(cevap);
        cevaplarDiv.appendChild(button);
    });
}

// Ses dosyalarını tanımlama
const sesDogru = new Audio('sounds/dogru.mp3');
const sesYanlis = new Audio('sounds/yanlis.mp3');

// Cevap kontrol fonksiyonu - güncellenmiş versiyon
function cevapKontrol(cevap) {
    clearInterval(zamanlayici);
    
    const aktifSorular = sorular[aktifKategori][secilenZorluk];
    const soru = aktifSorular[aktifSoruIndex];
    const dogruMu = cevap === soru.dogruCevap;
    
    // Tıklanan butonu bul
    const butonlar = document.querySelectorAll('.cevap-button');
    const secilenButon = Array.from(butonlar).find(btn => btn.textContent === cevap);
    
    let kazanilanPuan = 0; // Puanı sıfırla

    if (dogruMu) {
        dogruSayisi++;
        document.getElementById('dogru').textContent = dogruSayisi;

        // Zorluk seviyesine göre puan hesapla
        if (secilenZorluk === 'kolay') {
            kazanilanPuan = 50; // Kolay seviyede 50 puan
        } else if (secilenZorluk === 'orta') {
            kazanilanPuan = 70; // Orta seviyede 70 puan
        } else if (secilenZorluk === 'zor') {
            kazanilanPuan = 100; // Zor seviyede 100 puan
        }

        let toplamPuan = parseInt(document.getElementById('toplam-puan').textContent);
        toplamPuan += kazanilanPuan;
        document.getElementById('toplam-puan').textContent = toplamPuan;

        // Doğru cevap efekti
        secilenButon.classList.add('dogru');
        
        // Sesli geri bildirim
        sesDogru.play();
    } else {
        yanlisSayisi++;
        document.getElementById('yanlis').textContent = yanlisSayisi;
        
        // Yanlış cevap efekti
        secilenButon.classList.add('yanlis');
        
        // Doğru cevabı göster
        const dogruButon = Array.from(butonlar).find(btn => btn.textContent === soru.dogruCevap);
        dogruButon.classList.add('dogru');
        
        // Sesli geri bildirim
        sesYanlis.play();
    }
    
    // Butonları devre dışı bırak
    butonlar.forEach(btn => {
        btn.disabled = true;
        btn.style.cursor = 'default';
    });
    
    // Sonraki soruya geç
    setTimeout(() => {
        aktifSoruIndex++;
        if (aktifSoruIndex < aktifSorular.length) {
            soruGoster();
            sureyiBaslat();
        } else {
            // Mevcut zorluk seviyesindeki sorular bittiğinde bir sonraki zorluk seviyesine geç
            if (secilenZorluk === 'kolay') {
                secilenZorluk = 'orta';
            } else if (secilenZorluk === 'orta') {
                secilenZorluk = 'zor';
            } else {
                // Tüm zorluk seviyeleri bittiğinde quiz bitir
                quizBitir();
                return;
            }
            aktifSoruIndex = 0; // Yeni zorluk seviyesindeki soruları başlat
            soruGoster(); // Yeni soruları göster
            sureyiBaslat(); // Süreyi başlat
        }
    }, 1500);
}

function rozetKontrol(puan) {
    let rozet = SEVIYELER.CAYLAK.emoji;  // Başlangıç rozeti Çaylak olarak değiştirildi
    
    if (puan >= SEVIYELER.EFSANE.min) rozet = SEVIYELER.EFSANE.emoji;
    else if (puan >= SEVIYELER.UZMAN.min) rozet = SEVIYELER.UZMAN.emoji;
    else if (puan >= SEVIYELER.USTA.min) rozet = SEVIYELER.USTA.emoji;
    else if (puan >= SEVIYELER.ACEMI.min) rozet = SEVIYELER.ACEMI.emoji;
    else if (puan >= SEVIYELER.CIRAK.min) rozet = SEVIYELER.CIRAK.emoji;
    
    document.querySelector('.rozet').textContent = rozet;
    return rozet;
}

// Kategori değiştirme için buton kontrolü
function kategoriDegistir(kategori) {
    document.querySelectorAll('.siralama-btn').forEach(btn => {
        btn.classList.remove('aktif');
    });
    document.querySelector(`.siralama-btn[onclick*="${kategori}"]`).classList.add('aktif');
    siralamayiGoster(kategori);
}

// Rozet animasyonu için fonksiyon
function rozetAnimasyonuGoster(rozetTipi) {
    const rozetContainer = document.createElement('div');
    rozetContainer.className = 'rozet-animasyon';
    
    const rozetIcon = document.createElement('div');
    rozetIcon.className = 'rozet-icon';
    rozetIcon.innerHTML = SEVIYELER[rozetTipi].emoji;
    
    const rozetMesaj = document.createElement('div');
    rozetMesaj.className = 'rozet-mesaj';
    rozetMesaj.textContent = `Tebrikler! ${SEVIYELER[rozetTipi].ad} rozetini kazandın!`;
    
    rozetContainer.appendChild(rozetIcon);
    rozetContainer.appendChild(rozetMesaj);
    document.body.appendChild(rozetContainer);
    
    // Konfeti efekti
    konfetiEfekti();
    
    // 3 saniye sonra animasyonu kaldır
    setTimeout(() => {
        rozetContainer.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(rozetContainer);
        }, 1000);
    }, 3000);
}

// Skor tablosunu aç/kapat fonksiyonları
function skorTablosuToggle() {
    const skorTablosu = document.getElementById('skor-tablosu');
    if (skorTablosu.classList.contains('gizli')) {
        skorTablosu.classList.remove('gizli');
        siralamayiGoster('matematik');
    } else {
        skorTablosu.classList.add('gizli');
    }
}

// Skor tablosunu kapatma fonksiyonu
function skorTablosunuKapat() {
    document.getElementById('skor-tablosu').classList.add('gizli');
}

// Event listener'lar
document.getElementById('skor-tablosu-btn').addEventListener('click', skorTablosuToggle);
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.getElementById('skor-tablosu').classList.add('gizli');
    }
});




// Fen Bilgisi Zor Seviye Sorular


// Zorluk seviyesini değiştirme fonksiyonu
// function zorlukDegistir() {
//     // Zorluk seviyelerini tanımla
//     const zorluklar = ['kolay', 'orta', 'zor'];
    
//     // Mevcut zorluk seviyesinin indeksini bul
//     let mevcutIndex = zorluklar.indexOf(secilenZorluk);
    
//     // Zorluk seviyesini değiştir
//     mevcutIndex = (mevcutIndex + 1) % zorluklar.length; // Sonraki zorluk seviyesine geç
//     secilenZorluk = zorluklar[mevcutIndex];
    
//     // Zorluk seviyesini güncelle
//     document.querySelectorAll('.zorluk-btn').forEach(btn => {
//         btn.classList.remove('aktif');
//     });
//     document.querySelector(`.zorluk-btn.${secilenZorluk}`).classList.add('aktif');
    
//     // Soruları göster
//     aktifSoruIndex = 0; // Soruları baştan başlat
//     soruGoster(); // Yeni soruları göster
// }

