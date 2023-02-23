import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable, Subject } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthService } from '../../authentication/services/auth.service';
import { Comment } from '../interfaces/comment.interface';
import { Post } from '../interfaces/post.interface';
import { PostsSocketService } from './posts-socket.service';

@Injectable({ providedIn: 'root' })
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{ posts: Post[]; postsCount: number }>();
  private currentPostPage: number = 1;
  private postsPerPage: number = 1;

  private readonly BACKEND_URL = environment.apiUrl + '/posts/';
  private readonly COMMENT_BACKEND_URL = environment.apiUrl + '/comment/';

  constructor(
    private http: HttpClient,
    private router: Router,
    private postsSocketService: PostsSocketService,
    private authService: AuthService
  ) {
    this.observePostSocket();
  }

  getPosts(postsPerPage: number, currentPage: number): void {
    const queryParams = `?pageSize=${postsPerPage}&page=${currentPage}`;
    this.currentPostPage = currentPage;
    this.postsPerPage = postsPerPage;
    this.http
      .get<{ message: string; posts: any; postsCount: number }>(this.BACKEND_URL + queryParams)
      .pipe(
        map(postData => {
          return {
            posts: postData.posts.map((post: any) => {
              return {
                title: post.title,
                content: post.content,
                id: post._id,
                imagePath: post.imagePath,
                creator: post.creator,
                isPinned: post.isPinned,
                comments: post.comments,
              };
            }),
            postsCount: postData.postsCount,
          };
        })
      )
      .subscribe(transformedPostData => {
        this.posts = transformedPostData.posts;
        this.postsUpdated.next({ posts: [...this.posts], postsCount: transformedPostData.postsCount });
      });
  }

  getPostUpdateListener(): Observable<{ posts: Post[]; postsCount: number }> {
    return this.postsUpdated.asObservable();
  }

  getPost(id: string): Observable<{
    _id: string;
    title: string;
    content: string;
    imagePath: string;
    creator: string;
    isPinned: boolean;
  }> {
    // TODO change this object to PostResponse interface
    return this.http.get<{
      _id: string;
      title: string;
      content: string;
      imagePath: string;
      creator: string;
      isPinned: boolean;
    }>(this.BACKEND_URL + id);
  }

  addPost(title: string, content: string, image: File): void {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image);
    this.http.post<{ message: string; post: Post }>(this.BACKEND_URL, postData).subscribe(() => {
      this.router.navigate(['/']);
      this.postsSocketService.emitCreatePostSocket(postData);
    });
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;
    if (typeof image === 'object') {
      postData = new FormData();
      postData.append('id', id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image);
    } else {
      postData = { id, title, content, imagePath: image, creator: '', isPinned: false };
    }

    this.http.put(this.BACKEND_URL + id, postData).subscribe(() => {
      this.router.navigate(['/']);
      this.postsSocketService.emitUpdatePostSocket(postData);
    });
  }

  deletePost(postId: string): void {
    let postData: Post | null = this.posts.find(post => post.id == postId) ?? null;
    this.http
      .delete(this.BACKEND_URL + postId + `${postData?.imagePath.replace('http://localhost:3000/images', '')}`)
      .subscribe(() => this.postsSocketService.emitDeletePostSocket(postData));
  }

  addComment(postId: string, comment: string): void {
    let postData: Post | null = this.posts.find(post => post.id == postId) ?? null;
    this.http.post(this.COMMENT_BACKEND_URL + postId, { text: comment }).subscribe(() => {
      this.getPosts(this.postsPerPage, this.currentPostPage);
      this.postsSocketService.emitDeletePostSocket(postData);
    });
  }

  deleteComment(postId: string, comment: Comment): void {
    const body = { commentId: comment._id, author: comment.author };
    let commentData: Comment | null =
      this.posts.find(post => post.id == postId)?.comments?.find(com => com._id == comment._id) ?? null;
    this.http.delete(this.COMMENT_BACKEND_URL + postId, { body }).subscribe(() => {
      this.postsSocketService.emitDeleteCommentSocket(commentData);
      this.getPosts(this.postsPerPage, this.currentPostPage);
    });
  }

  pinPost(postId: string, postPinnedStatus: boolean): Observable<any> {
    return this.http.put(this.BACKEND_URL, { id: postId, postPinnedStatus });
  }

  private observePostSocket() {
    this.postsSocketService.receiveCreatePostSocket().subscribe((post: any) => {
      console.log(`Create ${post.id} Post socket received`);
      this.refreshPosts(post);
    });

    this.postsSocketService.receiveUpdatePostSocket().subscribe((post: any) => {
      console.log(`Update ${post.id} Post socket received`);
      this.refreshPosts(post);
    });

    this.postsSocketService.receiveDeletePostSocket().subscribe((post: any) => {
      console.log(`Delete ${post.id} Post socket received`);
      this.refreshPosts(post, true);
    });

    this.postsSocketService.receiveDeleteCommentSocket().subscribe((comment: any) => {
      console.log(`Delete ${comment._id} Comment socket received`);
      this.refreshComments(comment, true);
    });

    this.postsSocketService.receiveAddCommentSocket().subscribe((post: any) => {
      console.log(`Add ${post.id} Comment socket received`);
      this.refreshPosts(post, true);
    });
  }

  private refreshPosts(post: any, updateForAll: boolean = false) {
    if (updateForAll || post.creator != this.authService.getUserId()) {
      this.getPosts(this.postsPerPage, this.currentPostPage);
    }
  }

  private refreshComments(comment: any, updateForAll: boolean = false) {
    if (updateForAll || comment.author != this.authService.getUserId()) {
      this.getPosts(this.postsPerPage, this.currentPostPage);
    }
  }
}
