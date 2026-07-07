import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth';
interface DemoAccount{name:string;role:string;email:string;password:string;}
@Component({selector:'app-login',standalone:true,imports:[ReactiveFormsModule],templateUrl:'./login.html',styleUrl:'./login.scss'})
export class LoginPage{
  private readonly fb=inject(FormBuilder);private readonly auth=inject(AuthService);private readonly router=inject(Router);private readonly route=inject(ActivatedRoute);
  readonly error=signal<string|null>(null);readonly submitting=signal(false);
  readonly demoAccounts:readonly DemoAccount[]=[
    {name:'Metehan Depo',role:'Depo Sorumlusu',email:'depo@wms.local',password:'123456'},
    {name:'Operasyon Yöneticisi',role:'Operasyon Yöneticisi',email:'operasyon@wms.local',password:'123456'},
    {name:'Görüntüleyici Kullanıcı',role:'Görüntüleyici',email:'viewer@wms.local',password:'123456'}
  ];
  readonly form=this.fb.nonNullable.group({email:['operasyon@wms.local',[Validators.required,Validators.email]],password:['123456',[Validators.required,Validators.minLength(6)]]});
  submit():void{
    this.error.set(null);if(this.form.invalid){this.form.markAllAsTouched();return;}this.submitting.set(true);
    const v=this.form.getRawValue();const user=this.auth.login(v.email,v.password);
    if(!user){this.submitting.set(false);this.error.set('E-posta veya şifre hatalı.');return;}
    const requested=this.route.snapshot.queryParamMap.get('returnUrl');const target=requested&&requested.startsWith('/')&&!requested.startsWith('//')?requested:'/dashboard';
    this.router.navigateByUrl(target).finally(()=>this.submitting.set(false));
  }
  useAccount(a:DemoAccount):void{this.form.setValue({email:a.email,password:a.password});this.submit();}
}