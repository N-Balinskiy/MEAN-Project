import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription, switchMap, tap } from 'rxjs';

import { AuthService } from '../../authentication/services/auth.service';
import { Post } from '../interfaces/post.interface';
import { PostsService } from '../services/posts.service';
import { mimeType } from '../validators/mime-type.validator';

@Component({
  selector: 'mean-post-create',
  templateUrl: 'post-create.component.html',
  styleUrls: ['post-create.component.scss'],
})
export class PostCreateComponent implements OnInit, OnDestroy {
  post: Nullable<Post> = null;
  isLoading = false;
  form: Nullable<FormGroup> = null;
  imagePreview: string = '';

  private mode = 'create';
  private postId: string | null = null;
  private authStatusSub!: Subscription;

  constructor(private postsService: PostsService, private route: ActivatedRoute, private authService: AuthService) {}

  ngOnInit() {
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(() => {
      this.isLoading = false;
    });
    this.initFormGroup();

    this.isLoading = true;
    this.route.paramMap
      .pipe(
        tap((paramMap: ParamMap) => {
          if (paramMap.has('postId')) {
            this.mode = 'edit';
            this.postId = paramMap.get('postId');
          } else {
            this.mode = 'create';
            this.postId = null;
          }
        }),
        switchMap(() => this.postsService.getPost(this.postId ?? ''))
      )
      .subscribe(postData => {
        this.isLoading = false;
        if (!!this.postId) {
          this.post = {
            id: postData._id,
            title: postData.title,
            content: postData.content,
            imagePath: postData.imagePath,
            creator: postData.creator,
          };
          this.form?.setValue({
            title: this.post?.title,
            content: this.post?.content,
            image: this.post?.imagePath,
          });
        }
      });
  }

  onSavePost() {
    if (this.form?.invalid) {
      return;
    }

    this.isLoading = true;
    this.mode === 'create'
      ? this.postsService.addPost(this.form?.value.title, this.form?.value.content, this.form?.value.image)
      : this.postsService.updatePost(
          this.postId ?? '',
          this.form?.value.title,
          this.form?.value.content,
          this.form?.value.image
        );
    this.form?.reset();
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    this.form?.patchValue({ image: file });
    this.form?.get('image')?.updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    file && reader.readAsDataURL(file);
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }

  private initFormGroup(): void {
    this.form = new FormGroup({
      title: new FormControl(null, { validators: [Validators.required, Validators.minLength(3)] }),
      content: new FormControl(null, { validators: [Validators.required] }),
      image: new FormControl(null, { validators: [Validators.required], asyncValidators: [mimeType] }),
    });
  }
}
