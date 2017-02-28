import { Component, OnInit, Input, Output, EventEmitter } from 'angular2/core';
import { Control, ControlComponent } from '../control/control.component';
import { downloadFile } from '../utils/downloadFile';

export var RVBCTRL: Control = {
  label: 'Reverb',
  value: 0,
  min: 0,
  max: 2,
  emitUpdateEvent: true
};

@Component({
  selector: 'reverb',
  templateUrl: './reverb.component.html',
  styleUrls: [],
  directives: [ControlComponent]
})

export class ReverbComponent {

  @Input() ctx: AudioContext;
  @Input() outputNodes: AudioNode[];
  @Output() sendInputNode = new EventEmitter<AudioNode>();

  private params = RVBCTRL;
  private convolver: ConvolverNode;
  private convolverGain: GainNode;
  
  constructor() {}

  ngOnInit() {
    this.convolver = this.ctx.createConvolver();
    this.convolverGain = this.ctx.createGain();
    this.drawMap();
    this.loadImpulseResponse();
    this.sendInputNode.emit(this.convolver);
  }

  drawMap() {
    this.convolverGain.gain.value = this.params.value;
    this.convolver.connect(this.convolverGain);
    for (let output of this.outputNodes) {
      this.convolverGain.connect(output);
    }
  }

  loadImpulseResponse() {
    downloadFile('reverb1.wav', buffer => this.convolver.buffer = buffer)
  }

  updateValue(param: Control) {
    this.convolverGain.gain.value = param.value;
  }
    
}