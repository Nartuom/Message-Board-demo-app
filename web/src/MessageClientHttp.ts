import fetch from 'isomorphic-fetch';
import {Message, MessageClient, UUID, Visibility} from './MessageClient';

export class MessageClientHttp implements MessageClient {
  constructor(private readonly baseUrl: string) {}

  async create(message: string, visibility: Visibility): Promise<void> {
    await fetch(`${this.baseUrl}/messages`, 
      { method: 'POST', 
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({message, visibility}) 
      });
  }

  async get(): Promise<Array<Message>> {
    const messages = await fetch(`${this.baseUrl}/messages`, { 
      method: 'GET' })
      .then((response) => response.json());
    return Promise.resolve(messages);
  }

  async like(messageId: UUID): Promise<void> {
    await fetch(`${this.baseUrl}/messages/${messageId}`, {
      method: 'PATCH',
      body: JSON.stringify({ liked: true}),
    });
  }

  async delete(messageId: UUID): Promise<void> {
    await fetch(`${this.baseUrl}/messages/${messageId}`, {
      method: 'DELETE'
    });
  }
  
}
