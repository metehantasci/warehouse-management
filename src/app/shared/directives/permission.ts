import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject,
  signal
} from '@angular/core';

import {
  UserRole
} from '../../core/models/user-role.enum';

import {
  AuthService
} from '../../core/services/auth';

@Directive({
  selector: '[appPermission]',
  standalone: true
})
export class PermissionDirective {
  private readonly templateRef =
    inject(TemplateRef<unknown>);

  private readonly viewContainer =
    inject(ViewContainerRef);

  private readonly auth =
    inject(AuthService);

  private readonly allowedRoles =
    signal<readonly string[]>([]);

  private rendered = false;

  private readonly syncView =
    effect(() => {
      const currentRole =
        this.auth.currentRole();

      const allowed =
        this.allowedRoles();

      const permitted =
        !!currentRole
        &&
        allowed.includes(
          String(currentRole)
        );

      if (
        permitted
        &&
        !this.rendered
      ) {
        this.viewContainer
          .createEmbeddedView(
            this.templateRef
          );

        this.rendered = true;
        return;
      }

      if (
        !permitted
        &&
        this.rendered
      ) {
        this.viewContainer.clear();
        this.rendered = false;
      }
    });

  @Input()
  set appPermission(
    value:
      | readonly (
          UserRole
          | string
        )[]
      | UserRole
      | string
      | null
      | undefined
  ) {
    if (
      value === null
      ||
      value === undefined
    ) {
      this.allowedRoles.set([]);
      return;
    }

    const roles =
      Array.isArray(value)
        ? value
        : [value];

    this.allowedRoles.set(
      roles.map(
        role => String(role)
      )
    );
  }
}
