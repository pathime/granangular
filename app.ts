import { Component, Input, OnInit, ChangeDetectorRef } from 'angular2/core';
import { HTTP_PROVIDERS } from 'angular2/http';
import { COMMON_DIRECTIVES } from 'angular2/common';
import { Grain } from './grain/grain.component';
import { GRAIN_CONTROLS } from './grain/grain.controls';
import { Control, ControlComponent } from './control/control.component';
import { Recording, RecordComponent } from './record/record.component';
import { ReverbComponent } from './reverb/reverb.component';
import { WaveComponent } from './wave/wave.component';
import { downloadFile } from './utils/downloadFile'
import 'rxjs/Rx';

export enum State {
	Empty,
	Recording,
	Playing,
	Paused,
	Loading
}

@Component({
	selector: 'app',
	templateUrl: './app.html',
	styleUrls: ['./app.css'],
	directives: [COMMON_DIRECTIVES, ControlComponent, WaveComponent, RecordComponent, ReverbComponent],
	providers: [
		HTTP_PROVIDERS
	]
})


export class AppComponent implements OnInit {
		
	private numVoices = 24;
	public grains: Grain[] = [];
	public currentState = State.Empty;
	public inputNodes = {};
	public ctx = new AudioContext();
	public soundUrl: string;
	public controls = GRAIN_CONTROLS;
	public microphoneDisabled = false;
	public state = State;

	constructor(private ref: ChangeDetectorRef) { }

	ngOnInit() {
		window['AudioContext'] = window['AudioContext'] || window['webkitAudioContext'];
		this.loadGrains();
	}
	
	private loadFallback() {
		let soundUrl = 'http://pathime.com/granular/sounds/fallback.wav';
		this.currentState = State.Loading;

		downloadFile(soundUrl, buffer => {
			this.soundUrl = soundUrl;
			this.grains.forEach(grain => grain.setBuffer(buffer))
			this.currentState = State.Paused;
		})
	}
	
	private loadGrains() {
		for (let i = 0; i < this.numVoices; i++) {
			let grain = new Grain(this.ctx);
			grain.addOutputNode(this.ctx.destination);
			this.grains.push(grain);
		}
	}
	
	public play() {
		this.grains.forEach(grain => grain.play());
		this.currentState = State.Playing;
	}
	
	public stop() {
		this.grains.forEach(grain => grain.stop());
		this.currentState = State.Paused;
	}

	public recordHandler(recording: Recording) {
		this.grains.forEach(grain => grain.setBuffer(recording.buffer));
		this.soundUrl = recording.url;
		this.ref.detectChanges();
	}

	public setState(state: State) {
		this.currentState = state;
		this.ref.detectChanges();
	}

	public setGrainOutputNode(node: AudioNode) {
		this.grains.forEach(grain => grain.addOutputNode(node));
	}
}
