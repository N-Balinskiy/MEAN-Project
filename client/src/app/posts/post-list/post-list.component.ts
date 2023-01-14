import { Component, OnDestroy, OnInit } from '@angular/core';

import { Post } from '../interfaces/post.interface';
import { PostsService } from '../services/posts.service';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';

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

  private postsSubscription: Nullable<Subscription> = null;

  constructor(private postsService: PostsService) {}

  ngOnInit() {
    this.isLoading = true;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
    this.postsSubscription = this.postsService.getPostUpdateListener()
      .subscribe((postData: { posts: Post[], postsCount: number }) => {
        this.isLoading = false;
        this.posts = postData.posts;
        this.totalPosts = postData.postsCount;
      })
  }

  ngOnDestroy() {
    this.postsSubscription?.unsubscribe();
  }

  onDelete(postId: string): void {
    this.isLoading = true;
    this.postsService.deletePost(postId).subscribe(() => {
        this.postsService.getPosts(this.postsPerPage, this.currentPage)
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
