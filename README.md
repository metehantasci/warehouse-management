# 🏭 Warehouse Management System

Modern, responsive ve rol bazlı yetkilendirmeye sahip bir **Depo Yönetim Sistemi**.

Bu proje; ürün, depo, stok hareketi, transfer, sevkiyat, kritik stok, raporlama ve audit log süreçlerini tek bir uygulama üzerinden yönetmek amacıyla **Angular 22** kullanılarak geliştirilmiştir.

---

## 📌 Proje Özeti

Warehouse Management System, gerçek bir depo operasyonunun temel süreçlerini simüle eden frontend tabanlı bir yönetim uygulamasıdır.

Uygulama aşağıdaki operasyonları destekler:

- Ürün yönetimi
- Depo yönetimi
- Stok giriş / çıkış / düzenleme işlemleri
- Depolar arası transfer
- Sevkiyat yönetimi
- Kritik stok takibi
- Raporlama
- Audit log
- Rol bazlı yetkilendirme
- Bildirim merkezi
- Form doğrulamaları
- Responsive kullanıcı arayüzü

Veriler bir backend sunucusu olmadan, **Mock API + localStorage** mimarisi üzerinden kalıcı olarak saklanır.

---

## 🚀 Kullanılan Teknolojiler

- Angular 22
- TypeScript
- SCSS
- Angular Standalone Components
- Angular Signals
- RxJS
- Reactive Forms
- Angular Router
- Route Guards
- Custom Directives
- Custom Pipes
- Mock API
- localStorage
- Unit Tests
- Git
- GitHub

---

## ✨ Temel Özellikler

### 📊 Dashboard

Dashboard ekranında sistemin genel operasyon özeti görüntülenir.

Örnek bilgiler:

- Toplam ürün sayısı
- Aktif depo sayısı
- Kritik stok sayısı
- Transfer durumu
- Sevkiyat özeti
- Genel operasyon metrikleri

---

### 📦 Ürün Yönetimi

Ürün modülü tam CRUD akışına sahiptir.

Desteklenen işlemler:

- Ürün listeleme
- Ürün arama
- Filtreleme
- Sıralama
- Sayfalama
- Yeni ürün oluşturma
- Ürün detay görüntüleme
- Ürün düzenleme
- Soft delete
- Aktif ürünlerde benzersiz barkod kontrolü

Ürün detay ekranında ayrıca:

- Depo bazlı stok bakiyesi
- Stok hareket geçmişi
- Hareket timeline

görüntülenebilir.

---

### 🏢 Depo Yönetimi

Depo modülünde:

- Depo listeleme
- Yeni depo oluşturma
- Depo detay görüntüleme
- Depo düzenleme
- Soft delete
- Arama
- Filtreleme
- Sayfalama

işlemleri desteklenir.

---

### 📈 Stok Hareketleri

Desteklenen stok hareket tipleri:

- `IN`
- `OUT`
- `ADJUSTMENT`
- `TRANSFER_IN`
- `TRANSFER_OUT`

Stok hareketleri:

- Ürün bazlı
- Depo bazlı
- Hareket tipi bazlı
- Tarih aralığı bazlı

filtrelenebilir.

#### Kritik iş kuralı

Bir stok çıkışı mevcut bakiyeyi aşamaz.

```text
Mevcut bakiye: 10
Çıkış talebi: 15
Sonuç: İşlem reddedilir
```

---

### 🔄 Depolar Arası Transfer

Transfer durumları:

- `PENDING`
- `APPROVED`
- `CANCELLED`

#### Transfer iş akışı

1. Transfer oluşturulur.
2. Kaynak depodan stok düşülür.
3. Transfer `PENDING` durumuna geçer.
4. Onaylanırsa hedef depoya stok eklenir.
5. Bekleyen transfer iptal edilirse kaynak stok geri yüklenir.

Bu yapı stok tutarsızlıklarını önlemek amacıyla tasarlanmıştır.

---

### 🚚 Sevkiyat Yönetimi

Sevkiyat durumları:

- `PLANNED`
- `CONFIRMED`
- `SHIPPED`
- `DELIVERED`
- `CANCELLED`

#### Sevkiyat akışı

```text
Planlandı
   ↓
Onaylandı
   ↓
Yola Çıktı
   ↓
Teslim Edildi
```

Sevkiyat detay ekranında:

- Sevkiyat kodu
- Kaynak depo
- Hedef bilgisi
- Ürün kalemleri
- Planlanan tarih
- Süreç timeline
- Durum bazlı aksiyonlar

görüntülenebilir.

Sevkiyat oluşturulmadan önce yeterli stok kontrolü yapılır.

---

### ⚠️ Kritik Stok Yönetimi

Minimum stok seviyesinin altına düşen ürünler otomatik olarak kritik stok ekranında listelenir.

Desteklenen stok durumları:

- `NORMAL`
- `LOW`
- `CRITICAL`
- `OUT_OF_STOCK`

Kritik stok hesaplamaları stok hareketlerinden türetilir.

---

### 📑 Raporlar

Raporlama modülü operasyon verilerinin analiz edilmesini sağlar.

Örnek rapor alanları:

- Ürün dağılımı
- Stok hareketleri
- Depo bazlı durum
- Kritik stoklar
- Operasyon özetleri

---

### 🧾 Audit Log

Kritik işlemler kayıt altına alınır.

Örnek audit aksiyonları:

- `CREATE`
- `UPDATE`
- `DELETE`
- `APPROVE`
- `CANCEL`
- `STATUS_CHANGE`
- `STOCK_IN`
- `STOCK_OUT`
- `TRANSFER`
- `SHIPMENT`
- `LOGIN`
- `EXPORT`

Audit kayıtlarında aşağıdaki bilgiler tutulabilir:

- Kullanıcı
- Kullanıcı rolü
- İşlem tipi
- Varlık tipi
- Varlık ID
- Açıklama
- Eski değer
- Yeni değer
- Tarih

---

## 🔐 Rol Bazlı Yetkilendirme

Uygulamada üç kullanıcı rolü bulunur.

### Operasyon Yöneticisi

En yüksek yetkiye sahip roldür.

Yetkiler:

- Ürün CRUD
- Depo CRUD
- Stok hareketi oluşturma
- Transfer oluşturma
- Transfer onaylama
- Transfer iptal etme
- Sevkiyat oluşturma
- Sevkiyat onaylama
- Sevkiyat iptal etme
- Rapor görüntüleme
- Audit log görüntüleme

---

### Depo Sorumlusu

Operasyonel işlemleri gerçekleştirebilir.

Yetkiler:

- Ürün CRUD
- Depo CRUD
- Stok hareketi oluşturma
- Transfer talebi oluşturma
- Sevkiyat planlama
- Dashboard görüntüleme
- Kritik stok görüntüleme

---

### Görüntüleyici

Salt okunur role sahiptir.

Yetkiler:

- Dashboard görüntüleme
- Ürünleri görüntüleme
- Depoları görüntüleme
- Stok hareketlerini görüntüleme
- Transferleri görüntüleme
- Sevkiyatları görüntüleme
- Kritik stokları görüntüleme

CRUD aksiyonları kullanıcı arayüzünde gizlenir.

---

## 👤 Demo Kullanıcılar

Tüm demo kullanıcıların şifresi:

```text
123456
```

### Operasyon Yöneticisi

```text
E-posta: operasyon@wms.local
Şifre: 123456
```

### Depo Sorumlusu

```text
E-posta: depo@wms.local
Şifre: 123456
```

### Görüntüleyici

```text
E-posta: viewer@wms.local
Şifre: 123456
```

---

## 🛣️ Ana Rotalar

```text
/login
/dashboard
/urunler
/urunler/yeni
/urunler/:id
/urunler/:id/edit
/depolar
/stok-hareketleri
/transferler
/sevkiyatlar
/kritik-stok
/raporlar
/audit-log
```

Tanımsız rotalar özel 404 sayfasına yönlendirilir.

---

## 🧱 Mimari

Proje feature-based mimari kullanır.

Temel bağımlılık yönü:

```text
features
   ↓
shared
   ↓
core
```

### Core

Singleton ve altyapı servisleri:

- Auth
- Storage
- Mock DB
- Mock API
- Audit Log
- Notification
- Loading
- Confirm Dialog
- Guards
- Interceptors
- Core modeller

### Shared

Tekrar kullanılabilir genel yapılar:

- Components
- Directives
- Pipes
- Validators
- Generic models

### Features

Dikey feature modülleri:

- Auth
- Dashboard
- Products
- Warehouses
- Stock Movements
- Transfers
- Shipments
- Critical Stock
- Reports
- Audit Log

---

## 📁 Proje Yapısı

```text
src/
└── app/
    ├── core/
    │   ├── guards/
    │   ├── interceptors/
    │   ├── mock-api/
    │   ├── models/
    │   └── services/
    │
    ├── shared/
    │   ├── components/
    │   ├── directives/
    │   ├── models/
    │   ├── pipes/
    │   └── validators/
    │
    ├── features/
    │   ├── auth/
    │   ├── dashboard/
    │   ├── products/
    │   ├── warehouses/
    │   ├── stock-movements/
    │   ├── transfers/
    │   ├── shipments/
    │   ├── critical-stock/
    │   ├── reports/
    │   └── audit-log/
    │
    ├── layout/
    │   ├── header/
    │   ├── sidebar/
    │   ├── footer/
    │   └── main-layout/
    │
    └── pages/
        └── not-found/
```

---

## 🌐 Mock API Yapısı

Uygulama gerçek backend yerine Mock API kullanır.

Örnek endpoint yapıları:

```text
/api/products
/api/warehouses
/api/stock-movements
/api/transfers
/api/shipments
```

Mock API interceptor gelen istekleri yakalar ve ilgili handler'a yönlendirir.

Bu yapı sayesinde frontend katmanı gerçek backend'e geçişe uygun şekilde ayrıştırılmıştır.

---

## 💾 Veri Kalıcılığı

Veriler `localStorage` üzerinde tutulur.

Feature katmanları doğrudan `localStorage` kullanmaz.

Persistence akışı:

```text
StorageService
    ↓
MockDbService
    ↓
Mock API Handlers
```

İlk çalıştırmada seed verileri otomatik oluşturulur.

---

## ♻️ Demo Verilerini Sıfırlama

Tarayıcı Console ekranında:

```javascript
localStorage.clear();
location.reload();
```

çalıştırıldığında demo verileri yeniden oluşturulur.

> Bu işlem kullanıcı verilerini ve oturum bilgisini temizleyebilir.

---

## 🧮 Stok Hesaplama Yapısı

`StockBalance` kalıcı olarak saklanmaz.

Stok bakiyesi stok hareketlerinden hesaplanır.

Benzer şekilde `InventoryQuery` yalnızca view model olarak kullanılır.

Bu yaklaşım veri tutarsızlığını önlemeyi amaçlar.

---

## ✅ Kritik İş Kuralları

1. Stok çıkışı mevcut bakiyeyi aşamaz.
2. Transfer oluşturulduğunda kaynak stok düşer.
3. Hedef stok yalnızca transfer onaylandığında artar.
4. Bekleyen transfer iptal edilirse kaynak stok geri yüklenir.
5. Minimum seviyenin altındaki ürünler kritik stok listesine girer.
6. Silinen ürün geçmiş hareket kayıtlarında korunur.
7. Yetersiz stok varsa sevkiyat oluşturulamaz.
8. Aynı barkod iki aktif ürüne atanamaz.
9. Kritik işlemler audit log üretir.
10. `StockBalance` persist edilmez.
11. `InventoryQuery` persist edilmez.
12. Audit log duplicate kayıt üretmemelidir.

---

## 📝 Form Yapısı

Formlar Angular Reactive Forms ile geliştirilmiştir.

Kullanılan doğrulamalar:

- Required validation
- Minimum sayı
- Pozitif sayı
- Tarih aralığı
- Koşullu required
- Alan eşleşmesi
- Unique active barcode
- Stock out balance validation
- Transfer source balance validation
- Source / destination warehouse farklılığı
- Shipment sufficient stock validation

---

## 🛡️ Guards

Projede:

- `authGuard`
- `roleGuard`
- `unsavedChangesGuard`

kullanılır.

### Unsaved Changes

Form üzerinde kaydedilmemiş değişiklik varsa kullanıcı sayfadan ayrılmadan önce özel confirm dialog ile uyarılır.

---

## 🎨 Kullanıcı Deneyimi

Uygulamada:

- Loading state
- Error state
- Empty state
- Toast notification
- Confirm dialog
- Notification center
- Responsive layout
- Debounced search
- Pagination
- Filtering
- Sorting
- 404 sayfası

bulunur.

---

## 📱 Responsive Tasarım

Arayüz farklı ekran boyutlarına uyum sağlayacak şekilde geliştirilmiştir.

Responsive davranışlar:

- Grid dönüşümleri
- Mobil kart düzeni
- Responsive form yapısı
- Scroll destekli tablolar
- Uyumlu sidebar
- Responsive detay sayfaları

---

## 🧪 Testler

Testleri çalıştırmak için:

```bash
npm test
```

veya:

```bash
npx ng test --watch=false
```

Projede özellikle aşağıdaki alanlar test edilir:

- Stock balance query
- Stock out validation
- Shipment sufficient stock validation
- Unique active barcode validation
- Transfer workflow
- Critical stock facade
- Audit log
- Role guard
- Mock DB
- Mock API seed
- Transfer handlers
- Shipment handlers

---

## 🛠️ Kurulum

Projeyi klonlayın:

```bash
git clone https://github.com/metehantasci/warehouse-management.git
```

Proje klasörüne girin:

```bash
cd warehouse-management
```

Bağımlılıkları yükleyin:

```bash
npm install
```

Development server başlatın:

```bash
npm start
```

veya:

```bash
ng serve
```

Tarayıcı:

```text
http://localhost:4200
```

---

## 🏗️ Production Build

```bash
ng build
```

Build çıktısı `dist/` klasörü altında oluşturulur.

---

## 🔍 Kod Kalitesi

Proje aşağıdaki prensipler dikkate alınarak geliştirilmiştir:

- Separation of concerns
- Feature-based architecture
- Reusable shared components
- Service abstraction
- Single responsibility
- Route-level authorization
- UI-level authorization
- Derived stock calculations
- Centralized persistence
- Centralized audit logging

---

## 📚 Öne Çıkan Angular Kullanımları

- Standalone Components
- Signals
- Computed Signals
- RxJS Observables
- `debounceTime`
- Reactive Forms
- Lazy-loaded feature routes
- Functional guards
- Custom directives
- Custom pipes
- Interceptors
- Dependency Injection

---

## 🔗 Bağlantılar

### GitHub

https://github.com/metehantasci/warehouse-management

### Canlı Demo

https://warehouse-management-gules.vercel.app/audit-log

---

## 👨‍💻 Geliştirici

**Metehan Taşcı**

Bilgisayar Programcılığı öğrencisi.

Bu proje staj çalışması kapsamında geliştirilmiştir.

---

## 📄 Lisans

Bu proje eğitim ve staj amaçlı geliştirilmiştir.
