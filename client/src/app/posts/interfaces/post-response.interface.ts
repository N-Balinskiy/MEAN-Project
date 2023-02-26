import { Comment } from './comment.interface';

export interface PostResponse {
  _id: string;
  title: string;
  content: string;
  imagePath: string;
  creator: { _id: string; username: string };
  isPinned: boolean;
  comments: Comment[];
}
