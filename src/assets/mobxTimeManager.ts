import { action, computed, observable, makeAutoObservable} from 'mobx';

/**
 * The purspose of this class is to reach and display the time seen in a video.
 * It uses the MobX framework.
 * 
 * More info about the framework here : https://mobx.js.org/README.html
 * 
 * @param {number} time the time of the referenced video in seconds
 * @param {HTMLVideoElement|video} video the referenced video 
 */
class MobxTimeManager {
    time = 0;
    fps = 0;
    video : HTMLVideoElement|null = null;
    #showMiliSeconds = false;
    
    constructor(){
        makeAutoObservable(this,{

            time: observable,
            video : observable,
            fps : observable,

            timeDisplay : computed,
            frame : computed,

            addTime : action,
            showMiliseconds : action,
            setTime : action,
            setVideo : action

        });
    }

    get timeDisplay(){
        const minutes = Math.trunc((this.time/60)%60)
        const seconds = Math.trunc(this.time%60)
        const hours = Math.trunc(this.time/3600)
        const ms = Math.trunc((this.time*1000)%1000)

        const doubleDigits = (n:number,triple=false) =>{
          return (triple?(n<100?'0':''):'')+(n<10?'0':'')+n.toString()
        }
        return `${this.time>=3600?doubleDigits(hours)+':':''}${doubleDigits(minutes)}:${doubleDigits(seconds)}${this.#showMiliSeconds?','+doubleDigits(ms,true):''}`
    }

    get frame(){
        return Math.trunc(this.time*this.fps)
    }

    showMiliseconds(bool:boolean){
        this.#showMiliSeconds = bool
    }

    addTime(n:number){
        this.time+=n
    }

    setTime(n:number){
        this.time=n
    }
    setVideo(v:HTMLVideoElement){
        this.video = v;
    }

    keydown(event:KeyboardEvent){
        console.log('called')
        switch(event.key){
            case 'ArrowRight' : this.addTime(5);break;
            case 'ArrowLeft' : this.addTime(-5);break;
            default:break;
        }
    }

    update(){
        if(this.video){
            this.setTime(this.video.currentTime)
            console.log(`updating\n video.currentTime : ${this.video.currentTime} , this.time : ${this.time}`)
        }
    }

}
export default MobxTimeManager;

