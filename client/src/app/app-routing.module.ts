import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RoleGuard } from './admin/guards/role-guard';
import { AuthGuard } from './authentication/guards/auth-guard';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { PostCreateComponent } from './posts/post-create/post-create.component';
import { PostListComponent } from './posts/post-list/post-list.component';
import { PageLinks } from './shared/enums/page-links.enum';

const routes: Routes = [
  {
    path: PageLinks.PostsList,
    component: PostListComponent,
    pathMatch: 'full',
  },
  {
    path: PageLinks.ContactUs,
    component: ContactUsComponent,
  },
  {
    path: PageLinks.CreatePost,
    component: PostCreateComponent,
    canActivate: [AuthGuard],
  },
  {
    path: PageLinks.EditPost + '/:postId',
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
