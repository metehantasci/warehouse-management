import {
  Injectable,
  inject
} from '@angular/core';

import {
  AuditActionType
} from '../models/audit-action-type.enum';

import {
  MovementType
} from '../models/movement-type.enum';

import {
  ShipmentStatus
} from '../models/shipment-status.enum';

import {
  TransferStatus
} from '../models/transfer-status.enum';

import {
  UnitOfMeasure
} from '../models/unit-of-measure.enum';

import {
  UserRole
} from '../models/user-role.enum';

import {
  AuditLogEntry
} from '../../features/audit-log/models/audit-log-entry';

import {
  LowStockRule
} from '../../features/critical-stock/models/low-stock-rule';

import {
  BarcodeRecord
} from '../../features/products/models/barcode-record';

import {
  Product
} from '../../features/products/models/product';

import {
  Shipment
} from '../../features/shipments/models/shipment';

import {
  StockMovement
} from '../../features/stock-movements/models/stock-movement';

import {
  TransferRequest
} from '../../features/transfers/models/transfer-request';

import {
  Warehouse
} from '../../features/warehouses/models/warehouse';

import {
  MockDbService
} from '../services/mock-db';


interface MovementSeedInput {
  id: string;
  productId: string;
  warehouseId: string;
  type: MovementType;
  quantity: number;
  createdAt: string;
  reason: string;
  relatedTransferId?: string;
  relatedShipmentId?: string;
}


@Injectable({
  providedIn: 'root'
})
export class MockDbSeedService {

  private readonly db =
    inject(MockDbService);


  seedIfNeeded(): void {
    this.seedProducts();

    this.seedWarehouses();

    this.seedBarcodeRecords();

    this.seedLowStockRules();

    this.seedStockMovements();

    this.seedTransferRequests();

    this.seedShipments();

    this.seedAuditLog();
  }


  resetAndSeed(): void {
    const collections = [
      'products',
      'warehouses',
      'stockMovements',
      'transferRequests',
      'shipments',
      'lowStockRules',
      'barcodeRecords',
      'auditLog'
    ] as const;

    for (const collection of collections) {
      this.db.clearCollection(collection);
    }

    this.seedIfNeeded();
  }


  private seedProducts(): void {
    if (this.db.hasCollection('products')) {
      return;
    }

    const products: Product[] = [
      this.product(
        'prd-001',
        'URN-0001',
        'Dizüstü Bilgisayar 15.6"',
        'Elektronik',
        UnitOfMeasure.ADET,
        '8690000000011',
        32999,
        5,
        'Kurumsal kullanım için 15.6 inç dizüstü bilgisayar.'
      ),

      this.product(
        'prd-002',
        'URN-0002',
        'Kablosuz Mouse',
        'Elektronik',
        UnitOfMeasure.ADET,
        '8690000000028',
        749,
        12,
        'Ergonomik kablosuz optik mouse.'
      ),

      this.product(
        'prd-003',
        'URN-0003',
        'Mekanik Klavye',
        'Elektronik',
        UnitOfMeasure.ADET,
        '8690000000035',
        2499,
        8,
        'RGB aydınlatmalı mekanik klavye.'
      ),

      this.product(
        'prd-004',
        'URN-0004',
        'A4 Fotokopi Kağıdı',
        'Ofis',
        UnitOfMeasure.KOLI,
        '8690000000042',
        1890,
        15,
        '80 gr, koli bazında A4 fotokopi kağıdı.'
      ),

      this.product(
        'prd-005',
        'URN-0005',
        'Endüstriyel Temizlik Sıvısı',
        'Temizlik',
        UnitOfMeasure.LITRE,
        '8690000000059',
        185,
        30,
        'Genel yüzeyler için konsantre temizlik sıvısı.'
      ),

      this.product(
        'prd-006',
        'URN-0006',
        'Koruyucu İş Eldiveni',
        'İş Güvenliği',
        UnitOfMeasure.ADET,
        '8690000000066',
        129,
        25,
        'Kesilmeye dayanıklı koruyucu iş eldiveni.'
      ),

      this.product(
        'prd-007',
        'URN-0007',
        'Çelik Vida Seti',
        'Hırdavat',
        UnitOfMeasure.KOLI,
        '8690000000073',
        990,
        10,
        'Farklı ölçülerde galvanizli çelik vida seti.'
      ),

      this.product(
        'prd-008',
        'URN-0008',
        'Paketleme Streç Film',
        'Ambalaj',
        UnitOfMeasure.ADET,
        '8690000000080',
        315,
        20,
        'Sanayi tipi şeffaf paketleme streç filmi.'
      ),

      this.product(
        'prd-009',
        'URN-0009',
        'Euro Palet',
        'Lojistik',
        UnitOfMeasure.PALET,
        '8690000000097',
        1450,
        6,
        'Standart ölçülü yeniden kullanılabilir Euro palet.'
      ),

      this.product(
        'prd-010',
        'URN-0010',
        'Paslanmaz Çelik Sac',
        'Hammadde',
        UnitOfMeasure.KG,
        '8690000000103',
        275,
        100,
        'Üretim hattında kullanılan paslanmaz çelik sac.'
      ),

      this.product(
        'prd-011',
        'URN-0011',
        'USB-C Çoklayıcı',
        'Elektronik',
        UnitOfMeasure.ADET,
        '8690000000110',
        1599,
        7,
        'HDMI ve USB portlu USB-C çoklayıcı.'
      ),

      this.product(
        'prd-012',
        'URN-0012',
        'Termal Etiket Rulosu',
        'Ambalaj',
        UnitOfMeasure.KOLI,
        '8690000000127',
        1250,
        18,
        'Barkod yazıcıları için termal etiket rulosu.'
      )
    ];

    this.db.setAll(
      'products',
      products
    );
  }


  private seedWarehouses(): void {
    if (this.db.hasCollection('warehouses')) {
      return;
    }

    const warehouses: Warehouse[] = [
      {
        id: 'wh-001',
        code: 'DPO-ANK-MRK',
        name: 'Ankara Merkez Depo',
        address: 'İvedik OSB, 1478. Cadde No: 21',
        city: 'Ankara',
        district: 'Yenimahalle',
        capacity: 12000,
        responsiblePerson: 'Ahmet Yılmaz',
        phone: '0312 555 10 01',
        isActive: true,
        createdAt: '2026-01-05T08:00:00.000Z',
        updatedAt: '2026-06-10T09:30:00.000Z'
      },

      {
        id: 'wh-002',
        code: 'DPO-IST-AVR',
        name: 'İstanbul Avrupa Depo',
        address: 'İkitelli OSB, Depocular Sitesi No: 18',
        city: 'İstanbul',
        district: 'Başakşehir',
        capacity: 18000,
        responsiblePerson: 'Selin Kara',
        phone: '0212 555 20 02',
        isActive: true,
        createdAt: '2026-01-10T08:00:00.000Z',
        updatedAt: '2026-05-18T11:15:00.000Z'
      },

      {
        id: 'wh-003',
        code: 'DPO-IZM-EGE',
        name: 'İzmir Ege Bölge Deposu',
        address: 'Kemalpaşa OSB, 12. Sokak No: 7',
        city: 'İzmir',
        district: 'Kemalpaşa',
        capacity: 9500,
        responsiblePerson: 'Mehmet Demir',
        phone: '0232 555 30 03',
        isActive: true,
        createdAt: '2026-02-01T08:00:00.000Z',
        updatedAt: '2026-06-22T14:40:00.000Z'
      },

      {
        id: 'wh-004',
        code: 'DPO-BRS-BLG',
        name: 'Bursa Bölge Deposu',
        address: 'Nilüfer Sanayi Bölgesi No: 44',
        city: 'Bursa',
        district: 'Nilüfer',
        capacity: 8000,
        responsiblePerson: 'Zeynep Aydın',
        phone: '0224 555 40 04',
        isActive: true,
        createdAt: '2026-02-15T08:00:00.000Z',
        updatedAt: '2026-06-28T10:00:00.000Z'
      }
    ];

    this.db.setAll(
      'warehouses',
      warehouses
    );
  }


  private seedBarcodeRecords(): void {
    if (this.db.hasCollection('barcodeRecords')) {
      return;
    }

    const products =
      this.db.getAll<Product>('products');

    const records: BarcodeRecord[] =
      products
        .filter(
          product => !!product.barcode
        )
        .map(
          product => ({
            id: `barcode-${product.id}`,
            barcode: product.barcode!,
            productId: product.id,
            assignedAt: product.createdAt,
            isActive: true,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt
          })
        );

    this.db.setAll(
      'barcodeRecords',
      records
    );
  }


  private seedLowStockRules(): void {
    if (this.db.hasCollection('lowStockRules')) {
      return;
    }

    const now =
      '2026-07-01T09:00:00.000Z';

    const rules: LowStockRule[] = [
      this.lowStockRule(
        'rule-001',
        'prd-001',
        'wh-001',
        5,
        now
      ),

      this.lowStockRule(
        'rule-002',
        'prd-002',
        'wh-001',
        12,
        now
      ),

      this.lowStockRule(
        'rule-003',
        'prd-004',
        'wh-002',
        15,
        now
      ),

      this.lowStockRule(
        'rule-004',
        'prd-005',
        'wh-003',
        30,
        now
      ),

      this.lowStockRule(
        'rule-005',
        'prd-006',
        'wh-004',
        25,
        now
      ),

      this.lowStockRule(
        'rule-006',
        'prd-009',
        'wh-001',
        6,
        now
      ),

      this.lowStockRule(
        'rule-007',
        'prd-010',
        'wh-002',
        100,
        now
      ),

      this.lowStockRule(
        'rule-008',
        'prd-012',
        'wh-003',
        18,
        now
      )
    ];

    this.db.setAll(
      'lowStockRules',
      rules
    );
  }


  private seedStockMovements(): void {
    if (this.db.hasCollection('stockMovements')) {
      return;
    }

    const inputs: MovementSeedInput[] = [
      this.movementInput(
        'mov-001',
        'prd-001',
        'wh-001',
        MovementType.IN,
        18,
        '2026-05-01T08:30:00.000Z',
        'İlk stok girişi'
      ),

      this.movementInput(
        'mov-002',
        'prd-001',
        'wh-001',
        MovementType.OUT,
        14,
        '2026-06-20T12:15:00.000Z',
        'Kurumsal satış çıkışı'
      ),

      this.movementInput(
        'mov-003',
        'prd-002',
        'wh-001',
        MovementType.IN,
        40,
        '2026-05-04T09:00:00.000Z',
        'Tedarikçi mal kabul'
      ),

      this.movementInput(
        'mov-004',
        'prd-002',
        'wh-001',
        MovementType.OUT,
        31,
        '2026-06-26T15:20:00.000Z',
        'Toplu sipariş çıkışı'
      ),

      this.movementInput(
        'mov-005',
        'prd-003',
        'wh-001',
        MovementType.IN,
        24,
        '2026-05-08T10:00:00.000Z',
        'İlk stok girişi'
      ),

      this.movementInput(
        'mov-006',
        'prd-003',
        'wh-001',
        MovementType.OUT,
        7,
        '2026-06-11T13:00:00.000Z',
        'Satış çıkışı'
      ),

      this.movementInput(
        'mov-007',
        'prd-004',
        'wh-002',
        MovementType.IN,
        55,
        '2026-05-02T07:45:00.000Z',
        'Tedarikçi sevkiyatı'
      ),

      this.movementInput(
        'mov-008',
        'prd-004',
        'wh-002',
        MovementType.OUT,
        43,
        '2026-06-28T16:00:00.000Z',
        'Ofis sarf tüketimi'
      ),

      this.movementInput(
        'mov-009',
        'prd-005',
        'wh-003',
        MovementType.IN,
        100,
        '2026-05-12T11:10:00.000Z',
        'Toplu sıvı ürün girişi'
      ),

      this.movementInput(
        'mov-010',
        'prd-005',
        'wh-003',
        MovementType.OUT,
        76,
        '2026-06-29T14:30:00.000Z',
        'Bölgesel dağıtım'
      ),

      this.movementInput(
        'mov-011',
        'prd-006',
        'wh-004',
        MovementType.IN,
        70,
        '2026-05-10T08:50:00.000Z',
        'İş güvenliği stoğu'
      ),

      this.movementInput(
        'mov-012',
        'prd-006',
        'wh-004',
        MovementType.OUT,
        49,
        '2026-06-30T12:40:00.000Z',
        'Personel dağıtımı'
      ),

      this.movementInput(
        'mov-013',
        'prd-007',
        'wh-002',
        MovementType.IN,
        34,
        '2026-05-15T09:20:00.000Z',
        'Hırdavat stok girişi'
      ),

      this.movementInput(
        'mov-014',
        'prd-007',
        'wh-002',
        MovementType.OUT,
        11,
        '2026-06-10T10:25:00.000Z',
        'Üretim hattı tüketimi'
      ),

      this.movementInput(
        'mov-015',
        'prd-008',
        'wh-003',
        MovementType.IN,
        80,
        '2026-05-18T10:00:00.000Z',
        'Ambalaj malzemesi girişi'
      ),

      this.movementInput(
        'mov-016',
        'prd-008',
        'wh-003',
        MovementType.OUT,
        28,
        '2026-06-16T09:35:00.000Z',
        'Paketleme tüketimi'
      ),

      this.movementInput(
        'mov-017',
        'prd-009',
        'wh-001',
        MovementType.IN,
        12,
        '2026-05-20T08:00:00.000Z',
        'Palet kabulü'
      ),

      this.movementInput(
        'mov-018',
        'prd-009',
        'wh-001',
        MovementType.OUT,
        8,
        '2026-07-01T11:00:00.000Z',
        'Sevkiyat palet kullanımı'
      ),

      this.movementInput(
        'mov-019',
        'prd-010',
        'wh-002',
        MovementType.IN,
        500,
        '2026-05-22T07:30:00.000Z',
        'Hammadde kabulü'
      ),

      this.movementInput(
        'mov-020',
        'prd-010',
        'wh-002',
        MovementType.OUT,
        425,
        '2026-07-02T15:45:00.000Z',
        'Üretim hattı tüketimi'
      ),

      this.movementInput(
        'mov-021',
        'prd-011',
        'wh-001',
        MovementType.IN,
        28,
        '2026-05-25T13:10:00.000Z',
        'Elektronik ürün kabulü'
      ),

      this.movementInput(
        'mov-022',
        'prd-011',
        'wh-001',
        MovementType.OUT,
        9,
        '2026-06-24T11:50:00.000Z',
        'Satış çıkışı'
      ),

      this.movementInput(
        'mov-023',
        'prd-012',
        'wh-003',
        MovementType.IN,
        60,
        '2026-05-28T09:15:00.000Z',
        'Etiket stoğu girişi'
      ),

      this.movementInput(
        'mov-024',
        'prd-012',
        'wh-003',
        MovementType.OUT,
        45,
        '2026-07-03T10:10:00.000Z',
        'Operasyon tüketimi'
      ),

      this.movementInput(
        'mov-025',
        'prd-003',
        'wh-002',
        MovementType.IN,
        16,
        '2026-06-01T08:00:00.000Z',
        'Bölge depo stok girişi'
      ),

      this.movementInput(
        'mov-026',
        'prd-008',
        'wh-001',
        MovementType.IN,
        35,
        '2026-06-03T08:15:00.000Z',
        'Merkez depo ambalaj girişi'
      ),

      this.movementInput(
        'mov-027',
        'prd-006',
        'wh-001',
        MovementType.IN,
        45,
        '2026-06-05T09:00:00.000Z',
        'Merkez depo koruyucu ekipman girişi'
      ),

      this.movementInput(
        'mov-028',
        'prd-005',
        'wh-002',
        MovementType.IN,
        60,
        '2026-06-07T10:20:00.000Z',
        'Avrupa depo temizlik stoğu'
      ),

      this.movementInput(
        'mov-029',
        'prd-007',
        'wh-004',
        MovementType.IN,
        22,
        '2026-06-09T11:00:00.000Z',
        'Bursa depo hırdavat girişi'
      ),

      this.movementInput(
        'mov-030',
        'prd-011',
        'wh-003',
        MovementType.IN,
        14,
        '2026-06-12T09:45:00.000Z',
        'Ege depo elektronik girişi'
      )
    ];

    const movements =
      this.buildMovements(inputs);

    this.db.setAll(
      'stockMovements',
      movements
    );
  }


  private seedTransferRequests(): void {
    if (this.db.hasCollection('transferRequests')) {
      return;
    }

    const transfers: TransferRequest[] = [
      {
        id: 'trf-001',
        productId: 'prd-003',
        sourceWarehouseId: 'wh-001',
        destinationWarehouseId: 'wh-004',
        quantity: 4,
        status: TransferStatus.PENDING,
        requestedByUserId: 'user-depo-001',
        requestedAt: '2026-07-04T09:00:00.000Z',
        note: 'Bursa deposu satış hazırlığı için talep.',
        isActive: true,
        createdAt: '2026-07-04T09:00:00.000Z',
        updatedAt: '2026-07-04T09:00:00.000Z'
      },

      {
        id: 'trf-002',
        productId: 'prd-008',
        sourceWarehouseId: 'wh-003',
        destinationWarehouseId: 'wh-001',
        quantity: 10,
        status: TransferStatus.APPROVED,
        requestedByUserId: 'user-depo-001',
        approvedByUserId: 'user-operation-001',
        requestedAt: '2026-06-25T10:00:00.000Z',
        decidedAt: '2026-06-25T13:30:00.000Z',
        note: 'Merkez depo paketleme ihtiyacı.',
        isActive: true,
        createdAt: '2026-06-25T10:00:00.000Z',
        updatedAt: '2026-06-25T13:30:00.000Z'
      },

      {
        id: 'trf-003',
        productId: 'prd-006',
        sourceWarehouseId: 'wh-001',
        destinationWarehouseId: 'wh-003',
        quantity: 8,
        status: TransferStatus.CANCELLED,
        requestedByUserId: 'user-depo-001',
        approvedByUserId: 'user-operation-001',
        requestedAt: '2026-06-20T08:40:00.000Z',
        decidedAt: '2026-06-20T11:00:00.000Z',
        cancellationReason: 'Ege deposunda ihtiyaç ortadan kalktı.',
        isActive: true,
        createdAt: '2026-06-20T08:40:00.000Z',
        updatedAt: '2026-06-20T11:00:00.000Z'
      }
    ];

    this.db.setAll(
      'transferRequests',
      transfers
    );
  }


  private seedShipments(): void {
    if (this.db.hasCollection('shipments')) {
      return;
    }

    const shipments: Shipment[] = [
      {
        id: 'shp-001',
        code: 'SVK-2026-0001',
        sourceWarehouseId: 'wh-001',
        destinationName: 'ABC Teknoloji A.Ş.',
        destinationAddress: 'Çankaya / Ankara',
        plannedDate: '2026-07-08T08:00:00.000Z',
        status: ShipmentStatus.PLANNED,
        items: [
          {
            id: 'shi-001',
            shipmentId: 'shp-001',
            productId: 'prd-003',
            quantity: 3
          },
          {
            id: 'shi-002',
            shipmentId: 'shp-001',
            productId: 'prd-011',
            quantity: 4
          }
        ],
        note: 'Sabah teslimatı.',
        isActive: true,
        createdAt: '2026-07-05T10:00:00.000Z',
        updatedAt: '2026-07-05T10:00:00.000Z'
      },

      {
        id: 'shp-002',
        code: 'SVK-2026-0002',
        sourceWarehouseId: 'wh-002',
        destinationName: 'Marmara Üretim Ltd.',
        destinationAddress: 'Gebze / Kocaeli',
        plannedDate: '2026-07-06T07:30:00.000Z',
        status: ShipmentStatus.SHIPPED,
        items: [
          {
            id: 'shi-003',
            shipmentId: 'shp-002',
            productId: 'prd-007',
            quantity: 5
          }
        ],
        shippedAt: '2026-07-06T07:45:00.000Z',
        isActive: true,
        createdAt: '2026-07-03T12:00:00.000Z',
        updatedAt: '2026-07-06T07:45:00.000Z'
      },

      {
        id: 'shp-003',
        code: 'SVK-2026-0003',
        sourceWarehouseId: 'wh-003',
        destinationName: 'Ege Operasyon Merkezi',
        destinationAddress: 'Bornova / İzmir',
        plannedDate: '2026-07-02T09:00:00.000Z',
        status: ShipmentStatus.DELIVERED,
        items: [
          {
            id: 'shi-004',
            shipmentId: 'shp-003',
            productId: 'prd-008',
            quantity: 12
          }
        ],
        shippedAt: '2026-07-02T09:20:00.000Z',
        deliveredAt: '2026-07-02T14:10:00.000Z',
        isActive: true,
        createdAt: '2026-06-30T15:00:00.000Z',
        updatedAt: '2026-07-02T14:10:00.000Z'
      }
    ];

    this.db.setAll(
      'shipments',
      shipments
    );
  }


  private seedAuditLog(): void {
    if (this.db.hasCollection('auditLog')) {
      return;
    }

    const logs: AuditLogEntry[] = [
      {
        id: 'audit-001',
        timestamp: '2026-07-04T09:00:00.000Z',
        userId: 'user-depo-001',
        userName: 'Metehan Depo',
        userRole: UserRole.DEPO_SORUMLUSU,
        action: AuditActionType.TRANSFER,
        entityType: 'TransferRequest',
        entityId: 'trf-001',
        description: 'Yeni transfer talebi oluşturuldu.',
        newValue: {
          status: TransferStatus.PENDING,
          quantity: 4
        }
      },

      {
        id: 'audit-002',
        timestamp: '2026-06-25T13:30:00.000Z',
        userId: 'user-operation-001',
        userName: 'Operasyon Yöneticisi',
        userRole: UserRole.OPERASYON_YONETICISI,
        action: AuditActionType.APPROVE,
        entityType: 'TransferRequest',
        entityId: 'trf-002',
        description: 'Transfer talebi onaylandı.',
        oldValue: {
          status: TransferStatus.PENDING
        },
        newValue: {
          status: TransferStatus.APPROVED
        }
      },

      {
        id: 'audit-003',
        timestamp: '2026-07-05T10:00:00.000Z',
        userId: 'user-depo-001',
        userName: 'Metehan Depo',
        userRole: UserRole.DEPO_SORUMLUSU,
        action: AuditActionType.SHIPMENT,
        entityType: 'Shipment',
        entityId: 'shp-001',
        description: 'Yeni sevkiyat planlandı.',
        newValue: {
          status: ShipmentStatus.PLANNED
        }
      }
    ];

    this.db.setAll(
      'auditLog',
      logs
    );
  }


  private product(
    id: string,
    code: string,
    name: string,
    category: string,
    unit: UnitOfMeasure,
    barcode: string,
    unitPrice: number,
    defaultMinQuantity: number,
    description: string
  ): Product {
    return {
      id,
      code,
      name,
      category,
      unit,
      barcode,
      unitPrice,
      defaultMinQuantity,
      description,
      isActive: true,
      createdAt: '2026-01-01T08:00:00.000Z',
      updatedAt: '2026-06-01T08:00:00.000Z'
    };
  }


  private lowStockRule(
    id: string,
    productId: string,
    warehouseId: string,
    minQuantity: number,
    timestamp: string
  ): LowStockRule {
    return {
      id,
      productId,
      warehouseId,
      minQuantity,
      isActive: true,
      createdAt: timestamp,
      updatedAt: timestamp
    };
  }


  private movementInput(
    id: string,
    productId: string,
    warehouseId: string,
    type: MovementType,
    quantity: number,
    createdAt: string,
    reason: string
  ): MovementSeedInput {
    return {
      id,
      productId,
      warehouseId,
      type,
      quantity,
      createdAt,
      reason
    };
  }


  private buildMovements(
    inputs: readonly MovementSeedInput[]
  ): StockMovement[] {
    const balances =
      new Map<string, number>();

    return [...inputs]
      .sort(
        (first, second) =>
          new Date(first.createdAt).getTime()
          -
          new Date(second.createdAt).getTime()
      )
      .map(input => {
        const balanceKey =
          `${input.productId}::${input.warehouseId}`;

        const previousBalance =
          balances.get(balanceKey) ?? 0;

        const delta =
          this.movementDelta(
            input.type,
            input.quantity
          );

        const newBalance =
          previousBalance + delta;

        if (newBalance < 0) {
          throw new Error(
            `Seed hareketi negatif stok oluşturuyor: ${input.id}`
          );
        }

        balances.set(
          balanceKey,
          newBalance
        );

        return {
          id: input.id,
          productId: input.productId,
          warehouseId: input.warehouseId,
          type: input.type,
          quantity: input.quantity,
          previousBalance,
          newBalance,
          relatedTransferId:
            input.relatedTransferId,
          relatedShipmentId:
            input.relatedShipmentId,
          performedByUserId:
            'user-depo-001',
          performedByRole:
            UserRole.DEPO_SORUMLUSU,
          reason: input.reason,
          createdAt: input.createdAt,
          updatedAt: input.createdAt,
          isCancelled: false
        };
      });
  }


  private movementDelta(
    type: MovementType,
    quantity: number
  ): number {
    switch (type) {
      case MovementType.IN:
      case MovementType.TRANSFER_IN:
        return quantity;

      case MovementType.OUT:
      case MovementType.TRANSFER_OUT:
        return -quantity;

      case MovementType.ADJUSTMENT:
        return quantity;

      default: {
        const exhaustiveCheck: never =
          type;

        throw new Error(
          `Bilinmeyen hareket tipi: ${exhaustiveCheck}`
        );
      }
    }
  }
}
