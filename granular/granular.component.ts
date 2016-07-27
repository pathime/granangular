import { Component, Input, OnInit, ChangeDetectorRef } from 'angular2/core';
import { RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS } from 'angular2/router';
import { COMMON_DIRECTIVES } from 'angular2/common';
import { Grain } from './grain/grain.component';
import { GRAIN_CONTROLS } from './grain/grain.controls';
import { ReverbComponent } from './reverb/reverb.component';
import { Control } from './control/control.component';
import { ControlComponent } from './control/control.component';
import { GranularService } from './granular.service';
import { WaveComponent } from './wave/wave.component';
import { Recording } from './record/record.component';
import { RecordComponent } from './record/record.component';
import { Transport } from './granular.service';
import { State } from './granular.service';

export interface InputNode {
    name: string;
    node: AudioNode
};

@Component({
    selector: 'granular',
    templateUrl: './granular.component.html',
    styleUrls: ['./granular.component.css'],
    directives: [COMMON_DIRECTIVES, ControlComponent, WaveComponent, RecordComponent, ReverbComponent],
    providers: [GranularService],
    host: {
    '(window:keydown)': 'onKeydown($event)'
  }
})

export class GranularComponent implements OnInit {
        
    private numVoices: number = 24;
    public state = State;
    public inputNodes = {};
    public ctx = this.granularService.ctx;
    public playing: boolean = false;
    public soundUrl: string;
    public controls = GRAIN_CONTROLS;
    public microphoneDisabled: boolean = false;

    constructor(private ref: ChangeDetectorRef, private granularService: GranularService) { }
    
    ngOnInit() {
        window['AudioContext'] = window['AudioContext'] || window['webkitAudioContext'];
    }
    
    private loadFallback() {
        this.granularService.currentState = State.Loading;
        this.granularService.getSound('fallback.wav')
        .subscribe(audioBuffer => {
            this.loadGrains(audioBuffer);
            this.soundUrl = 'http://pathime.com/granular/sounds/fallback.wav';
            this.granularService.currentState = State.Paused;
        });
    }
    
    private loadGrains(buffer: AudioBuffer) {
        for (let i = 0; i < this.numVoices; i++) {
            new Grain(this.granularService, buffer, this.ctx, this.numVoices, i, [this.ctx.destination, this.inputNodes['reverb']]);
        }
    }
    
    public play() {
        this.granularService.propagateTransport(Transport.Play);
        this.granularService.currentState = State.Playing;
    }
    
    public stop() {
        this.granularService.propagateTransport(Transport.Stop);
        this.granularService.currentState = State.Paused;
    }

    public receiveRecording(recording: Recording) {
        this.soundUrl ? this.granularService.updateBuffer(recording.buffer) : this.loadGrains(recording.buffer);
        this.soundUrl = recording.url;
        this.ref.detectChanges();
    }

    public receiveInputNode(inputNode: InputNode) {
        this.inputNodes[inputNode.name] = inputNode.node;
    }
    
    public onKeydown(e) {
        if (e.keyCode === 65) this.play();
        if (e.keyCode === 83) this.stop();
    }
}

