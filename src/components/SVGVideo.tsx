import { useEffect, useState } from "react"
import useInterval from "../hooks/useInterval"
import { frameToSecond, restrict, secondToFrame } from "../assets/util"
import { VideoData } from "../assets/videos"
import { useWindowListener } from "../hooks/useWindowListener"

interface Props{
    videoData : VideoData,
    svgRef? : React.RefObject<HTMLDivElement>,
    height?:number,
    circleSize? :number,
    timeValue : number,
    onChangeTime : (n:number)=>void,
    playing : boolean,
    onStop?: ()=>void,
    traceObject? : boolean
    //test : ()=>void,
}

/** Create an SVG video from a json file
 * 
 * @**video element props**
 * @param {VideoData} videoData the data of the source video that contains url, the duration and the frame rate of the video (@see {@linkcode VideoData})
 * @param {React.RefObject<HTMLDivElement>} props.svgRef  the reference of the video. **It should be a div element that have a SVG element as the first child**
 * 
 * @**time props**
 * @param {number} props.timeValue the time (**in seconds**) on the video
 * @param {Function} props.onChangeTime the callback function that changes the time value
 * @param {boolean} props.playing true if the video is playing
 * @param {Function} props.onStop callback function that handles the `playing` prop 
 * 
 * @**sizing props**
 * @param {number} props.height the height of the video screen
 * @param {number} circleSize The size of the video element
 * 
 *  
*/
export default function SVGVideo({videoData,circleSize=10,traceObject=false,...props} : Props){
    
    /**
     * animation exemple => [[frame1ball1,frame2ball1],[frame1ball2,frame2ball2]] 
     * 1 frame => [x,y]
     * 
     * each element of the list sould have the same length
    */
    const [animation,setAnimation] = useState<[number,number][]>([])

    const [loaded,setLoaded] = useState(false)
    const [current,setCurrentFrame] = useState(secondToFrame(props.timeValue,videoData.fps) || 0)
    const clock = useInterval(readAnimation,1000/videoData.fps)
    const [svgElementList,setSvgElementList] = useState<SVGElement[]>([])
    const [mousedown,setMousedown] = useState(false)
    

    /**
     * checks if the data corresponds this kind of structure :
     *  [ [ XFrame1,YFrame1 ],[ XFrame2,YFrame2 ], ... ]
     * @param data the animation data
     * @returns {boolean}
     */
    const validateAnimationData = (data : any)=>{
        return data instanceof Array 
        && data.length >= videoData.duration
        && data.every(frame=> 
            frame instanceof Array 
            && frame.length == 2 
            && frame.every(n=>
                typeof n ==="number"
            )
        ) 
    }
    
    useEffect(()=>{
        pause()
        setCurrentFrame(0)
        props.onChangeTime(0)
        console.log("loading animation data")
        if(videoData.url){
            fetch(videoData.url)
                .then((response)=>response.json())
                .then((json)=>{
                    if (validateAnimationData(json)){
                        setAnimation(json)
                    }else{
                        console.error("the JSON file is not a valid type")
                        console.log(json)
                    }
                }).catch(()=>{
                console.error(`file ${videoData.url} not found`)
                })
        }else {
            console.error('no url in SVGVideo component')
        }
        setLoaded(true)
        return()=>{
            pause()
            setCurrentFrame(0)
            setLoaded(false)
            setAnimation([])
        }
    },[videoData.url])
    
    useEffect(()=>{
        //const prevFrame = current 
        const frame = restrict(secondToFrame(props.timeValue,videoData.fps),0,animation.length-1)
        if(loaded){
            if(frame<animation.length){
                setCurrentFrame(frame);
                updateObjectPosition(frame)
            }else{
                setCurrentFrame(animation.length-1)
                updateObjectPosition(animation.length-1)
            }
        }
        //updateObjectPosition()
        return()=>{
            //setCurrentFrame(prevFrame)
            //console.log("unloading time value",frame)
        }
    },[props.timeValue])

    useEffect(()=>{
        const svgel : SVGElement[] = []
        if(animation.length>0){
            const [x,y] = animation[current]
            const circle = document.createElementNS("http://www.w3.org/2000/svg","circle")
            circle.setAttribute("cy",`${y}`);
            circle.setAttribute("cx",`${x}`);
            circle.setAttribute("r",`${circleSize}`)
            circle.setAttribute("style","fill : #5090E0")
            svgel.push(circle)
        }

        setSvgElementList(svgel)

        return()=>{
            setSvgElementList([])
        }
    },[animation])

    useEffect(()=>{
        props.playing?play():pause()
        return ()=>pause()
    },[props.playing])

    const pause = ()=>{
        clock.isActive&&clock.stop()
    }

    const play = ()=>{
        !clock.isActive&&clock.start()
    }

    const handleSVGObject = (element : SVGSVGElement | null) =>{
        if (element){
            element.firstChild&&element.removeChild(element.firstChild)
            svgElementList.map(e=>element.appendChild(e))
        }
    } 

    const updateObjectPosition = (frame : number)=>{
        if(frame<animation.length){
            const svgel : SVGElement[] = []
            animation[frame]===undefined&&console.log(frame)
            const [x,y] = animation[frame]
            const circle = svgElementList[0]
            circle.removeAttribute("cy")
            circle.removeAttribute("cx")
            circle.setAttribute("cy",`${y}`)
            circle.setAttribute("cx",`${x}`)
            svgel.push(circle)
            setSvgElementList(svgel)
        }
    }

    const update=(frame:number)=>{
        const f = restrict(frame,0,animation.length-1)
        updateObjectPosition(f)
        setCurrentFrame(f)
        props.onChangeTime(frameToSecond(f,videoData.fps))
    }

    function readAnimation(){
        if(current+1<=videoData.duration){
            update(current+1)
        }else{
            props.onStop&&props.onStop()
            pause()
        }
    }

    /* ------DIMP interaction technique part------ */

    function distance(source:[number,number],target:[number,number]){
        const [x,y] = [0,1]
        return Math.sqrt((source[x]-target[x])**2 + (source[y]-target[y])**2)
    }

    function DIMPMoveCircle_recursive(mousePos : [number,number], currentFrame:number, prevRes?:number){
        const objectPos = animation[currentFrame]
        const actualFrameDistance = distance(mousePos,objectPos)
        if(actualFrameDistance<=50){
            const restrictedCurrent = restrict(currentFrame,1,animation.length-2)
            const prevFrameDistance = distance(mousePos,animation[restrictedCurrent-1])
            const nextFrameDistance = distance(mousePos,animation[restrictedCurrent+1])
            const minimalValue = Math.min(actualFrameDistance,prevFrameDistance,nextFrameDistance)
            switch(minimalValue){
                case(prevFrameDistance):
                    prevRes==restrictedCurrent-1?
                        update(currentFrame)
                        :DIMPMoveCircle_recursive(mousePos,restrictedCurrent-1,currentFrame)
                    break;
                case(nextFrameDistance):
                    prevRes==restrictedCurrent+1?
                        update(currentFrame)
                        :DIMPMoveCircle_recursive(mousePos,restrictedCurrent+1,currentFrame)
                    break;
                case(actualFrameDistance):
                    update(currentFrame)
                    break;
                default:
                    console.error("ERROR : minimalValue variable did not match the 3 values")
                    break;
            }
        }
    }

    function DIMPMoveCircle(mousePos : [number,number]){
        DIMPMoveCircle_recursive(mousePos,current)
    }

    function handleMouseDown(me:React.MouseEvent){
        const elt = props.svgRef?.current
        const rect = elt?.getClientRects()[0]
        if(rect){
            const mousePos:[number,number] = [me.clientX-rect.x,me.clientY-rect.y]
            DIMPMoveCircle(mousePos)
            setMousedown(true)
        }else{
            console.error("ERROR : Rect is null or undefined")
        }
    }
    function handleMouseMove(me:React.MouseEvent){
        if(mousedown){
            const elt = props.svgRef?.current
            const rect = elt?.getClientRects()[0]
            if(rect){
                const mousePos:[number,number] = [me.clientX-rect.x,me.clientY-rect.y]
                DIMPMoveCircle(mousePos)
            }else{
                console.error("ERROR : Rect is null or undefined")
            }
        }
    }
    function handleMouseUp(){
        setMousedown(false)
    }

    useWindowListener("mousemove",handleMouseMove)
    useWindowListener("mouseup",handleMouseUp)

    /* ------DIMP interaction technique part end------ */

    /**
     * Créer un hook State qui va enregistrer l'historique des passages passées par l'objet
     * à partir ce ce variable on va pouvoir tracer le mouvement du cercle
     */
    /*function traceLine(){
        
    }*/

    return <div id="video" className="video-component container custom-bg-secondary rounded-2 border-2 p-3 my-2 ">
        <div ref={props.svgRef} className="w-100 " >
            <svg ref={ref=>handleSVGObject(ref)} onMouseDown={e=>handleMouseDown(e)} className="w-100 h-100 border border-2 border-dark rounded-2 " style={{backgroundColor:"white"}}/>
        </div>
    </div>

}
