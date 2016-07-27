import { Injectable, ChangeDetectorRef } from 'angular2/core';
import { Http, Headers, Response } from 'angular2/http';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import { Subject }    from 'rxjs/Subject';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

export enum Transport {
    Stop,
    Play
}

export enum State {
    Empty,
    Recording,
    Playing,
    Paused,
    Loading
}

@Injectable()
export class GranularService {

    private _currentState: State = State.Empty;
    private transportState = new Subject<Transport>();
    private buffer = new Subject<AudioBuffer>();

    public ctx = new AudioContext();
    public numVoices: number = 24;
    public transportState$ = this.transportState.asObservable();
    public buffer$ = this.buffer.asObservable();

    get currentState(): State {
        return this._currentState;
    }

    set currentState(state: State) {
        this._currentState = state;
        this.ref.detectChanges();
    }

    constructor(private ref: ChangeDetectorRef, private http:Http) {}

    public propagateTransport(state: Transport) {
        this.transportState.next(state);
    }

    public updateBuffer(buffer: AudioBuffer) {
        this.buffer.next(buffer);
    }
    
    public getSound(sound) {
        return Observable.create(observer => {
            let req = new XMLHttpRequest();
            req.open('get', 'http://pathime.com/granular/sounds/' + sound);
            req.responseType = "arraybuffer";
            req.onreadystatechange = () => {
                if (req.readyState == 4 && req.status == 200) {
                    this.ctx.decodeAudioData(req.response, audioBuffer => {
                        observer.next(audioBuffer);
                        observer.complete();
                    });
                }
            };
            req.send();
        });
        
        // ** NOT YET IMPLEMENTED **
        // let headers = new Headers({});
        // headers.append('responseType', 'arraybuffer');
        // return this.http.get('sounds/' + sound, {
        //     headers: headers
        // })
        // .map((res: Response) => res.arrayBuffer())
        // ;

    }
}