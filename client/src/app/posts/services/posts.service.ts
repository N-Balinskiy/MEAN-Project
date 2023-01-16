import { Injectable } from '@angular/core';
import { map, Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { Post } from '../interfaces/post.interface';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable({providedIn: 'root'})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{ posts: Post[], postsCount: number }>();

  private readonly BACKEND_URL = environment.apiUrl +'/posts/';

  constructor(private http: HttpClient, private router: Router) {
  }

  getPosts(postsPerPage: number, currentPage: number): void {
    const queryParams = `?pageSize=${postsPerPage}&page=${currentPage}`;
    this.http.get<{ message: string, posts: any, postsCount: number }>(this.BACKEND_URL + queryParams)
      .pipe(
        map((postData) => {
          return {
            posts: postData.posts.map((post: any) => {
              return {
                title: post.title,
                content: post.content,
                id: post._id,
                imagePath: post.imagePath,
                creator: post.creator
              }
            }),
            postsCount: postData.postsCount
          };
        })
      )
      .subscribe((transformedPostData) => {
        this.posts = transformedPostData.posts;
        this.postsUpdated.next({ posts: [...this.posts], postsCount: transformedPostData.postsCount});
      });
  }

  getPostUpdateListener(): Observable<{ posts: Post[], postsCount: number }> {
    return this.postsUpdated.asObservable();
  }

  getPost(id: string): Observable<{ _id: string, title: string, content: string, imagePath: string, creator: string }> { // TODO change this object to PostResponse interface
    return this.http.get<{ _id: string, title: string, content: string, imagePath: string, creator: string }>(this.BACKEND_URL + id);
  }

  addPost(title: string, content: string, image: File): void {
    const postData = new FormData();
    postData.append("title", title);
    postData.append("content", content);
    postData.append("image", image, title);
    this.http.post<{ message: string, post: Post }>(this.BACKEND_URL, postData)
      .subscribe(() => {
        this.router.navigate(['/']);
      });
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData;
    if (typeof(image) === 'object') {
      postData = new FormData();
      postData.append("id", id);
      postData.append("title", title);
      postData.append("content", content);
      postData.append("image", image, title);
    } else {
      postData = { id, title, content, imagePath: image, creator: null };
    }

    this.http.put(this.BACKEND_URL + id, postData)
      .subscribe( () => {
        this.router.navigate(['/']);
      });
  }

  deletePost(postId: string): Observable<Object> {
    return this.http.delete(this.BACKEND_URL + postId);
  }
}
