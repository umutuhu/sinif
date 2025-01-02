const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 3000 });

const odalar = new Map();

server.on('connection', (ws) => {
    let oyuncuOdasi = null;
    let oyuncuId = null;

    ws.on('message', (mesaj) => {
        try {
            const veri = JSON.parse(mesaj);
            
            switch(veri.tip) {
                case 'odayaKatil':
                    let oda = odalar.get(veri.odaKodu);
                    
                    if (!oda) {
                        // Yeni oda oluştur
                        oda = {
                            host: {
                                ws: ws,
                                isim: veri.isim
                            },
                            guest: null
                        };
                        odalar.set(veri.odaKodu, oda);
                        oyuncuOdasi = veri.odaKodu;
                        oyuncuId = 'host';
                        
                        ws.send(JSON.stringify({
                            tip: 'odaBilgisi',
                            oyuncuId: oyuncuId,
                            mesaj: 'Rakip bekleniyor...'
                        }));
                    } else if (!oda.guest) {
                        // İkinci oyuncuyu ekle
                        oda.guest = {
                            ws: ws,
                            isim: veri.isim
                        };
                        oyuncuOdasi = veri.odaKodu;
                        oyuncuId = 'guest';
                        
                        // Her iki oyuncuya da bilgi gönder
                        oda.host.ws.send(JSON.stringify({
                            tip: 'oyuncuKatildi',
                            rakipId: 'guest',
                            rakipIsim: veri.isim
                        }));
                        
                        ws.send(JSON.stringify({
                            tip: 'oyuncuKatildi',
                            rakipId: 'host',
                            rakipIsim: oda.host.isim
                        }));
                    } else {
                        ws.send(JSON.stringify({
                            tip: 'hata',
                            mesaj: 'Oda dolu!'
                        }));
                    }
                    break;
                    
                case 'hamle':
                    const odaHedef = odalar.get(veri.odaKodu);
                    if (odaHedef) {
                        const rakip = veri.oyuncuId === 'host' ? odaHedef.guest : odaHedef.host;
                        rakip.ws.send(JSON.stringify({
                            tip: 'hamle',
                            hamle: veri.hamle
                        }));
                    }
                    break;
            }
        } catch (hata) {
            console.error('Mesaj işleme hatası:', hata);
            ws.send(JSON.stringify({
                tip: 'hata',
                mesaj: 'Sunucu hatası!'
            }));
        }
    });

    ws.on('close', () => {
        if (oyuncuOdasi) {
            const oda = odalar.get(oyuncuOdasi);
            if (oda) {
                // Diğer oyuncuya rakibin ayrıldığını bildir
                const rakip = oyuncuId === 'host' ? oda.guest : oda.host;
                if (rakip) {
                    rakip.ws.send(JSON.stringify({
                        tip: 'rakipAyrildi',
                        mesaj: 'Rakip oyundan ayrıldı!'
                    }));
                }
                
                // Odayı temizle
                odalar.delete(oyuncuOdasi);
            }
        }
    });
});

// Sunucu hatalarını yakala
server.on('error', (hata) => {
    console.error('WebSocket sunucu hatası:', hata);
});

process.on('uncaughtException', (hata) => {
    console.error('Yakalanmamış hata:', hata);
}); 