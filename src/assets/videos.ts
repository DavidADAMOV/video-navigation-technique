const DIR = "/data/medias/"
import { secondToFrame } from "./util"
import JSONmediaInfo from "../../data/medias_info.json"


type videoType = `video/${string}` | "svg"

/**
 * @param {string} url the file URL of the video
 * @param {videoType} type describes the type of a video (or it is an HTML format such as "video/[FORMAT]" or it is a svg video)
 * @param {number} fps the FPS of the video
 * @param {number} duration the duration of the video. **in frames** 
 */
export interface VideoData {
    url : string,
    type : videoType,
    fps : number,
    duration : number
}

type JSONMediaInfo = typeof JSONmediaInfo
type JSONElt = {programs?:any[],format?:any[],stream_groups?:any[],streams:{avg_frame_rate:string,duration?:string}[]}
type JSONKey = keyof JSONMediaInfo
type JSONFormat = {
    [k in JSONKey] : JSONElt
}

const generateData = ()=>{
    const resl : VideoData[] =[]
    const medias_info : JSONFormat = JSONmediaInfo
    
    for (const ve in medias_info){
        const videoElt = ve as JSONKey
        
        const vidSepDot = videoElt.split('.')
        const videoFormat = vidSepDot[vidSepDot.length-1] 

        const frameRate = medias_info[videoElt].streams[0].avg_frame_rate.split('/')
        const fps = Number(frameRate[0])/Number(frameRate[1])
        
        const duration = medias_info[videoElt].streams[0].duration
        
        resl.push({
            url : DIR+videoElt,
            type :videoFormat!=="json"?`video/${videoFormat}`:"svg",
            fps : fps,
            duration: videoFormat!=="json"?secondToFrame(Number(duration),fps):Number(duration)
        })
    }
    return resl;
}


/**
 * List of videos
 * @see {@linkcode VideoData} the format of the video data
 */
const VIDEOS : VideoData[] = generateData()

export default VIDEOS;