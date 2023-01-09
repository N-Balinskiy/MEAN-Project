import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { PostsService } from '../services/posts.service';

@Component({
  selector: 'mean-post-create',
  templateUrl: 'post-create.component.html',
  styleUrls: ['post-create.component.scss']
})
export class PostCreateComponent {

  constructor(private postsService: PostsService) {
  }

  onAddPost(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.postsService.addPost(form.value.title, form.value.content);
    form.resetForm();
  }
}
