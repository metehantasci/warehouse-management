import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  inject
} from '@angular/core';

import {
  Subject,
  Subscription,
  debounceTime,
  distinctUntilChanged
} from 'rxjs';

@Directive({
  selector: '[appDebounce]',
  standalone: true
})
export class DebounceDirective
  implements OnInit, OnDestroy {

  private readonly elementRef =
    inject<ElementRef<HTMLInputElement>>(
      ElementRef
    );

  private readonly valueSubject =
    new Subject<string>();

  private subscription:
    Subscription | null = null;

  private inputListener:
    (() => void) | null = null;

  @Input()
  debounceTime = 350;

  @Output()
  readonly debouncedValue =
    new EventEmitter<string>();

  ngOnInit(): void {
    this.subscription =
      this.valueSubject
        .pipe(
          debounceTime(this.debounceTime),
          distinctUntilChanged()
        )
        .subscribe(value => {
          this.debouncedValue.emit(value);
        });

    const element =
      this.elementRef.nativeElement;

    const listener = (): void => {
      this.valueSubject.next(
        element.value
      );
    };

    element.addEventListener(
      'input',
      listener
    );

    this.inputListener = () => {
      element.removeEventListener(
        'input',
        listener
      );
    };
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.inputListener?.();
    this.valueSubject.complete();
  }
}
