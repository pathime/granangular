import { Component, OnInit, Input, Output, EventEmitter } from 'angular2/core';
import { Control } from '../control/control.component';
import { ControlComponent } from '../control/control.component';
import { GranularService } from '../granular.service';
import { InputNode } from '../granular.component';

export var RVBCTRL: Control = {
    name: 'reverb',
    label: 'Reverb',
    value: 0,
    min: 0,
    max: 2,
    hasSlider: true,
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
    @Output() sendInputNode = new EventEmitter<InputNode>();

    private params = RVBCTRL;
    private convolver: ConvolverNode;
    private convolverGain: GainNode;
    
    constructor(private granularService: GranularService) {}

    ngOnInit() {
        this.convolver = this.ctx.createConvolver();
        this.convolverGain = this.ctx.createGain();
        this.convolverGain.gain.value = this.params.value;
        this.convolver.connect(this.convolverGain);
        for (let output of this.outputNodes) {
            this.convolverGain.connect(output);
        }
        this.loadImpulseResponse();
        this.sendInputNode.emit({
            name: 'reverb',
            node: this.convolver
        });
    }

    loadImpulseResponse() {
        this.granularService.getSound('reverb1.wav')
        .subscribe(audioBuffer => {
            this.convolver.buffer = audioBuffer;
        }); 
    }

    updateValue(param: Control) {
        this.convolverGain.gain.value = param.value;
    }
    
}