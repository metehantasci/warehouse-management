import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';

import {
  inject
} from '@angular/core';

import {
  catchError,
  throwError
} from 'rxjs';

import {
  NotificationService
} from '../services/notification';


export const errorHandlingInterceptor:
  HttpInterceptorFn = (
    request,
    next
  ) => {

    const notificationService =
      inject(NotificationService);


    return next(request).pipe(
      catchError(error => {

        const message =
          resolveMessage(error);


        notificationService.error(
          message
        );


        return throwError(
          () => error
        );
      })
    );
  };


function resolveMessage(
  error: unknown
): string {

  if (
    error instanceof
    HttpErrorResponse
  ) {

    const apiMessage =
      error.error?.message;


    if (
      typeof apiMessage === 'string'
    ) {
      return apiMessage;
    }


    switch (error.status) {

      case 0:
        return 'Sunucuya ulaşılamadı.';

      case 400:
        return 'Geçersiz istek.';

      case 401:
        return 'Oturum doğrulanamadı.';

      case 403:
        return 'Bu işlem için yetkiniz yok.';

      case 404:
        return 'İstenen kayıt bulunamadı.';

      case 409:
        return 'İşlem mevcut verilerle çakışıyor.';

      case 500:
        return 'Beklenmeyen sunucu hatası oluştu.';

      case 503:
        return 'Servis geçici olarak kullanılamıyor.';

      default:
        return 'İşlem sırasında hata oluştu.';
    }
  }


  if (
    error instanceof Error
  ) {
    return error.message;
  }


  return 'Bilinmeyen bir hata oluştu.';
}
