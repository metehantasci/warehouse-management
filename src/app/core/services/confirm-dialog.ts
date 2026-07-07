import {
  Injectable,
  signal
} from '@angular/core';

export type ConfirmDialogVariant =
  | 'danger'
  | 'warning'
  | 'info';

export type ConfirmDialogMode =
  | 'confirm'
  | 'prompt';

export interface ConfirmDialogState {
  isOpen: boolean;
  mode: ConfirmDialogMode;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  variant: ConfirmDialogVariant;
  inputLabel: string;
  inputPlaceholder: string;
  inputValue: string;
  inputRequired: boolean;
}

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmDialogVariant;
}

export interface PromptDialogOptions
  extends ConfirmDialogOptions {
  inputLabel?: string;
  inputPlaceholder?: string;
  inputRequired?: boolean;
  initialValue?: string;
}

const CLOSED_DIALOG_STATE:
  ConfirmDialogState = {
    isOpen: false,
    mode: 'confirm',
    title: '',
    message: '',
    confirmText: 'Onayla',
    cancelText: 'Vazgeç',
    variant: 'warning',
    inputLabel: '',
    inputPlaceholder: '',
    inputValue: '',
    inputRequired: false
  };

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  private readonly dialogState =
    signal<ConfirmDialogState>(
      CLOSED_DIALOG_STATE
    );

  readonly state =
    this.dialogState.asReadonly();

  private confirmResolver:
    ((result: boolean) => void)
    | null = null;

  private promptResolver:
    ((result: string | null) => void)
    | null = null;

  confirm(
    options: ConfirmDialogOptions
  ): Promise<boolean> {
    this.cancelActive();

    this.dialogState.set({
      isOpen: true,
      mode: 'confirm',
      title: options.title,
      message: options.message,
      confirmText:
        options.confirmText
        ?? 'Onayla',
      cancelText:
        options.cancelText
        ?? 'Vazgeç',
      variant:
        options.variant
        ?? 'warning',
      inputLabel: '',
      inputPlaceholder: '',
      inputValue: '',
      inputRequired: false
    });

    return new Promise<boolean>(
      resolve => {
        this.confirmResolver =
          resolve;
      }
    );
  }

  prompt(
    options: PromptDialogOptions
  ): Promise<string | null> {
    this.cancelActive();

    this.dialogState.set({
      isOpen: true,
      mode: 'prompt',
      title: options.title,
      message: options.message,
      confirmText:
        options.confirmText
        ?? 'Devam Et',
      cancelText:
        options.cancelText
        ?? 'Vazgeç',
      variant:
        options.variant
        ?? 'warning',
      inputLabel:
        options.inputLabel
        ?? 'Açıklama',
      inputPlaceholder:
        options.inputPlaceholder
        ?? '',
      inputValue:
        options.initialValue
        ?? '',
      inputRequired:
        options.inputRequired
        ?? true
    });

    return new Promise<
      string | null
    >(
      resolve => {
        this.promptResolver =
          resolve;
      }
    );
  }

  setInputValue(
    value: string
  ): void {
    this.dialogState.update(
      current => ({
        ...current,
        inputValue: value
      })
    );
  }

  accept(): void {
    const current =
      this.dialogState();

    if (
      current.mode === 'prompt'
    ) {
      const value =
        current.inputValue.trim();

      if (
        current.inputRequired
        &&
        !value
      ) {
        return;
      }

      this.promptResolver?.(
        value
      );

      this.promptResolver = null;
      this.close();
      return;
    }

    this.confirmResolver?.(true);
    this.confirmResolver = null;
    this.close();
  }

  cancel(): void {
    const current =
      this.dialogState();

    if (
      current.mode === 'prompt'
    ) {
      this.promptResolver?.(null);
      this.promptResolver = null;
    } else {
      this.confirmResolver?.(false);
      this.confirmResolver = null;
    }

    this.close();
  }

  private cancelActive():
    void {
    this.confirmResolver?.(false);
    this.confirmResolver = null;

    this.promptResolver?.(null);
    this.promptResolver = null;
  }

  private close(): void {
    this.dialogState.set(
      CLOSED_DIALOG_STATE
    );
  }
}
