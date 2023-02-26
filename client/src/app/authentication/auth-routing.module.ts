import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PageLinks } from '../shared/enums/page-links.enum';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';

const routes: Routes = [
  {
    path: PageLinks.LoginPage,
    component: LoginComponent,
  },
  {
    path: PageLinks.SignupPage,
    component: SignupComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
