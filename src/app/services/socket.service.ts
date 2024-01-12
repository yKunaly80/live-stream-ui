import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  constructor(
    private socket: Socket
  ) { }

  sendMessage(message: { type: 'media', data: any }) {
    // console.log('mes==>',message);
    this.socket.emit('mediaSetup', message);
  }
}
