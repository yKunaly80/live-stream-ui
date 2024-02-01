import { Component, ElementRef, ViewChild } from '@angular/core';
import { SocketService } from '../services/socket.service';
import { Socket } from 'ngx-socket-io';

@Component({
  selector: 'app-live-class',
  standalone: true,
  imports: [],
  templateUrl: './live-class.component.html',
  styleUrl: './live-class.component.scss'
})
export class LiveClassComponent {
  private _localStream!: MediaStream

  @ViewChild('videoElement') videoElement!: ElementRef;
  @ViewChild('userVideoElement') userVideoElement!: ElementRef;

  private _server = {
    iceServers: [
      {
        urls: [
          'stun:stun1.l.google.com:19302',
          'stun:stun2.l.google.com:19302'
        ]
      }
    ],
    iceCandidatePoolSize: 10,
  }
  constructor(
    private _socketService: SocketService,
    private socket: Socket
  ) {
    this._meadiaSetup()
  }

  private async _meadiaSetup(): Promise<void> {
    try {
      const mediaConstrains: MediaStreamConstraints = {
        video: {
          facingMode: 'user',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: true
      }

      this._localStream = await navigator.mediaDevices.getUserMedia(mediaConstrains)
      this.videoElement.nativeElement.srcObject = this._localStream

      this._socketService.joinRoom()
      this._RTCPeerConnection()
    }
    catch (error) {
      console.log('error==>', error);
    }
  }

  private async _RTCPeerConnection(): Promise<void> {
    try {
      const peerConnection = new RTCPeerConnection(this._server)

      const remoteStream = new MediaStream()

      this._localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, this._localStream)
      })

      peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remoteStream.addTrack(track);
        })
      };

      this.userVideoElement.nativeElement.srcObject = remoteStream

      const peerConnectionOffer = await peerConnection.createOffer()
      await peerConnection.setLocalDescription(peerConnectionOffer)
      this._socketService.sendOffer(peerConnectionOffer)

      this.socket.on('answer', (answer: any) => {
        console.log('ans', answer);
        peerConnection.setRemoteDescription(answer)

      })

      peerConnection.onicecandidate = async (event: RTCPeerConnectionIceEvent) => {
        if (event.candidate) {
          this._socketService.sendICECandidate(event.candidate)
        }
      };

      this.socket.on('offerReceive', async (data: any) => {
        console.log('data==>', data);
        // const peerConnectionAnswer = await peerConnection.createAnswer()
        // await peerConnection.remoteDescription(peerConnectionAnswer)
        await peerConnection.setRemoteDescription(data)
        const peerConnectionAnswer = await peerConnection.createAnswer()
        await peerConnection.setLocalDescription(peerConnectionAnswer)
        this._socketService.sendAnswer(peerConnectionAnswer)
      })

      this.socket.on('answerReceive', (data: any) => { 
        // console.log('data ans==>',peerConnection.currentRemoteDescription);
        peerConnection.setRemoteDescription(data)
      })

      this.socket.on('ice-candidate-receive', (data: any) => { 
        console.log('ice ==>',data);
          peerConnection.addIceCandidate(data)
      })

      // this.socket.emit('ice-candidate', (candidate: any) => {
      //   peerConnection.addIceCandidate(candidate)
      // })
    }
    catch (error) {
      console.log('error==>', error);

    }
  }
}
