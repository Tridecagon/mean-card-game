import { ChatServer } from './chat-server';
export { GameTable } from './game-table';
export { Factory } from './factory';

let app = new ChatServer().getApp();
export { app };