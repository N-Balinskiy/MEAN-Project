import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RoleGuard } from './admin/guards/role-guard';
import { AuthGuard } from './authentication/guards/auth-guard';
import { PostCreateComponent } from './posts/post-create/post-create.component';
import { PostListComponent } from './posts/post-list/post-list.component';

const routes: Routes = [
  {
    path: '',
    component: PostListComponent,
  },
  {
    path: 'create',
    component: PostCreateComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'edit/:postId',
    component: PostCreateComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'auth',
    loadChildren: () => import('./authentication/auth.module').then(m => m.AuthModule),
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canActivate: [RoleGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
  providers: [AuthGuard],
})
export class AppRoutingModule {}
