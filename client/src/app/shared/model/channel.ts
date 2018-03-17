import { User, Message } from '../../../../../shared/model';
import { SocketService } from '../services/socket.service';

export class Channel {
    socket: SocketService;
    messages: Message[] = [];
    selected = false;

    constructor(public channelName: string) {}

    setSocket(socket: SocketService): void {
        this.socket = socket;
        this.socket.initSocket(this.channelName === 'lobby' ? null : this.channelName);

        this.socket.onMessage('chatMessage')
        .subscribe((message: Message) => {
          this.messages.push(message);
        });
    }

    sendMessage(user: User, message: string): void {
        if (!message) {
            return;
        }

        this.socket.send({
            from: user,
            content: message
        });
    }
}
