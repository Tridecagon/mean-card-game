import { User, Message } from '../../../../../shared/model';
import { SocketService } from '../services/socket.service';

export class Channel {
    messages: Message[] = [];
    selected = false;

    constructor(public channelName: string, private socket: SocketService) {
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
