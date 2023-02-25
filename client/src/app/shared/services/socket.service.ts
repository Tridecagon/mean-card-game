import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Message } from '../../../../../shared/model';
import { Event } from '../model/event';
import { v4 } from "uuid";

import { io, Socket } from 'socket.io-client';
import { environment } from 'environments/environment';

// const SERVER_URL = process.env.SERVER_URL || 'http://localhost:8080';
// const SERVER_URL = 'https://mean-card-game-server.herokuapp.com';
const SERVER_URL = environment.server_url;
const clientId = v4();

@Injectable()
export class SocketService {
    private socket: Socket;
    public onInit: Event;

    public initSocket(channel: string = null): void {
        if (!this.socket) {
            this.setNamespace(channel);
        }
    }

    public send(message: Message): void {
        this.socket.emit('message', message);
    }

    public sendAction(actionType: string, data: any): void {
        this.socket.emit(actionType, data);
    }

    public onMessage(messageType: string): Observable<Message> {
        return new Observable<Message>(observer => {
            this.socket.on(messageType, (data: Message) => observer.next(data));
        });
    }

    public onAction<T>(actionType: string): Observable<T> {
        return new Observable<T>(observer => {
            this.socket.on(actionType, (data: T) => observer.next(data));
        });
    }

    public onEvent(event: Event): Observable<any> {
        return new Observable<Event>(observer => {
            this.socket.on(event, () => observer.next());
        });
    }

    public setNamespace(channel: string) {
        console.log('Opening socket on ' + SERVER_URL + ' at channel ' + channel);
        if (channel) {
            this.socket = io(SERVER_URL + channel, );
        } else {
            this.socket =  io(SERVER_URL);
        }
        console.log(`Socket open for channel ${channel} with ID ${this.socket.id}`);
    }
}
