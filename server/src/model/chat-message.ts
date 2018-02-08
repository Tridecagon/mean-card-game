import { Message, User, Action } from '../../../shared/model';

export class ChatMessage implements Message{
    constructor(readonly from: User, readonly content: string, readonly action: Action = null) {
    }
}