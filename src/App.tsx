
import { useRef, useState } from "react"
import Control from "./components/control"
import Video from "./components/video"
import MobxTimeManager from "./assets/mobxTimeManager";
import { observer } from "mobx-react-lite";
import VIDEOS from "./assets/videos";
import { restrict } from "./assets/util";
import SVGVideo from "./components/SVGVideo";


const mobxTime = new MobxTimeManager()

/**
 * The purpose of this application is to show several sliders to navigate through the video
 * 
 * @author ADAMOV David
 * @returns the JSX Element that shows all the website
*/
function App() {
  
  const videoSrc = VIDEOS
  mobxTime.showMiliseconds(true)
  const [videoSelector,setVideoSelector] = useState(0)
  const [removeButton,setRemoveButton] = useState(false)
  const [svgPlaying,setSVGPlaying] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null);
  videoRef.current&&mobxTime.setVideo(videoRef.current);

  const svgRef = useRef<HTMLDivElement>(null)
    
  const handleSeek = (t:number)=>{
    const vid = videoRef.current;
    const svg = svgRef.current;
    if(vid){
      const newval = restrict(t,0,vid.duration)
      //if(videoRef.current.readyState === 2 || videoRef.current.readyState === 4) {
        videoRef.current.currentTime=newval;
        mobxTime.setTime(newval)
      //}
    }else if(svg){
      const newval = restrict(t,0,videoSrc[videoSelector].duration/videoSrc[videoSelector].fps)
      mobxTime.setTime(newval)
    }
  }

  const SVGChangeTime = (newT:number)=>{
    mobxTime.setTime(newT)
  }

  const handleVideoChange = (n:number)=>{
    setVideoSelector(n)
    const vid = videoRef.current
    if(vid){
      vid.load()
      mobxTime.setTime(0)
    }
  }

  const isSVG = ()=>videoSrc[videoSelector].type === "svg"

  const toggleSvgPlay = ()=>{
    setSVGPlaying(!svgPlaying)
  }
  
  const jsxVideoScreen = isSVG() ? 
    <SVGVideo svgRef={svgRef} onStop={()=>setSVGPlaying(false)} playing={svgPlaying} timeValue={mobxTime.time} onChangeTime={SVGChangeTime} videoData={videoSrc[videoSelector]}/>
    : <Video src={videoSrc[videoSelector]} videoRef={videoRef} setCurrentTime={mobxTime.setTime.bind(mobxTime)}/>

  return (
    <div className=" main-component text-center md-3">
      <h1 className='h1'>
        Video navigation techniques
      </h1>
      <input type="checkbox" id="removeControls" name="removeControls" onChange={()=>setRemoveButton(b=>!b)}/>
      <label htmlFor="removeControls">remove buttons</label>
      <br/>
      <select className="mb-1" value={videoSelector} onChange={(e)=>handleVideoChange(parseInt(e.target.value))}>
        {videoSrc.map((elt,i)=>(
          <option key={i} value={i}>{elt.url.split('/')[3]}</option>
        ))}
      </select>
      <div className="video-control" >
        {jsxVideoScreen}
        <Control svgOnPlay={toggleSvgPlay} svgRef={svgRef} videoRef={videoRef} time={mobxTime.time} onSeek={(t)=>{handleSeek(t)}} display={mobxTime.timeDisplay} videoData={videoSrc[videoSelector]} options={{removeButtons:removeButton}}/>
      </div>

    </div>
  )
}



export default observer(App);
