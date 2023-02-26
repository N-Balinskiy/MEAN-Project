export interface Comment {
  _id: string;
  postId: string;
  date: string;
  text: string;
  author: { username: string; _id: string };
}
