import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';

import { PostCreateComponent } from './post-create/post-create.component';
import { PostListComponent } from './post-list/post-list.component';
import { PostsSocketService } from './services/posts-socket.service';

const socketIoConfig: SocketIoConfig = {
  url: 'http://localhost:3000',
  options: {},
};

@NgModule({
  declarations: [PostListComponent, PostCreateComponent],
  imports: [
    CommonModule,
    RouterModule,
    MatInputModule,
    MatCardModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatExpansionModule,
    MatPaginatorModule,
    SocketIoModule.forRoot(socketIoConfig),
    MatIconModule,
    MatTooltipModule,
  ],
  providers: [PostsSocketService],
})
export class PostsModule {}
