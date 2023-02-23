import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';

@Injectable()
export class PostsSocketService {
  constructor(private socket: Socket) {}

  emitCreatePostSocket(post: any) {
    this.socket.emit('createPost', post);
  }

  receiveCreatePostSocket() {
    return new Observable((observer: any) => {
      this.socket.on('createPost', (post: any) => {
        observer.next(post);
      });
    });
  }

  emitUpdatePostSocket(post: any) {
    this.socket.emit('updatePost', post);
  }

  receiveUpdatePostSocket() {
    return new Observable((observer: any) => {
      this.socket.on('updatePost', (post: any) => {
        observer.next(post);
      });
    });
  }

  emitDeletePostSocket(post: any) {
    this.socket.emit('deletePost', post);
  }

  receiveDeletePostSocket() {
    return new Observable((observer: any) => {
      this.socket.on('deletePost', (post: any) => {
        observer.next(post);
      });
    });
  }

  receiveDeleteCommentSocket() {
    return new Observable((observer: any) => {
      this.socket.on('deleteComment', (comment: any) => {
        observer.next(comment);
      });
    });
  }

  emitDeleteCommentSocket(comment: any) {
    this.socket.emit('deleteComment', comment);
  }

  receiveAddCommentSocket() {
    return new Observable((observer: any) => {
      this.socket.on('addComment', (post: any) => {
        observer.next(post);
      });
    });
  }

  emitAddCommentSocket(post: any) {
    this.socket.emit('addComment', post);
  }
}
