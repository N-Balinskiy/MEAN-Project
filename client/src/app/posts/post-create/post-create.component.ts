import { Component } from '@angular/core';

@Component({
  selector: 'mean-post-create',
  templateUrl: 'post-create.component.html',
  styleUrls: ['post-create.component.scss']
})
export class PostCreateComponent {
  newPost = 'No content';

  onAddPost(postInput: HTMLTextAreaElement) {
    this.newPost = postInput.value;
  }
}
