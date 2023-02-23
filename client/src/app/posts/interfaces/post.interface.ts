import { Comment } from './comment.interface';

export interface Post {
  title: string;
  content: string;
  id: string;
  imagePath: string;
  creator: string;
  isPinned: boolean;
  comments?: Comment[];
}
