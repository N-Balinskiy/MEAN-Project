import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { AuthService } from '../../authentication/services/auth.service';
import { Comment } from '../interfaces/comment.interface';
import { Post } from '../interfaces/post.interface';
import { PostsService } from '../services/posts.service';

@UntilDestroy()
@Component({
  selector: 'mean-post-list',
  templateUrl: 'post-list.component.html',
  styleUrls: ['post-list.component.scss'],
})
export class PostListComponent implements OnInit {
  posts: Post[] = [];
  isLoading = false;
  totalPosts = 0;
  postsPerPage = 5;
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 10];
  userAuthenticated = false;
  userId: string | null = '';
  isAdmin: boolean = false;
  commentsButton: string = 'Show Comments';
  form: Nullable<FormGroup> = null;

  constructor(private postsService: PostsService, private authService: AuthService) {}

  ngOnInit() {
    this.isLoading = true;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
    this.authService.getUserId().subscribe(userId => (this.userId = userId));
    this.authService.getUserRoles().subscribe(userRoles => (this.isAdmin = userRoles.includes('ADMIN')));
    this.authService
      .getAuthStatusListener()
      .pipe(untilDestroyed(this))
      .subscribe(isAuthenticated => {
        this.userAuthenticated = isAuthenticated;
      });
    this.postsService
      .getPostUpdateListener()
      .pipe(untilDestroyed(this))
      .subscribe((postData: { posts: Post[]; postsCount: number }) => {
        this.isLoading = false;
        this.posts = postData.posts;
        this.totalPosts = postData.postsCount;
      });

    this.initFormGroup();
  }

  onDeletePost(postId: string): void {
    this.postsService.deletePost(postId);
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
  }

  onChangedPage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
  }

  onOpenPanel(): void {
    this.commentsButton = 'Hide Comments';
  }

  onClosePanel(): void {
    this.commentsButton = 'Show Comments';
  }

  pinPost(e: Event, postId: string, postPinnedStatus: boolean): void {
    e.stopPropagation();
    this.postsService
      .pinPost(postId, !postPinnedStatus)
      .subscribe(() => this.postsService.getPosts(this.postsPerPage, this.currentPage));
  }

  onSaveComment(post: Post) {
    if (this.form?.invalid) {
      return;
    }
    this.postsService.addComment(post.id, this.form?.value.comment);
    this.form?.reset();
  }

  onDeleteComment(postId: string, comment: Comment): void {
    this.postsService.deleteComment(postId, comment);
  }

  private initFormGroup(): void {
    this.form = new FormGroup({
      comment: new FormControl(null),
    });
  }
}
