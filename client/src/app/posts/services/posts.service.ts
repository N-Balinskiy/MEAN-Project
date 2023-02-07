import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable, Subject } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthService } from '../../authentication/services/auth.service';
import { Post } from '../interfaces/post.interface';
import { PostsSocketService } from './posts-socket.service';

@Injectable({ providedIn: 'root' })
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{ posts: Post[]; postsCount: number }>();
  private currentPostPage: number = 1;
  private postsPerPage: number = 1;

  private readonly BACKEND_URL = environment.apiUrl + '/posts/';

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

  getPost(id: string): Observable<{ _id: string; title: string; content: string; imagePath: string; creator: string }> {
    // TODO change this object to PostResponse interface
    return this.http.get<{ _id: string; title: string; content: string; imagePath: string; creator: string }>(
      this.BACKEND_URL + id
    );
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
      postData = { id, title, content, imagePath: image, creator: '' };
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
  }

  private refreshPosts(post: any, updateForAll: boolean = false) {
    if (updateForAll || post.creator != this.authService.getUserId()) {
      this.getPosts(this.postsPerPage, this.currentPostPage);
    }
  }
}
