import DivSlider from "./slider_models/divSlider";
import { SliderProps } from "./slider";
import Subpixel from '../../assets/subpixel'
import { pixelToSecond, secondToPixel } from "../../assets/util";
import { useEffect, useRef, useState } from "react";
//import useInterval from "../../hooks/useInterval";
import { createPortal } from "react-dom";


export interface SubpixelSliderProps extends SliderProps{
    capturePerSec? : number,
    forceTimeCapture ? : boolean,
    options? : {
        onScreenNavigation : boolean
    }
}

/** 
 * This component uses the subpixel method to navigate to the video using the mouse pointer speed gain.
 * Thus, faster you move your mouse, the more the speed gain goes high, and vice-versa.
 * 
 * **This method works only on Chrome, Edge, and Opera. It does not work in Firefox and Safari.**
 * **This method doesn't work in Linux either.**
 * 
 * @param {boolean?} options.onScreenNavigation if true (*default*), you can navigate directly on the screen
 * 
 * @see {@linkcode SliderProps} the interface where extends the component
 */
export default function SubpixelSlider({options={onScreenNavigation:true},capturePerSec=100,fps=30,min=0,...props}:SubpixelSliderProps){

    //const milisecInterval = Math.round(1000/capturePerSec)

    const videoScreen = props.videoreference?.current
    const virtualWidth = videoScreen?.parentElement?videoScreen.offsetWidth:props.width
    
    const subpixel = new Subpixel({
        cardinality : (props.max-min)*fps,
        widgetSize : virtualWidth,
        inputResolution : 1000, //Souris DELL : 1000 dpi 
        displayResolution : 96, //sur Linux, globalment, la résolution est de 96 dpi ( `$ xdpyinfo | grep -B 2 resolution` )
    })
    const mouseTime = useRef(0)
    
    const [position,setPosition] = useState(secondToPixel(props.value,props.max-min,virtualWidth))
    
    useEffect(()=>{
        const prevPos = position
        setPosition(secondToPixel(props.value,props.max-min,virtualWidth))
        return ()=>{
            setPosition(prevPos)
        } 
    },[props.value])
    
    const handleMouseDown = (_:MouseEvent, ref:React.RefObject<HTMLElement>|undefined)=>{
        if(ref&&ref.current){
            //@ts-ignore
            ref.current.requestPointerLock({unadjustedMovement: true})
            mouseTime.current = Date.now()
        }
    }
    const handleMouseUp = ()=>{
        document.exitPointerLock()
    }
    const handleMouseMove = (e:MouseEvent)=>{
        const dt = Date.now() -  mouseTime.current
        const delta = pixelToSecond(e.movementX*(subpixel.computeGain(e.movementX,e.movementY,dt)||0),virtualWidth,props.max-min)
        props.onChange(props.value+delta);
        mouseTime.current = Date.now()
    }
    
    const jsxBody = <DivSlider  {...props} width={virtualWidth} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseMove={handleMouseMove} option_preventDefaultMouseEvent/>

    return <>
        {videoScreen?.parentElement?<>
            {createPortal(<>
            {options.onScreenNavigation&&<DivSlider {...props} remove_measure option_preventDefaultMouseEvent width={videoScreen.offsetWidth} height={videoScreen.offsetHeight} onMouseDown={(me)=>handleMouseDown(me,props.videoreference)} onMouseUp={handleMouseUp} onMouseMove={me=>handleMouseMove(me)} 
            style={{
                backgroundColor:"transparent",
                position:"absolute",
                top:videoScreen.offsetTop,
                left:videoScreen.offsetLeft,
                cursor:"pointer",
                boxShadow:"none"
            }} 
            togglestyle={{display:"none"}}/>}
            {jsxBody}
            </>,videoScreen.parentElement)}
        </>:<>
            {jsxBody}
        </>}
    </>
}