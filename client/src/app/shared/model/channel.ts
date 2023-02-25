import { User, Message } from '../../../../../shared/model';
import { SocketService } from '../services/socket.service';

export class Channel {
    messages: Message[] = [];
    selected = false;

    constructor(public channelName: string, private socket: SocketService) {
        this.socket.onMessage('chatMessage')
        .subscribe((message: Message) => {
            if(message.room === channelName) {
                this.messages.push(message);
            }
        });
    }

    sendMessage(user: User, message: string, room = 'lobby'): void {
        if (!message) {
            return;
        }

        this.socket.send({
            from: user,
            room,
            content: message
        });
    }
}
