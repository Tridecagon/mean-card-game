import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Message } from '../../../../../shared/model';
import { Event } from '../model/event';

import { io, Socket } from 'socket.io-client';
import { environment } from 'environments/environment';

const SERVER_URL = environment.server_url;

@Injectable({providedIn: 'root'})
export class SocketService {
    private socket: Socket;
    public onInit: Event;
    private userId: number;

    public initSocket(): void {
        if (!this.socket) {
            this.connect();
        }
    }

    public setUserId(id: number): void {
        this.userId = id;
        console.log(`Setting client user id = ${id}`);
    }

    public send(message: Message): void {
        this.socket.emit('message', message);
    }

    public sendAction(actionType: string, data: object): void {
        const payload =  Object.assign(data, {from: this.userId});
        console.log(`Sending message:`, actionType, payload);
        this.socket.emit(actionType, payload);
        console.log (`Sent action type=${actionType}, data=${JSON.stringify(payload)}`)
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

    public connect() {
        console.log('Opening socket on ' + SERVER_URL );

        this.socket =  io(SERVER_URL);

        console.log(`Socket connected`);
    }
}
