import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { Message } from '../../../../../shared/model';
import { Event } from '../model/event';

import * as socketIo from 'socket.io-client';
import { environment } from 'environments/environment';

// const SERVER_URL = process.env.SERVER_URL || 'http://localhost:8080';
// const SERVER_URL = 'http://mean-card-game-server.herokuapp.com';
const SERVER_URL = environment.server_url;

@Injectable()
export class SocketService {
    private socket: SocketIOClient.Socket;
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
            this.socket = socketIo(SERVER_URL + channel);
        } else {
            this.socket =  socketIo(SERVER_URL);
        }
    }
}
