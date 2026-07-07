# Warehouse Management System — WMS Panel

Angular tabanlı, rol bazlı yetkilendirme kullanan depo yönetim sistemi örneğidir. Ürün, depo, stok hareketi, transfer, sevkiyat, kritik stok, raporlama ve audit log süreçlerini tek panel altında birleştirir.

## Özellikler

- Ürün ve depo CRUD akışı, soft delete
- Stok giriş, çıkış ve bakiye düzeltme
- Stok çıkışında mevcut bakiyeyi aşma kontrolü
- Transfer talebi, onay, iptal, TRANSFER_OUT ve TRANSFER_IN hareketleri
- Sevkiyat planlama, onaylama, yola çıkarma, teslim ve iptal
- Sevkiyat öncesi yeterli stok doğrulaması
- Kritik stok analizi
- Dashboard ve raporlar
- Audit Log
- Ürün detayında depo bazlı bakiye tablosu ve hareket timeline
- Reactive Forms ve unsaved changes guard
- Global Confirm Dialog
- Route guard ve appPermission UI yetkilendirmesi
- Mock API interceptor ve localStorage tabanlı demo veri katmanı

## Teknoloji

Angular 22, TypeScript, Standalone Components, Signals, RxJS, Reactive Forms, Angular Router, SCSS ve Vitest.

## Kurulum ve Çalıştırma

```bash
npm install
npm run start
```

Alternatif:

```bash
ng serve
```

Uygulama varsayılan olarak `http://localhost:4200` adresinde açılır.

Production build:

```bash
ng build
```

Testler:

```bash
ng test --watch=false
```

## Demo Kullanıcılar

### Depo Sorumlusu

```text
depo@wms.local
123456
```

Ürün/depo CRUD, stok hareketi oluşturma, transfer talebi oluşturma ve sevkiyat planlama yetkilerine sahiptir.

### Operasyon Yöneticisi

```text
operasyon@wms.local
123456
```

Tüm operasyonel yetkilere, transfer/sevkiyat durum aksiyonlarına ve Audit Log erişimine sahiptir.

### Görüntüleyici

```text
viewer@wms.local
123456
```

Salt okunur erişime sahiptir. Değişiklik yapan butonlar UI seviyesinde gizlenir; route ve API seviyesinde de yetkisiz işlemler engellenir.

## Mimari

Feature-based mimari kullanılır:

```text
src/app/
├── core/
│   ├── guards/
│   ├── interceptors/
│   ├── mock-api/
│   ├── models/
│   └── services/
├── shared/
│   ├── components/
│   ├── directives/
│   ├── pipes/
│   └── validators/
├── features/
│   ├── dashboard/
│   ├── products/
│   ├── warehouses/
│   ├── stock-movements/
│   ├── transfers/
│   ├── shipments/
│   ├── critical-stock/
│   ├── reports/
│   ├── audit-log/
│   └── auth/
├── layout/
└── pages/
```

`core` uygulama çapındaki AuthService, MockDbService, StorageService, AuditLogService, guard ve interceptor altyapısını taşır. `shared` feature bağımsız UI ve yardımcı parçaları içerir. `features` her iş alanını dikey dilim halinde tutar.

## Veri Akışı

```text
Page
  ↓
Facade / Data Service
  ↓
HttpClient
  ↓
Mock API Interceptor
  ↓
Mock Handler
  ↓
MockDbService
  ↓
StorageService
  ↓
localStorage
```

Feature ekranları normal HTTP kontratıyla çalışır; mock backend ayrıntısını bilmez.

## Yetkilendirme

İki seviyeli kontrol uygulanır:

1. Route seviyesi: `authGuard`, `roleGuard`
2. UI seviyesi: `*appPermission`

Mock API interceptor mutating request'lerde ayrıca rol kontrolü yapar.

## Stok Mantığı

Stok bakiyesi ayrı bir kalıcı koleksiyon değildir. `StockMovement` kayıtlarından hesaplanır. Desteklenen tipler `IN`, `OUT`, `ADJUSTMENT`, `TRANSFER_IN`, `TRANSFER_OUT` değerleridir. `StockBalanceQueryService` ürün + depo bazlı bakiye üretir.

## Testler

Test kapsamı StockBalanceQueryService, stockOutNotExceedingBalanceValidator, shipmentSufficientStockValidator, uniqueActiveBarcodeValidator, transfer workflow, CriticalStockFacadeService, AuditLogService ve roleGuard senaryolarını içerir.

## Dağıtım

```bash
ng build
```

Çıktı klasörü `dist/warehouse-management` dizinidir.

Bu proje eğitim ve staj çalışması amacıyla hazırlanmış, gerçek backend davranışını mock API ve tarayıcı depolamasıyla simüle eden bir frontend uygulamasıdır.