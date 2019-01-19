/* eslint-disable no-console, no-process-env */
import http from 'http';
import path from 'path';

import express from 'express';
import {createConnection} from 'any-db';

const app = express();
const basePath = path.join(__dirname, '..', 'build');

app.set('port', process.env.PORT || 3001);

app.use(express.static(basePath));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.get('/', ({}, res) => {
  res.sendFile(path.join(basePath, 'index.html'));
});

app.post('/db', async (req, res) => {
  const {connection, query} = req.body;

  const data = await dataLoader(connection, query);

  res.json(data);
});

const server = http.createServer(app);
server.listen(app.get('port'), () => {
  console.log(`express listening at http://localhost:${app.get('port')}/`);
});

export function dataLoader(connection: string, query: string) {
  return new Promise<{}[]>((resolve, reject) => {
    if (!connection || !query) {
      throw new Error('Invalid connection or query');
    }

    const conn = createConnection(connection);

    conn.query(query, undefined, (error, result) => {
      if (error) {
        reject(error);
      }

      resolve(result.rows);
    });
  });
}
