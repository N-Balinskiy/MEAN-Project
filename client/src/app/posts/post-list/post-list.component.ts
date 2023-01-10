import { Component, OnDestroy, OnInit } from '@angular/core';

import { Post } from '../interfaces/post.interface';
import { PostsService } from '../services/posts.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'mean-post-list',
  templateUrl: 'post-list.component.html',
  styleUrls: ['post-list.component.scss']
})
export class PostListComponent implements OnInit, OnDestroy {
  posts: Post[] = [];

  private postsSubscription: Nullable<Subscription> = null;

  constructor(private postsService: PostsService) {}

  ngOnInit() {
    this.postsService.getPosts();
    this.postsSubscription = this.postsService.getPostUpdateListener()
      .subscribe((posts: Post[]) => {
        this.posts = posts;
      })
  }

  ngOnDestroy() {
    this.postsSubscription?.unsubscribe();
  }

  onDelete(postId: string): void {
    this.postsService.deletePost(postId);
  }
}
