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

  joinRoom() {
    this.socket.emit('join-room', 'webrtc1')
  }

  sendOffer(offer: RTCSessionDescriptionInit) {
    this.socket.emit('offer', offer)
  }

  sendAnswer(ans:any) {
    this.socket.emit('answer', ans)
  }

  receiveAnswer() {
    console.log('call==> ans');

    this.socket.on('answer', (answer: any) => {
      console.log('ans receive==>', answer);

      return answer
    })
  }

  sendICECandidate(candidate: RTCIceCandidateInit) {
    this.socket.emit('ice-candidate', candidate);
  }

  reciveICECandidate() {
    this.socket.on('ice-candidate', (candidate: any) => {
      // peerConnection.addIceCandidate(candidate);
      return candidate
    });
  }


}
