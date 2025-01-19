import { useEffect, useRef, useState } from "react";
import { BackwardIcon, ForwardIcon, PauseIcon, PlayIcon } from "@heroicons/react/16/solid";
import Button from "./button";
import SliderList from "./sliderList";
import { VideoData } from "../assets/videos";
import { secondToFrame } from "../assets/util";
import { useWindowListener } from "../hooks/useWindowListener";

interface Props {
  time : number,
  onSeek : (t:number)=>any,
  videoRef : React.RefObject<HTMLVideoElement>,
  svgRef : React.RefObject<HTMLDivElement>,
  videoData:VideoData,
  display? : string,
  svgOnPlay? : ()=>void,
  options? : {
    removeButtons : boolean
  }
}

/**
 * This component controls the properties of the video
 * @param {number} time - the time of the video in seconds
 * @param {Function} onSeek - this function will be called each time a time is seeked.
 * @param {React.RefObject<HTMLVideoElement>} videoRef - the RefObject of the controlled video
 * @param {React.RefObject<HTMLDivElement>} svgRef - the RefObject of the controlled SVG video
 * @param {VideoData} videoData - The data of the referenced video
 * @param {Function} svgOnPlay - callback function that is called each time the user play the SVG video
 * @param {string} display - optional : displays the time of the video. By default it just shows the time parameter
 * @param {boolean} options.removeButtons - optional : if true, removes all the buttons
 */
function Control({time, onSeek, videoRef,svgRef, svgOnPlay, videoData, display,options={removeButtons:false}}:Props){

    const screenRefs = {"video":videoRef,"svg":svgRef}

    const [isPlaying, setIsPlaying] = useState(false);
    const [delta,setSeekDelta] = useState(5);
    const [timeUnit, setTimeUnit] = useState<"seconds" | "frames" | "pixels">("seconds");
    const [pixelDelta, setPixelDelta] = useState(0);
    const [refType, setScreenRefType] = useState<"video"|"svg">("video")

    const sliderRef = useRef<HTMLDivElement>(null)
    const mainSlider = sliderRef.current

    const video = videoRef.current
    const svgVideo = svgRef.current

    const isRef = ()=>videoData.type==="svg"

    //update the play state each time the video ends
    useEffect(()=>{
      if(!isRef() && video && video.ended && !video.loop){
        setIsPlaying(false)
      }
    },[video?.ended])

    //updates the slider width (in px) each time window changes
    useEffect(()=>{
      mainSlider?.offsetWidth
    },[window.innerWidth])

    //updates pixelDelta 
    useEffect(()=>{
      const prev = pixelDelta;
      if(mainSlider && video){
        Number.isNaN(video.duration)?setPixelDelta(1):setPixelDelta(mainSlider.offsetWidth/video.duration)
      }else if(mainSlider && svgVideo){
        setPixelDelta(svgVideo.offsetWidth/videoData.duration/videoData.fps)
      }
      return ()=>{
        setPixelDelta(prev)
      }
    },[mainSlider?.offsetWidth,video?.duration])
    
    useEffect(()=>{
      handleRefChange()
    },[videoData])
    
    const onKeyDown : React.KeyboardEventHandler<HTMLElement> = (event)=>{
      const handle = (f:()=>any)=>{
        event.preventDefault();
        f();
      }
      switch(event.code){
        case 'ArrowRight' : handle(()=>changeTime(delta));break;
        case 'ArrowLeft' : handle(()=>changeTime(-delta));break;
        case 'ArrowUp' : handle(()=>setSeekDelta(delta+1));break;
        case 'ArrowDown' : handle(()=>setSeekDelta(delta>0?delta-1:delta));break;
        case 'Digit1': case 'Numpad1': handle(()=>setTimeUnit("seconds"));break;
        case 'Digit2' : case 'Numpad2': handle(()=>setTimeUnit("frames"));break;
        case 'Digit3' : case 'Numpad3': handle(()=>setTimeUnit("pixels"));break;
        case 'Space' : handle(togglePlay);break;
        default:break;
      }
    }

    useWindowListener("keydown",onKeyDown);

    const togglePlay = () => {
      if (video) {
        if (video.paused) {
          video.play();
          setIsPlaying(true);
        } else {
          video.pause();
          setIsPlaying(false);
        }
      }else if(svgVideo){
        svgOnPlay&&svgOnPlay()
        setIsPlaying(!isPlaying)
      }else{
          console.error("ERROR : videoRef is null");
      }
    }

    const changeTime = (d:number)=>{
      if(timeUnit==="seconds"){
        onSeek(time+d)
      }else if(timeUnit==="frames"){
        onSeek(time+(d/videoData.fps))
      }else{
        onSeek(time+(d/pixelDelta))
      }
    }

    const changeTimeUnit = ()=>{
      if(timeUnit==="seconds"){
        setTimeUnit("frames")
      }else if(timeUnit==="frames"){
        setTimeUnit("pixels")
      }else{
        setTimeUnit("seconds")
      }
    }

    const handleRefChange = ()=>{
      if(!videoRef.current && svgRef.current){
        setScreenRefType("svg")
      }else if(!svgRef.current && videoRef.current){
        setScreenRefType("video")
      }else{
        console.log("ref change did not work" , screenRefs)
      }
    }
    
    const skipForward = () => {
      changeTime(delta)
    }
    
    const skipBackward = () => {
      changeTime(-delta)
    }

    const currentOffset = Math.round(time*pixelDelta)

    const playPauseIcon = isPlaying?<PauseIcon className="icon25px"/>:<PlayIcon className="icon25px"/>

    const btnStyle:React.CSSProperties={
      backgroundColor:"#8e3939",
    }

    const JSXButtons = <div>
      <div>
          <Button style={btnStyle} onClick={togglePlay}>{playPauseIcon}{isPlaying ? 'Pause' : 'Play'}</Button>
          <Button style={btnStyle} onClick={skipBackward}><BackwardIcon className="icon25px"/> -{delta} {timeUnit}</Button>
          <Button style={btnStyle} onClick={skipForward}><ForwardIcon className="icon25px"/> +{delta} {timeUnit}</Button>
        </div>
        <div className="custom-bg-secondary border-0">
          <input className="border-dark border-1 text-light rounded-2" style={{width:60, height:34,...btnStyle}} type="number" min={0}value={delta} onChange={e=>setSeekDelta(parseInt(e.target.value))}/>
          <Button className="" onClick={changeTimeUnit}>{timeUnit}</Button>
        </div>
    </div>
    
    
    return <div className="control-component container custom-bg-secondary rounded-2 border-2 p-2 my-3 small">
          <div className="m-2">time:{display} | fps:{videoData.fps.toFixed(0)} frame:{secondToFrame(time,videoData.fps)} | offsetWidth : {videoRef.current?.offsetWidth||svgRef.current?.offsetWidth || mainSlider?.offsetWidth||'none'} offset : {currentOffset}</div>
          {(!options.removeButtons)&&JSXButtons}
        
        <SliderList sliderRef={sliderRef} videoRef={screenRefs[refType]} value={time} onChange={onSeek} max={(video?.duration||videoData.duration/videoData.fps)} step={1/pixelDelta} fps={videoData.fps}/>
        {/* <SliderList sliderRef={sliderRef} value={secondToFrame(time,videoData.fps)} onChange={n => onSeek(frameToSecond(n,videoData.fps))} max={secondToFrame(video?.duration||0,videoData.fps)} step={1/pixelDelta}/> */}
    </div>
}

export default Control;