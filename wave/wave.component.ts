import { Component, OnInit, OnChanges, Input, ElementRef } from 'angular2/core';
import { Control } from '../control/control.component';

declare var WaveSurfer:any

@Component({
  selector: 'wave',
  templateUrl: './wave.component.html',
  styleUrls: ['./wave.component.css']
})
export class WaveComponent implements OnInit, OnChanges {

	@Input() position: Control;
	@Input() sound: string;

	public mousedown: boolean = false;
	public lfoVal: number = 0;
	public lfoAmt: number = 0.2;
	private currentPos: number = 0.1;
	private waveSurfer;

	constructor(private el: ElementRef) {}

	ngOnInit() {
		this.initWaveSurfer();
	}

	ngOnChanges(change) {
		if (change.sound.currentValue) this.waveSurfer.load(change.sound.currentValue);
	}

	private initWaveSurfer(): void {
			
		this.waveSurfer = Object.create(WaveSurfer);

		var options = {
			container     : this.el.nativeElement.querySelector('div'),
			waveColor     : 'violet',
			progressColor : 'purple',
			cursorColor   : 'navy',
			minPxPerSec   : 100,
			scrollParent  : true
		};

		this.waveSurfer.init(options);
		
		if (this.waveSurfer.enableDragSelection) {
			this.waveSurfer.enableDragSelection({
				color: 'rgba(0, 255, 0, 0.1)'
			});
		}

		this.waveSurfer.on('ready', this.setControlParam);
	}
	
	public updatePosition(e:MouseEvent, el:HTMLElement): void {
		if (!this.mousedown) return;
		this.currentPos = e.offsetX / el.offsetWidth;
		this.setControlParam();  
	}

	private setControlParam() {
		this.waveSurfer.seekTo(this.currentPos + this.lfoVal * this.lfoAmt);
		this.position.value = this.waveSurfer.getCurrentTime();
	}

	private lfo() {
		let requestAnimationFrame = window.requestAnimationFrame || 
																window.msRequestAnimationFrame,
			counter = 0,
			lfoVal: number;

		let animate = () => {
			counter += Math.PI / 256;
			this.lfoVal = Math.abs(Math.cos(counter))
			this.setControlParam();
			requestAnimationFrame(animate);
		}

		animate();
	} 
}