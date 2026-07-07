import {
  Component,
  HostListener,
  inject
} from '@angular/core';

import {
  ConfirmDialogService
} from '../../../core/services/confirm-dialog';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [],
  templateUrl:
    './confirm-dialog.html',
  styleUrl:
    './confirm-dialog.scss'
})
export class ConfirmDialog {
  readonly dialog =
    inject(ConfirmDialogService);

  onInput(
    event: Event
  ): void {
    const target =
      event.target;

    if (
      target instanceof
      HTMLInputElement
    ) {
      this.dialog.setInputValue(
        target.value
      );
    }
  }

  confirmDisabled():
    boolean {
    const state =
      this.dialog.state();

    return (
      state.mode === 'prompt'
      &&
      state.inputRequired
      &&
      !state.inputValue.trim()
    );
  }

  @HostListener(
    'document:keydown.escape'
  )
  onEscape(): void {
    if (
      this.dialog.state().isOpen
    ) {
      this.dialog.cancel();
    }
  }
}
