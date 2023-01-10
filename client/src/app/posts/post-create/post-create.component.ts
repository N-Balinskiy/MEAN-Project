import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { PostsService } from '../services/posts.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Post } from '../interfaces/post.interface';

@Component({
  selector: 'mean-post-create',
  templateUrl: 'post-create.component.html',
  styleUrls: ['post-create.component.scss']
})
export class PostCreateComponent implements OnInit{
  post!: Post;
  isLoading = false;

  private mode = 'create';
  private postId: string | null = null;

  constructor(private postsService: PostsService,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if(paramMap.has('postId')) {
        this.mode = 'edit'
        this.postId = paramMap.get('postId');
        this.isLoading = true;
        this.postsService.getPost(this.postId ?? '').subscribe(postData => {
          this.isLoading = false;
          this.post = { id: postData._id, title: postData.title, content: postData.content }
        });
      } else {
        this.mode = 'create';
        this.postId = null;
      }
    })
  }

  onSavePost(form: NgForm) {
    if (form.invalid) {
      return;
    }

    this.isLoading = true;
    this.mode === 'create'
      ? this.postsService.addPost(form.value.title, form.value.content)
      : this.postsService.updatePost(this.postId ?? '', form.value.title, form.value.content);
    form.resetForm();
  }
}
