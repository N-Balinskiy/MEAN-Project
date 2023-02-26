import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';

import { AdminRoutingModule } from './admin-routing.module';
import { UsersListComponent } from './components/users-list.component';

const socketIoConfig: SocketIoConfig = {
  url: 'http://localhost:3000',
  options: {},
};

@NgModule({
  declarations: [UsersListComponent],
  imports: [
    CommonModule,
    RouterModule,
    MatInputModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    MatButtonModule,
    SocketIoModule.forRoot(socketIoConfig),
    AdminRoutingModule,
    MatTableModule,
    MatIconModule,
    MatTooltipModule,
  ],
  // providers: [PostsSocketService],
})
export class AdminModule {}
