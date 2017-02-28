import { Component, OnInit, Input, Output, EventEmitter } from 'angular2/core';
import { Control, ControlComponent } from '../control/control.component';
import { State } from '../app';

export interface Recording {
  url: string;
  buffer: AudioBuffer;
}

@Component({
  selector: 'record',
  templateUrl: './record.component.html',
  styleUrls: ['../app.css']
})

export class RecordComponent implements OnInit {

  @Input() currentState: State;
  @Input() inputNode: AudioNode;
  @Output() sendRecording = new EventEmitter<Recording>();
  @Output() microphoneDisabled = new EventEmitter();
  @Output() setState = new EventEmitter<State>();

  private ctx = new AudioContext();
  private recorder: any;
  private timeOut: any;

  public disabled: boolean = false;
  public state = State;

  constructor() { }

  ngOnInit() {
    this.initMicrophone();
  }

  private initMicrophone() {
    navigator['getUserMedia'] = navigator['getUserMedia'] ||
                                navigator['webkitGetUserMedia'] ||
                                navigator['mozGetUserMedia'] ||
                                navigator['msGetUserMedia'];
    if (!navigator['getUserMedia']) this.setDisabled();
  }

  private setDisabled() {
    this.disabled = true;
    this.microphoneDisabled.emit({});
  }
  
  start() {
    if (!this.inputNode) {
      navigator['getUserMedia']({audio: true}, stream => {
        this.setState.emit(State.Recording);
        let microphone = this.ctx['createMediaStreamSource'](stream);
        this.recorder = new Recorder(microphone);
        this.recorder.record();
        this.timeOut = setTimeout(() => this.stop(), 5000);
      }, error => this.setDisabled());
    } else {
      this.recorder = new Recorder(this.inputNode);
      this.recorder.record();
    }
  }

  stop() {
    this.setState.emit(State.Paused);
    clearTimeout(this.timeOut);
    this.recorder.stop();

    this.recorder.getBuffer(buffers => {
      let buffer = this.ctx.createBuffer( 2, buffers[0].length, this.ctx.sampleRate );
      buffer.getChannelData(0).set(buffers[0]);
      buffer.getChannelData(1).set(buffers[1]);

      this.recorder.exportWAV(blob => {
        let url = URL.createObjectURL(blob);

        this.sendRecording.emit({
          url,
          buffer
        });
    });
    });
  }
}
