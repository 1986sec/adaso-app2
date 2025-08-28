const { getPool } = require('../db');

async function listVisits() {
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT id, to_char(tarih,'YYYY-MM-DD') as tarih, saat, firma, ziyaretci, amac, durum,
            notlar, detayli_bilgi AS "detayliBilgi", katilimcilar, lokasyon, dosyalar,
            COALESCE(gelir_tutari,0) AS "gelirTutari", COALESCE(gider_tutari,0) AS "giderTutari",
            finansal_aciklama AS "finansalAciklama"
     FROM ziyaretler ORDER BY id DESC`
  );
  return rows;
}

async function createVisit(payload) {
  const pool = getPool();
  
  // Debug: Gelen veriyi logla
  console.log('🔍 createVisit - Gelen payload:', JSON.stringify(payload, null, 2));
  console.log('🔍 createVisit - dosyalar tipi:', typeof payload.dosyalar);
  console.log('🔍 createVisit - dosyalar değeri:', payload.dosyalar);
  
  // dosyalar alanını düzgün formatla
  let dosyalar = null;
  if (payload.dosyalar) {
    try {
      let rawDosyalar = payload.dosyalar;
      
      // Eğer string ise
      if (typeof rawDosyalar === 'string') {
        console.log('🔍 String dosyalar işleniyor:', rawDosyalar);
        
        // Önce string'i temizle
        rawDosyalar = rawDosyalar.trim();
        
        // Eğer geçersiz JSON formatı varsa düzelt
        if (rawDosyalar.startsWith('{') && rawDosyalar.endsWith('}')) {
          // {"dosya.pdf"} formatını ["dosya.pdf"] formatına çevir
          const fileName = rawDosyalar.replace(/[{}"]/g, '');
          console.log('🔍 Geçersiz JSON formatı düzeltiliyor:', rawDosyalar, '->', fileName);
          dosyalar = [fileName];
        } else {
          // Normal JSON parse dene
          try {
            dosyalar = JSON.parse(rawDosyalar);
          } catch (parseError) {
            console.log('🔍 JSON parse başarısız, string olarak alınıyor:', rawDosyalar);
            dosyalar = [rawDosyalar];
          }
        }
      } else {
        dosyalar = rawDosyalar;
      }
      
      // Array değilse array'e çevir
      if (!Array.isArray(dosyalar)) {
        console.log('🔍 Array değil, array\'e çevriliyor:', dosyalar);
        dosyalar = [dosyalar];
      }
      
             // Array içindeki elemanları temizle ve dosya adlarını düzelt
       dosyalar = dosyalar.filter(item => item && typeof item === 'string').map(item => {
         let fileName = item.trim();
         
         // Türkçe karakterleri ve özel karakterleri düzelt
         fileName = fileName
           .replace(/ü/g, 'u')
           .replace(/Ü/g, 'U')
           .replace(/ı/g, 'i')
           .replace(/İ/g, 'I')
           .replace(/ğ/g, 'g')
           .replace(/Ğ/g, 'G')
           .replace(/ş/g, 's')
           .replace(/Ş/g, 'S')
           .replace(/ç/g, 'c')
           .replace(/Ç/g, 'C')
           .replace(/ö/g, 'o')
           .replace(/Ö/g, 'O')
           .replace(/[^a-zA-Z0-9._-]/g, '_'); // Sadece güvenli karakterleri bırak
         
         console.log('🔍 Dosya adı düzeltildi:', item, '->', fileName);
         return fileName;
       });
      
      console.log('🔍 Final dosyalar:', dosyalar);
      
             // Eğer boş array ise null yap
       if (dosyalar.length === 0) {
         dosyalar = null;
       }
       
       // Dosyalar array'ini JSON string'e çevir (PostgreSQL için)
       if (dosyalar && Array.isArray(dosyalar)) {
         dosyalar = JSON.stringify(dosyalar);
         console.log('🔍 Dosyalar JSON string\'e çevrildi:', dosyalar);
       }
      
    } catch (error) {
      console.error('❌ Dosyalar işleme hatası:', error);
      console.error('❌ Hatalı dosyalar değeri:', payload.dosyalar);
      dosyalar = null;
    }
  }
  
     // Debug: Son dosyalar değerini logla
   console.log('🔍 Database\'e gönderilecek dosyalar:', dosyalar);
   console.log('🔍 Dosyalar JSON string:', JSON.stringify(dosyalar));
   
   const { rows } = await pool.query(
     `INSERT INTO ziyaretler (tarih, saat, firma, ziyaretci, amac, durum, notlar, detayli_bilgi, katilimcilar, lokasyon, dosyalar, gelir_tutari, gider_tutari, finansal_aciklama)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      RETURNING id, to_char(tarih,'YYYY-MM-DD') as tarih, saat, firma, ziyaretci, amac, durum,
                notlar, detayli_bilgi AS "detayliBilgi", katilimcilar, lokasyon, dosyalar,
                COALESCE(gelir_tutari,0) AS "gelirTutari", COALESCE(gider_tutari,0) AS "giderTutari",
                finansal_aciklama AS "finansalAciklama"`,
     [payload.tarih, payload.saat, payload.firma, payload.ziyaretci, payload.amac, payload.durum, payload.notlar || null, payload.detayliBilgi || null, payload.katilimcilar || null, payload.lokasyon || null, dosyalar, payload.gelirTutari || null, payload.giderTutari || null, payload.finansalAciklama || null]
   );
  return rows[0];
}

async function findVisitById(id) {
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT id, to_char(tarih,'YYYY-MM-DD') as tarih, saat, firma, ziyaretci, amac, durum,
            notlar, detayli_bilgi AS "detayliBilgi", katilimcilar, lokasyon, dosyalar,
            COALESCE(gelir_tutari,0) AS "gelirTutari", COALESCE(gider_tutari,0) AS "giderTutari",
            finansal_aciklama AS "finansalAciklama"
     FROM ziyaretler WHERE id=$1`,
    [id]
  );
  return rows[0] || null;
}

async function updateVisit(id, fields) {
  const pool = getPool();
  
  // dosyalar alanını düzgün formatla
  if (fields.dosyalar) {
    try {
      let rawDosyalar = fields.dosyalar;
      
      // Eğer string ise
      if (typeof rawDosyalar === 'string') {
        console.log('🔍 Update - String dosyalar işleniyor:', rawDosyalar);
        
        // Önce string'i temizle
        rawDosyalar = rawDosyalar.trim();
        
        // Eğer geçersiz JSON formatı varsa düzelt
        if (rawDosyalar.startsWith('{') && rawDosyalar.endsWith('}')) {
          // {"dosya.pdf"} formatını ["dosya.pdf"] formatına çevir
          const fileName = rawDosyalar.replace(/[{}"]/g, '');
          console.log('🔍 Update - Geçersiz JSON formatı düzeltiliyor:', rawDosyalar, '->', fileName);
          fields.dosyalar = [fileName];
        } else {
          // Normal JSON parse dene
          try {
            fields.dosyalar = JSON.parse(rawDosyalar);
          } catch (parseError) {
            console.log('🔍 Update - JSON parse başarısız, string olarak alınıyor:', rawDosyalar);
            fields.dosyalar = [rawDosyalar];
          }
        }
      }
      
      // Array değilse array'e çevir
      if (!Array.isArray(fields.dosyalar)) {
        console.log('🔍 Update - Array değil, array\'e çevriliyor:', fields.dosyalar);
        fields.dosyalar = [fields.dosyalar];
      }
      
             // Array içindeki elemanları temizle ve dosya adlarını düzelt
       fields.dosyalar = fields.dosyalar.filter(item => item && typeof item === 'string').map(item => {
         let fileName = item.trim();
         
         // Türkçe karakterleri ve özel karakterleri düzelt
         fileName = fileName
           .replace(/ü/g, 'u')
           .replace(/Ü/g, 'U')
           .replace(/ı/g, 'i')
           .replace(/İ/g, 'I')
           .replace(/ğ/g, 'g')
           .replace(/Ğ/g, 'G')
           .replace(/ş/g, 's')
           .replace(/Ş/g, 'S')
           .replace(/ç/g, 'c')
           .replace(/Ç/g, 'C')
           .replace(/ö/g, 'o')
           .replace(/Ö/g, 'O')
           .replace(/[^a-zA-Z0-9._-]/g, '_'); // Sadece güvenli karakterleri bırak
         
         console.log('🔍 Update - Dosya adı düzeltildi:', item, '->', fileName);
         return fileName;
       });
      
      console.log('🔍 Update - Final dosyalar:', fields.dosyalar);
      
             // Eğer boş array ise null yap
       if (fields.dosyalar.length === 0) {
         fields.dosyalar = null;
       }
       
       // Dosyalar array'ini JSON string'e çevir (PostgreSQL için)
       if (fields.dosyalar && Array.isArray(fields.dosyalar)) {
         fields.dosyalar = JSON.stringify(fields.dosyalar);
         console.log('🔍 Update - Dosyalar JSON string\'e çevrildi:', fields.dosyalar);
       }
      
    } catch (error) {
      console.error('❌ Update - Dosyalar işleme hatası:', error);
      console.error('❌ Update - Hatalı dosyalar değeri:', fields.dosyalar);
      fields.dosyalar = null;
    }
  }
  
  const map = {
    tarih: 'tarih',
    saat: 'saat',
    firma: 'firma',
    ziyaretci: 'ziyaretci',
    amac: 'amac',
    durum: 'durum',
    notlar: 'notlar',
    detayliBilgi: 'detayli_bilgi',
    katilimcilar: 'katilimcilar',
    lokasyon: 'lokasyon',
    dosyalar: 'dosyalar',
    gelirTutari: 'gelir_tutari',
    giderTutari: 'gider_tutari',
    finansalAciklama: 'finansal_aciklama',
  };
  const set = [];
  const values = [];
  let idx = 1;
  for (const key of Object.keys(map)) {
    if (Object.prototype.hasOwnProperty.call(fields, key)) {
      set.push(`${map[key]}=$${idx++}`);
      values.push(fields[key]);
    }
  }
  if (!set.length) return findVisitById(id);
  values.push(id);
  const { rows } = await pool.query(
    `UPDATE ziyaretler SET ${set.join(',')} WHERE id=$${idx}
     RETURNING id, to_char(tarih,'YYYY-MM-DD') as tarih, saat, firma, ziyaretci, amac, durum,
               notlar, detayli_bilgi AS "detayliBilgi", katilimcilar, lokasyon, dosyalar,
               COALESCE(gelir_tutari,0) AS "gelirTutari", COALESCE(gider_tutari,0) AS "giderTutari",
               finansal_aciklama AS "finansalAciklama"`,
    values
  );
  return rows[0] || null;
}

async function deleteVisit(id) {
  const pool = getPool();
  await pool.query('DELETE FROM ziyaretler WHERE id=$1', [id]);
}

module.exports = { listVisits, createVisit, findVisitById, updateVisit, deleteVisit };


