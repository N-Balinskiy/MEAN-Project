import { Component, OnDestroy, OnInit } from '@angular/core';

import { Post } from '../interfaces/post.interface';
import { PostsService } from '../services/posts.service';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { AuthService } from '../../authentication/services/auth.service';

@Component({
  selector: 'mean-post-list',
  templateUrl: 'post-list.component.html',
  styleUrls: ['post-list.component.scss']
})
export class PostListComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  isLoading = false;
  totalPosts = 0;
  postsPerPage = 2;
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 10];
  userAuthenticated = false;
  userId: string | null = '';

  private authListenerSubs!: Subscription;

  private postsSubscription: Nullable<Subscription> = null;

  constructor(private postsService: PostsService, private authService: AuthService) {}

  ngOnInit() {
    this.isLoading = true;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
    this.userId = this.authService.getUserId();
    this.postsSubscription = this.postsService.getPostUpdateListener()
      .subscribe((postData: { posts: Post[], postsCount: number }) => {
        this.isLoading = false;
        this.posts = postData.posts;
        this.totalPosts = postData.postsCount;
      });
    this.userAuthenticated = this.authService.getIsAuth();
    this.authListenerSubs = this.authService.getAuthStatusListener().subscribe(isAuthenticated => {
        this.userAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId();
      }
    );
  }

  ngOnDestroy() {
    this.postsSubscription?.unsubscribe();
    this.authListenerSubs.unsubscribe();
  }

  onDelete(postId: string): void {
    this.isLoading = true;
    this.postsService.deletePost(postId).subscribe({
        next: () => this.postsService.getPosts(this.postsPerPage, this.currentPage),
        error: () => this.isLoading = false
      }
    );
  }

  onChangedPage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
  }
}
