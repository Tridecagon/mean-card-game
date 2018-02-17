import { ChatServer } from './chat-server';
export { GameTable } from './game-table';

let app = new ChatServer().getApp();
export { app };