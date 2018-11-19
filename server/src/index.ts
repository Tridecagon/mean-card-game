import { ChatServer } from "./chat-server";
export { GameTable } from "./game-table";
export { Factory } from "./factory";

const app = new ChatServer().getApp();
export { app };
