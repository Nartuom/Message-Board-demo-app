import fastify, { FastifyInstance } from 'fastify';
import fastifyCors from 'fastify-cors';
import { Server } from 'https';
import { Client } from 'pg';
import Postgrator from 'postgrator';
import { v4 as uuid } from 'uuid';
import { Message, Visibility } from './Message';

export class App {
  private readonly fastify: FastifyInstance<Server>;
  private readonly port: number;
  private readonly client: Client;
  private readonly postgrator: Postgrator;

  constructor(port: number) {
    this.port = port;
    this.fastify = fastify({
      logger: true,
    });

    this.fastify.register(fastifyCors);

    this.postgrator = new Postgrator({
      migrationDirectory: `${__dirname}/../dbMigrations`,
      driver: 'pg',
      username: 'postgres',
      password: 'postgres',
      database: 'postgres',
      port: 5003,
      host: 'localhost',
    });

    this.client = new Client({
      user: 'postgres',
      password: 'postgres',
      database: 'postgres',
      port: 5003,
      host: 'localhost',
    });

    this.fastify.post('/messages', async (request, reply) => {
      console.log(request.body)
      const {message, visibility} = request.body as {
        message: string;
        visibility?: Visibility;
      };
      console.log("here is the data:", message, visibility)

      await this.client.query(
        `INSERT INTO messages (id, message, liked, visibility) VALUES ('${uuid()}', '${message}', FALSE, '${visibility}');`,
      );
      return reply.code(201).send();
    });

    this.fastify.get('/messages', async (_, reply) => {
      const result = await this.client.query(`SELECT * FROM messages;`);

      const messages: Message[] = result.rows.map((row) => ({
        id: row.id,
        message: row.message,
        liked: row.liked,
        liked_count: row.liked_count,
        visibility: row.visibility,
      }));

      return reply.code(200).send(messages);
    });

    this.fastify.patch('/messages/:id', async (request, reply) => {
      const id = (request.params as { id: string }).id;      
      await this.client.query(`UPDATE messages SET liked = true, liked_count = liked_count + 1  WHERE id = '${id}'`);
      return reply.code(204).send();
    });

    this.fastify.delete('/messages/:id', async (request, reply) => {
      const id = (request.params as {id: string}).id;
      await this.client.query(`DELETE FROM messages where id = '${id}'`);
      return reply.code(204).send();
    })
    


  }



  async start() {
    const appliedMigrations = await this.postgrator.migrate();
    console.log('App applied migrations:', appliedMigrations);

    await this.client.connect();

    const url = await this.fastify.listen(this.port);
    console.log(`App listening on ${url}`);
  }

  async stop() {
    await this.client.end();
    return this.fastify.close();
  }
}
