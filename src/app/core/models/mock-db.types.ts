export type MockDbCollectionName =
  | 'products'
  | 'warehouses'
  | 'stockMovements'
  | 'transferRequests'
  | 'shipments'
  | 'lowStockRules'
  | 'barcodeRecords'
  | 'auditLog';

export const MOCK_DB_STORAGE_KEYS:
  Readonly<Record<MockDbCollectionName, string>> = {
    products: 'wms_v1_products',
    warehouses: 'wms_v1_warehouses',
    stockMovements: 'wms_v1_stock_movements',
    transferRequests: 'wms_v1_transfer_requests',
    shipments: 'wms_v1_shipments',
    lowStockRules: 'wms_v1_low_stock_rules',
    barcodeRecords: 'wms_v1_barcode_records',
    auditLog: 'wms_v1_audit_log'
  };
