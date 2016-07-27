import { Component, OnInit, OnChanges, OnDestroy, Input, ElementRef } from 'angular2/core';
import { Control } from '../control/control.component';

declare var WaveSurfer:any

@Component({
    selector: 'wave',
    templateUrl: './wave.component.html',
    styleUrls: ['./wave.component.css']
})
export class WaveComponent implements OnInit, OnChanges, OnDestroy {

    @Input() position: Control;
    @Input() sound: string;

    public mousedown: boolean = false;
    public lfoVal: number = 0;
    public lfoAmt: number = 0.2;
    private currentPos: number = 0;
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

    }
    
    public updatePosition(e:MouseEvent, el:HTMLElement, lfo?:boolean): void {

        if (!this.mousedown && !lfo) return;
        this.currentPos = e.offsetX / el.offsetWidth;
        this.modulateWithLFO();
        
    }

    private modulateWithLFO() {
        this.waveSurfer.seekTo(this.currentPos + this.lfoVal * this.lfoAmt);
        this.position.value = this.waveSurfer.getCurrentTime();
    }

    private lfo() {
        let requestAnimationFrame = window.requestAnimationFrame || 
                                    window.msRequestAnimationFrame,
            counter = 0,
            lfoVal: number,
            self = this;
        
        animate();

        function animate() {
            counter += Math.PI / 256;
            self.lfoVal = Math.abs(Math.cos(counter))
            self.modulateWithLFO();
            requestAnimationFrame(animate);
        }
    }
    
    ngOnDestroy(): void {

    }
}