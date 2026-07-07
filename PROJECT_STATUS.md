# WMS Project Status

Son güncelleme: 2026-07-06

## 1. Proje Temeli

- [x] Angular 22
- [x] Standalone component yapısı
- [x] SCSS
- [x] Feature-based klasör mimarisi
- [x] Core / Shared / Layout / Features ayrımı
- [x] Production build kontrolü
- [x] Otomatik doğrulama scripti

---

## 2. Core Modeller

- [x] BaseEntity
- [x] ApiResponse<T>
- [x] PaginatedResult<T>
- [x] QueryParams
- [x] AuthUser

---

## 3. Enumlar

- [x] UserRole
- [x] UnitOfMeasure
- [x] MovementType
- [x] TransferStatus
- [x] ShipmentStatus
- [x] StockStatus
- [x] AuditActionType

---

## 4. Domain Modelleri

- [x] Product
- [x] BarcodeRecord
- [x] Warehouse
- [x] StockMovement
- [x] StockBalance
- [x] InventoryQuery
- [x] TransferRequest
- [x] Shipment
- [x] ShipmentItem
- [x] LowStockRule
- [x] AuditLogEntry

---

## 5. Shared Altyapı

- [x] TableColumn<T>
- [x] SelectOption<T>

### Validatorlar
- [x] positiveNumberValidator
- [x] requiredIfValidator
- [x] dateRangeValidator
- [x] matchFieldsValidator
- [x] sourceNotEqualDestinationWarehouseValidator
- [ ] uniqueActiveBarcodeValidator
- [ ] stockOutNotExceedingBalanceValidator
- [ ] transferQuantityNotExceedingSourceBalanceValidator
- [ ] shipmentSufficientStockValidator

### Pipe'lar
- [x] StatusLabelPipe
- [x] MoneyPipe
- [x] AppDatePipe
- [x] RemainingTimePipe

### Directive'ler
- [ ] PermissionDirective
- [ ] AutofocusDirective
- [ ] DebounceDirective

---

## 6. Core Servisler

- [x] StorageService
- [x] IdGeneratorService
- [x] LoadingService
- [x] NotificationService
- [x] AuthService
- [x] ConfirmDialogService
- [ ] MockDbService
- [ ] AuditLogService

---

## 7. Guardlar

- [ ] AuthGuard
- [ ] RoleGuard
- [ ] UnsavedChangesGuard

---

## 8. Mock API

- [ ] Mock API interceptor
- [ ] Loading interceptor
- [ ] Error handling interceptor
- [ ] Audit log interceptor
- [ ] Products handler
- [ ] Warehouses handler
- [ ] Stock movements handler
- [ ] Transfers handler
- [ ] Shipments handler
- [ ] Low stock rules handler
- [ ] Audit log handler
- [ ] Async delay simulation
- [ ] Error simulation

---

## 9. Demo Veri

- [ ] Products seed
- [ ] Warehouses seed
- [ ] Stock movements seed
- [ ] Transfers seed
- [ ] Shipments seed
- [ ] Low stock rules seed
- [ ] Barcode records seed
- [ ] Audit log seed
- [ ] Kritik stok senaryosu
- [ ] Bekleyen transfer senaryosu

---

## 10. Routing

- [ ] App routes
- [ ] Dashboard routes
- [ ] Products routes
- [ ] Warehouses routes
- [ ] Stock movements routes
- [ ] Transfers routes
- [ ] Shipments routes
- [ ] Critical stock routes
- [ ] Reports routes
- [ ] Audit log routes
- [ ] Not found route
- [ ] Login route

---

## 11. Layout

- [ ] Main Layout
- [ ] Header
- [ ] Sidebar
- [ ] Footer
- [ ] Responsive navigation
- [ ] Role-based menu
- [ ] Global theme

---

## 12. Shared Components

- [ ] DataTable
- [ ] Dialog
- [ ] ConfirmDialog
- [ ] EmptyState
- [ ] FormField
- [ ] Pagination
- [ ] ToastNotification
- [ ] LoadingSpinner
- [ ] SearchBox
- [ ] Badge
- [ ] StatCard
- [ ] Stepper

---

## 13. Dashboard

- [ ] Toplam ürün
- [ ] Toplam depo
- [ ] Aktif barkod
- [ ] Bekleyen transfer
- [ ] Bekleyen sevkiyat
- [ ] Kritik stok
- [ ] Bugünkü hareket
- [ ] Son hareketler
- [ ] Grafikler
- [ ] Loading state
- [ ] Empty state
- [ ] Error state

---

## 14. Products

- [ ] Listeleme
- [ ] Detay
- [ ] Oluşturma
- [ ] Düzenleme
- [ ] Soft delete
- [ ] Search debounce
- [ ] Filtreleme
- [ ] Sıralama
- [ ] Pagination
- [ ] Unique barcode kontrolü
- [ ] Hareket timeline
- [ ] Depo bazlı bakiye tablosu
- [ ] Loading state
- [ ] Empty state
- [ ] Error state
- [ ] Form validation
- [ ] Confirm dialog

---

## 15. Warehouses

- [ ] Listeleme
- [ ] Detay
- [ ] Oluşturma
- [ ] Düzenleme
- [ ] Soft delete
- [ ] Search debounce
- [ ] Filtreleme
- [ ] Sıralama
- [ ] Pagination
- [ ] Loading state
- [ ] Empty state
- [ ] Error state
- [ ] Form validation
- [ ] Confirm dialog

---

## 16. Stock Movements

- [ ] Listeleme
- [ ] Detay
- [ ] Stok girişi
- [ ] Stok çıkışı
- [ ] Stok düzeltme
- [ ] Fazla stok çıkışını engelleme
- [ ] Filtreleme
- [ ] Pagination
- [ ] Search debounce
- [ ] Audit log üretimi
- [ ] Hareketlerden bakiye hesaplama

---

## 17. Transfers

- [ ] Listeleme
- [ ] Detay
- [ ] Oluşturma
- [ ] PENDING workflow
- [ ] APPROVED workflow
- [ ] CANCELLED workflow
- [ ] Kaynaktan önce düşme
- [ ] Onay sonrası hedefe ekleme
- [ ] Yetersiz stok kontrolü
- [ ] Confirm dialog
- [ ] Audit log
- [ ] Status timeline

---

## 18. Shipments

- [ ] Listeleme
- [ ] Detay
- [ ] Planlama
- [ ] Düzenleme
- [ ] İptal
- [ ] Yeterli stok kontrolü
- [ ] Workflow status geçişleri
- [ ] Confirm dialog
- [ ] Audit log

---

## 19. Critical Stock

- [ ] Threshold karşılaştırması
- [ ] Mevcut bakiye
- [ ] Minimum stok
- [ ] Eksik miktar
- [ ] Depo filtresi
- [ ] Ürün filtresi
- [ ] Otomatik hesaplama

---

## 20. Reports

- [ ] Stok raporu
- [ ] Hareket raporu
- [ ] Transfer raporu
- [ ] Sevkiyat raporu
- [ ] Kritik stok raporu
- [ ] CSV export
- [ ] JSON export

---

## 21. Audit Log

- [ ] Kritik işlem kaydı
- [ ] Kullanıcı
- [ ] Rol
- [ ] Tarih
- [ ] İşlem tipi
- [ ] Açıklama
- [ ] Eski değer
- [ ] Yeni değer
- [ ] Filtreleme
- [ ] Pagination

---

## 22. Yetkilendirme

- [ ] Depo Sorumlusu
- [ ] Operasyon Yöneticisi
- [ ] Görüntüleyici
- [ ] Route guard
- [ ] Permission directive
- [ ] Viewer read-only davranışı

---

## 23. Testler

- [ ] StockBalanceQueryService
- [ ] stockOutNotExceedingBalanceValidator
- [ ] shipmentSufficientStockValidator
- [ ] uniqueActiveBarcodeValidator
- [ ] Transfer workflow
- [ ] Critical stock calculation
- [ ] AuditLogService
- [ ] RoleGuard

---

## 24. Responsive

- [ ] Desktop
- [ ] Tablet
- [ ] Mobile
- [ ] Sidebar mobile state
- [ ] Responsive tables
- [ ] Responsive forms

---

## 25. Teslim

- [ ] README
- [ ] Kurulum açıklaması
- [ ] Çalıştırma komutu
- [ ] Test komutu
- [ ] Mimari açıklama
- [ ] Demo kullanıcıları
- [ ] Bilinen eksikler
- [ ] Demo video
- [ ] Final test çıktısı
- [ ] GitHub repository
- [ ] Temiz production build
