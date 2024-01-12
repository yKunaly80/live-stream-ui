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
  private _stream!: MediaStream
  public mediaRecorder!: MediaRecorder;
  public recordedChunks: Blob[] = [];
  recordedBlob: any
  videoSrc = ''

  @ViewChild('videoElement') videoElement!: ElementRef;
  @ViewChild('userVideoElement') userVideoElement!: ElementRef;

  constructor(
    private _socketService: SocketService,
    private socket: Socket
  ) {
    this.socket.on('mediaSetup', (data: any) => {
      console.log('Received media data from User 1:', data.data);
      const videoBlob = new Blob([data.data], { type: 'video/mp4' });
      this.videoSrc = URL.createObjectURL(videoBlob)
      // Assuming data contains the MediaStream object
      // const mediaStream: MediaStream = data.data.mediaStream;
      // console.log(data.data.mediaStream);

      // this.userVideoElement.nativeElement.srcObject = mediaStream;
      // (document.getElementById('videoDiv') as HTMLVideoElement).srcObject = mediaStream;
    });
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

      this._stream = await navigator.mediaDevices.getUserMedia(mediaConstrains)
      this.videoElement.nativeElement.srcObject = this._stream

      this.videoElement.nativeElement.addEventListener('play', async () => {
        this.mediaRecorder = new MediaRecorder(this._stream);
        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.recordedChunks.push(event.data);
          }
        };

        this._sendData()
        // this.mediaRecorder.start();
        // console.log('Media setup complete, sending message...');
        // this._socketService.sendMessage({ type: 'media', data: new Blob(this.recordedChunks, { type: 'video/webm' }) });
        // const k = setInterval(() => { 
        // }, 1000)
      })

    }
    catch (error) {
      console.log('error==>', error);
    }
  }

  private _sendData() {
    this.mediaRecorder.start();
    const k = setInterval(async () => {
      console.log('Media setup complete, sending message...');
      await this.stopMediaRecorder();
      this._socketService.sendMessage({ type: 'media', data: this.recordedBlob });
      this.recordedChunks = []
      this.mediaRecorder.start();
    }, 1000 )
  }

  /**
   * This Function is used to stop the recoder 
   */
  private async stopMediaRecorder(): Promise<void> {
    await new Promise<void>((resolve) => {
      this.mediaRecorder.onstop = () => {
        this.recordedBlob = new Blob(this.recordedChunks, { type: 'video/webm' });
        // const file = new File(recordedBlob,'name.mp4');
        // const recordedBlob = new Blob(this.recordedChunks, { type: 'application/octet-stream' });
        // this.recordedVideo = URL.createObjectURL(recordedBlob);
        resolve();
      };
      this.mediaRecorder.onerror = (error) => {
        console.error('Error stopping recording:', error);
        resolve();
      };
      this.mediaRecorder.stop();
    });
  }
}
