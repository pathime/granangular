import { GRAIN_CONTROLS } from './grain.controls';

let totalGrains = 0

export class Grain {

  private id: number = totalGrains++;
  private playing = false;
  private gainNode: GainNode;
  private panNode: StereoPannerNode;
  private buffer: AudioBuffer;

  constructor(private ctx: AudioContext) {
    this.drawGraph();
  }
      
  private drawGraph(): void {
    this.gainNode = this.ctx.createGain();
    this.panNode = this.ctx.createStereoPanner();
    this.panNode.connect(this.gainNode);
  }

  setBuffer(buffer): void {
    this.buffer = buffer;
  }

  addOutputNode(outputNode): void {
    this.gainNode.connect(outputNode)
  }
  
  public play(): void {
    if (!this.buffer) return;

    let { pitch, randPitch, interval, position, randPosition, length, randLength, density, stereoSpread } = GRAIN_CONTROLS
    
    this.playing = true;

    let source = this.ctx.createBufferSource();
    source.buffer = this.buffer;
    source.onended = () => {
      if (this.playing) this.play();
    };
    source.playbackRate.value = pitch.value + this.calcRand(randPitch.value);
    source.connect(this.panNode);
            
    let int = Math.max(0, interval.value);
    let pos = Math.max(0, position.value + this.calcRand(randPosition.value));
    let len = Math.max(0, length.value + this.calcRand(randLength.value));
    let fade = Math.max(0.02, len / 4);
    let gain = 1 - ( 0.6 * density.value / density.max);

    this.panNode.pan.value = (Math.random() * 2 - 1) * stereoSpread.value;
    this.gainNode.gain.value = 0;

    if (this.isVoiceOn()) {
      this.gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + int);
      this.gainNode.gain.linearRampToValueAtTime(gain, this.ctx.currentTime + int + fade);
      this.gainNode.gain.linearRampToValueAtTime(gain, this.ctx.currentTime + int + len + fade);
      this.gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + int + len + fade * 2);
    }
    source.start(this.ctx.currentTime + int, pos, len + fade * 2);
  }
  
  public stop(): void {
    this.playing = false;
  }

  private isVoiceOn(): boolean {
    let cutoff = GRAIN_CONTROLS.density.value * totalGrains / GRAIN_CONTROLS.density.max;
    return this.id < cutoff;
  }
  
  private calcRand(randAmt: number): number  {
    return Math.random() * randAmt - (randAmt / 2);
  }
}
