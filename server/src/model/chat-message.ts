import { Action, Message, User } from "../../../shared/model";

export class ChatMessage implements Message {
    constructor(readonly from: User, readonly content: string, readonly room: string, readonly action: Action = null) {
    }
}
