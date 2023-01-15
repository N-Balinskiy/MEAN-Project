import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PostsService } from '../services/posts.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Post } from '../interfaces/post.interface';
import { mimeType } from '../validators/mime-type.validator';

@Component({
  selector: 'mean-post-create',
  templateUrl: 'post-create.component.html',
  styleUrls: ['post-create.component.scss']
})
export class PostCreateComponent implements OnInit {
  post: Nullable<Post> = null;
  isLoading = false;
  form: Nullable<FormGroup> = null;
  imagePreview: string = '';

  private mode = 'create';
  private postId: string | null = null;

  constructor(private postsService: PostsService,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.initFormGroup();

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit'
        this.postId = paramMap.get('postId');
        this.isLoading = true;
        this.postsService.getPost(this.postId ?? '').subscribe(postData => {
          this.isLoading = false;
          this.post = {
            id: postData._id,
            title: postData.title,
            content: postData.content,
            imagePath: postData.imagePath,
            creator: postData.creator
          };
          this.form?.setValue({
            title: this.post?.title,
            content: this.post?.content,
            image: this.post?.imagePath
          });
        });
      } else {
        this.mode = 'create';
        this.postId = null;
      }
    })
  }

  onSavePost() {
    if (this.form?.invalid) {
      return;
    }

    this.isLoading = true;
    this.mode === 'create'
      ? this.postsService.addPost(this.form?.value.title, this.form?.value.content, this.form?.value.image)
      : this.postsService.updatePost(this.postId ?? '', this.form?.value.title, this.form?.value.content, this.form?.value.image);
    this.form?.reset();
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    this.form?.patchValue({image: file});
    this.form?.get('image')?.updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    }
    file && reader.readAsDataURL(file);
  }

  private initFormGroup(): void {
    this.form = new FormGroup({
      title: new FormControl(null, {validators: [Validators.required, Validators.minLength(3)]}),
      content: new FormControl(null, {validators: [Validators.required]}),
      image: new FormControl(null, {validators: [Validators.required], asyncValidators: [mimeType]}),
    });
  }
}
