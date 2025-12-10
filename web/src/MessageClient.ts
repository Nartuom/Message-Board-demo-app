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

export interface MessageClient {
  get: () => Promise<Array<Message>>;
  create: (newMessage: string, visibility: Visibility) => Promise<void>;
  like: (messageId: UUID) => Promise<void>;
  delete: (messageId: UUID) => Promise<void>;
}
