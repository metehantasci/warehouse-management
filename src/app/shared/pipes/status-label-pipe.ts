import { Pipe, PipeTransform } from '@angular/core';

const STATUS_LABELS: Readonly<Record<string, string>> = {
  PENDING: 'Bekliyor',
  APPROVED: 'Onaylandı',
  CANCELLED: 'İptal Edildi',

  PLANNED: 'Planlandı',
  CONFIRMED: 'Onaylandı',
  SHIPPED: 'Gönderildi',
  DELIVERED: 'Teslim Edildi',

  NORMAL: 'Normal',
  LOW: 'Düşük Stok',
  CRITICAL: 'Kritik Stok',
  OUT_OF_STOCK: 'Stok Tükendi',

  IN: 'Stok Girişi',
  OUT: 'Stok Çıkışı',
  ADJUSTMENT: 'Stok Düzeltme',
  TRANSFER_IN: 'Transfer Girişi',
  TRANSFER_OUT: 'Transfer Çıkışı',

  CREATE: 'Oluşturma',
  UPDATE: 'Güncelleme',
  DELETE: 'Silme',
  APPROVE: 'Onaylama',
  CANCEL: 'İptal',
  STATUS_CHANGE: 'Durum Değişikliği',
  STOCK_IN: 'Stok Girişi',
  STOCK_OUT: 'Stok Çıkışı',
  TRANSFER: 'Transfer',
  SHIPMENT: 'Sevkiyat',
  LOGIN: 'Giriş',
  EXPORT: 'Dışa Aktarma'
};

@Pipe({
  name: 'statusLabel',
  standalone: true
})
export class StatusLabelPipe implements PipeTransform {
  transform(
    value: string | null | undefined,
    fallback = '-'
  ): string {
    if (!value) {
      return fallback;
    }

    return STATUS_LABELS[value] ?? value;
  }
}
