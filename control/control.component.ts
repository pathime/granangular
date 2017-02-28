import { Component, Input, Output, EventEmitter } from 'angular2/core';

export interface Control {  
  label: string;
  value: number;
  min?: number;
  max?: number;
  emitUpdateEvent?: boolean
}

@Component({
  selector: 'control',
  templateUrl: './control.component.html',
  styleUrls: ['./control.component.css']
})

export class ControlComponent {

  @Input() control: Control;
  @Output() updateValue = new EventEmitter<Control>();

  constructor() { }
  
  onChange(event:Event, value: string):void {
    this.control.value = parseFloat(value);
    if (this.control.emitUpdateEvent) this.updateValue.emit(this.control);
  }
}
