import { WebSocketServer } from 'ws';
import { start } from 'nact';
import { spawnConnectionHandler } from './actors/connection-handler';

const system = start();

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws) {
  spawnConnectionHandler(system, ws);
});
