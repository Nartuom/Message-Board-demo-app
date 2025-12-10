export type UUID = string;

export enum Visibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

export type Message = {
  id: UUID;
  message: string;
  liked: boolean;
  liked_count: number;
  visibility: Visibility;
};
