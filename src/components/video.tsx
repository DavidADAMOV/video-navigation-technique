import { VideoData } from "../assets/videos";

interface Props{
  src : VideoData,
  videoRef : React.RefObject<HTMLVideoElement>,
  setCurrentTime : (newTime:number)=>any,
}

/**
 * This component shows a video from the source
 * 
 * @param {VideoData} props.src the object where the video will be treated 
 * @param {React.RefObject<HTMLVideoElement>} props.videoRef the reference on which applies the current video HTML element 
 * @param {Function} props.setCurrentTime this function is called each time time changes in a video with the "onTimeUpdate" HTML option
 */
export default function Video({src,videoRef,setCurrentTime}:Props){

  //const [isSVG, toggleSVG] = useState(false)

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      setCurrentTime(video.currentTime);
    }
  };

  return (
    <div id="video" className="video-component container custom-bg-secondary rounded-2 border-2 p-3 my-2 ">

      <video className=" w-100 border border-2 border-dark rounded-2" ref={videoRef} onTimeUpdate={()=>handleTimeUpdate()} muted>
        <source key={src.url} src={src.url} type={src.type}/>
        Votre navigateur ne supporte pas la lecture de vidéos.
      </video>

    </div>
  );
}