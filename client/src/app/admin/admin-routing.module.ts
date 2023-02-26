import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PageLinks } from '../shared/enums/page-links.enum';
import { UsersListComponent } from './components/users-list.component';

const routes: Routes = [
  {
    path: PageLinks.UsersList,
    component: UsersListComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
