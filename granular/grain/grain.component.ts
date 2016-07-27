import { GRAIN_CONTROLS } from './grain.controls';
import { GranularService } from '../granular.service';
import { Transport } from '../granular.service';

export class Grain {

    private controls = GRAIN_CONTROLS;
    private playing: Boolean = false;
    private gainNode = this.ctx.createGain();
    private panNode = this.ctx.createStereoPanner();

    constructor(private granularService: GranularService, private buffer: AudioBuffer, private ctx: AudioContext, private numVoices: number, private id: number, private outputNodes: AudioNode[]) { 
        this.loadParams();
        this.drawGraph();
        this.granularService.transportState$.subscribe(
        state => {
            if (state === Transport.Play) this.play();
            if (state === Transport.Stop) this.stop();
        });
        this.granularService.buffer$.subscribe(
        buffer => this.buffer = buffer
        );
    }
    
    private loadParams(): void {
        for (let param of this.controls) {
            this[param.name] = param;
        }
    }
     
    private drawGraph(): void {
        this.panNode.connect(this.gainNode);
        for (let output of this.outputNodes) {
            this.gainNode.connect(output);
        }
    }
    
    public play(): void {
        this.playing = true;

        let source = this.ctx.createBufferSource();
        source.buffer = this.buffer;
        source.onended = () => {
            if (this.playing) this.play();
        };
        source.playbackRate.value = this['pitch'].value + this.calcRand(this['randPitch'].value);
        source.connect(this.panNode);
                
        let interval = Math.max(0, this['interval'].value);
        let position = Math.max(0, this['position'].value + this.calcRand(this['randPosition'].value));
        let length = Math.max(0, this['length'].value + this.calcRand(this['randLength'].value));
        let fade = Math.max(0.02, length / 4);
        let gain = 1 - ( 0.6 * this['density'].value / this['density'].max);

        this.panNode.pan.value = (Math.random() * 2 - 1) * this['stereoSpread'].value;
        this.gainNode.gain.value = 0;

        if (this.isVoiceOn()) {
            this.gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + interval);
            this.gainNode.gain.linearRampToValueAtTime(gain, this.ctx.currentTime + interval + fade);
            this.gainNode.gain.linearRampToValueAtTime(gain, this.ctx.currentTime + interval + length + fade);
            this.gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + interval + length + fade * 2);
        }
        source.start(this.ctx.currentTime + interval, position, length + fade * 2);
    }
    
    public stop(): void {
        this.playing = false;
    }

    private isVoiceOn(): boolean {
        let cutoff = this['density'].value * this.numVoices / this['density'].max;
        return this.id < cutoff;
    }
   
    private calcRand(randAmt: number): number  {
        return Math.random() * randAmt - (randAmt / 2);
    }

}