# ADASO Backend (Express + Supabase Postgres)

ADASO Firma Takip Sistemi'nin backend API'si. Node.js, Express ve Supabase Postgres kullanılarak geliştirilmiştir.

## 🚀 Özellikler

- **Authentication & Authorization**: JWT tabanlı güvenlik sistemi
- **Company Management**: Firma ekleme, düzenleme, silme ve listeleme
- **Visit Tracking**: Ziyaret planlama ve takibi
- **Financial Management**: Gelir-gider takibi ve raporlama
- **Reporting**: Excel ve PDF export özellikleri
- **Dashboard**: Gerçek zamanlı istatistikler ve analitikler
- **Input Validation**: Express-validator ile kapsamlı veri doğrulama
- **Security**: Helmet.js ile güvenlik başlıkları ve rate limiting
- **Caching**: Redis ile performans optimizasyonu
- **Logging**: Winston ile gelişmiş loglama sistemi
- **API Documentation**: Swagger/OpenAPI ile otomatik dokümantasyon
- **Docker Support**: Containerization desteği
- **PM2 Support**: Process management ve clustering

## 📋 Gereksinimler

- Node.js (v16 veya üzeri)
- Supabase Postgres
- npm veya yarn

## 🛠️ Kurulum

1. **Repository'yi klonlayın:**
```bash
git clone <repository-url>
cd adaso-backend
```

2. **Bağımlılıkları yükleyin:**
```bash
npm install
```

3. **Environment variables dosyasını oluşturun:**
```bash
cp .env.example .env
```

4. **`.env` dosyasını düzenleyin:**
```env
PORT=7000
NODE_ENV=production
FRONTEND_ORIGIN=https://adaso.net
JWT_SECRET=deger-girin
JWT_EXPIRE=7d
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB
PGSSLMODE=require
```

5. **Supabase Postgres bağlantısı:** `.env` içine `DATABASE_URL` girin ve `PGSSLMODE=require` ayarlayın.

6. **Uygulamayı başlatın:**
```bash
# api/server.js üzerinden
npm start
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Yeni kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `POST /api/auth/forgot-password` - Şifre sıfırlama talebi
- `POST /api/auth/reset-password` - Şifre sıfırlama
- `PUT /api/auth/me` - Profil güncelleme
- `PUT /api/auth/change-password` - Şifre değiştirme
- `GET /api/auth/me` - Mevcut kullanıcı bilgileri

### Companies
- `GET /api/companies` - Firma listesi (pagination ve filtreleme ile)
- `POST /api/companies` - Yeni firma ekleme
- `GET /api/companies/:id` - Firma detayları
- `PUT /api/companies/:id` - Firma güncelleme
- `DELETE /api/companies/:id` - Firma silme (admin only)
- `GET /api/companies/stats` - Firma istatistikleri
- `GET /api/companies/sector/:sector` - Sektöre göre firmalar

### Visits
- `GET /api/visits` - Ziyaret listesi (pagination ve filtreleme ile)
- `POST /api/visits` - Yeni ziyaret ekleme
- `GET /api/visits/:id` - Ziyaret detayları
- `PUT /api/visits/:id` - Ziyaret güncelleme
- `DELETE /api/visits/:id` - Ziyaret silme (admin only)
- `PATCH /api/visits/:id/complete` - Ziyareti tamamlama
- `GET /api/visits/stats` - Ziyaret istatistikleri
- `GET /api/visits/company/:companyId` - Firmaya göre ziyaretler

### Transactions
- `GET /api/transactions` - İşlem listesi (pagination ve filtreleme ile)
- `POST /api/transactions` - Yeni işlem ekleme
- `GET /api/transactions/:id` - İşlem detayları
- `PUT /api/transactions/:id` - İşlem güncelleme
- `DELETE /api/transactions/:id` - İşlem silme (admin only)
- `GET /api/transactions/stats` - Finansal istatistikler
- `GET /api/transactions/category/:category` - Kategoriye göre işlemler
- `GET /api/transactions/categories/list` - Mevcut kategoriler

### Reports
- `GET /api/reports/dashboard` - Dashboard özeti
- `GET /api/reports/export/companies` - Firma listesi Excel export
- `GET /api/reports/export/visits` - Ziyaret listesi Excel export
- `GET /api/reports/export/financial` - Finansal rapor Excel export
- `GET /api/reports/pdf/:type` - PDF rapor oluşturma

### File Upload
- `POST /api/visits/:id/upload` - Ziyaret dosya yükleme
- `POST /api/transactions/:id/upload` - İşlem dosya yükleme
- `GET /uploads/:filename` - Yüklenen dosyalara erişim
- **Desteklenen formatlar**: JPG, PNG, GIF, PDF, DOC, DOCX, XLS, XLSX
- **Maksimum dosya boyutu**: 10MB

## 🔐 Authentication

API'yi kullanmak için JWT token gereklidir. Token'ı `Authorization` header'ında `Bearer <token>` formatında gönderin:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📊 Veritabanı Modelleri

### User
- `username`: Kullanıcı adı (unique)
- `email`: Email adresi (unique)
- `password`: Şifrelenmiş parola
- `fullName`: Tam ad
- `phone`: Telefon numarası
- `role`: Kullanıcı rolü (admin/user)

### Company
- `companyName`: Firma adı (unique)
- `contactPerson`: Yetkili kişi
- `email`: Email adresi (unique)
- `phone`: Telefon numarası
- `address`: Adres
- `sector`: Sektör
- `status`: Durum (active/inactive/prospect)
- `notes`: Notlar
- `website`: Website URL
- `taxNumber`: Vergi numarası
- `employeeCount`: Çalışan sayısı
- `annualRevenue`: Yıllık gelir

### Visit
- `company`: Firma referansı
- `visitDate`: Ziyaret tarihi
- `status`: Durum (planned/completed/cancelled)
- `notes`: Notlar
- `nextVisitDate`: Sonraki ziyaret tarihi
- `visitType`: Ziyaret türü (regular/special)
- `outcome`: Ziyaret sonucu
- `followUpRequired`: Takip gerekli mi
- `createdBy`: Oluşturan kullanıcı

### Transaction
- `type`: İşlem türü (income/expense)
- `category`: Kategori
- `amount`: Tutar
- `description`: Açıklama
- `date`: İşlem tarihi
- `paymentMethod`: Ödeme yöntemi
- `reference`: Referans
- `notes`: Notlar
- `createdBy`: Oluşturan kullanıcı

## 🚨 Güvenlik

- JWT token tabanlı authentication
- Password hashing (bcrypt)
- Input validation ve sanitization
- CORS konfigürasyonu
- Rate limiting (gelecekte eklenecek)

## 📂 Yeni Proje Yapısı

api/
  server.js (app init, CORS, Helmet, rate limit, routes, health)
  routes/
  controllers/
  services/
  repositories/
  db/
  middleware/
  utils/

## 🧪 Test

```bash
# Test çalıştırma (gelecekte eklenecek)
npm test

# Test coverage (gelecekte eklenecek)
npm run test:coverage
```

## 📦 Production Deployment

1. **Environment variables'ları production değerleriyle güncelleyin**
2. **PM2 ile process management:**
```bash
npm install -g pm2
pm2 start ecosystem.config.js
```

3. **Nginx reverse proxy konfigürasyonu**
4. **SSL sertifikası kurulumu**
5. **Monitoring ve logging**

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

- **Developer**: ADASO Team
- **Email**: info@adaso.com
- **Website**: https://adaso.com

## 🔄 Changelog

### v1.0.0 (2024-01-XX)
- Initial release
- Authentication system
- Company management
- Visit tracking
- Financial management
- Reporting system
- Dashboard analytics
