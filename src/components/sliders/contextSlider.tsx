import { useState, useEffect, useRef} from "react";
import InputSlider from "./slider_models/inputSlider";
import { SliderProps } from "./slider";
import { restrict, secondToPixel } from "../../assets/util";
import useInterval from "../../hooks/useInterval";
import { createPortal } from "react-dom";

export interface SubSliderProps extends SliderProps{
    interval? : number | {min:number,max:number}
    capturePerSecond? : number
    mode? : "basic"|"rudder"
}

/** This component have two sliders :
 * 
 * One is the main slider where we navigate through the whole data,
 * The other slider is a piece of the original slider where we can navigate through this piece of the global value.
 * 
 * @param {"basic"|"rudder"} mode If "basic", the bottom slider will just navigate through the gray zone. If "rudder", the bottom slider will move the gray zone in question.
 * @param {number | {min:number,max:number}} interval *optional* : The data distance between the center and its borders. By default it is 15
 * @see {@linkcode SliderProps} the interface where extends the component
 */
export default function ContextSlider({min=0, interval=15, capturePerSecond=15, mode="basic", ...props}:SubSliderProps){

    //const currentInterval = typeof interval == "number" ? interval : interval.min
    const ref = useRef<HTMLDivElement>(null);

    const videoScreen = props.videoreference?.current
    const virtualWidth = videoScreen?.parentElement?videoScreen.offsetWidth:props.width

    const msCapture = Math.round(1000/capturePerSecond);
    
    const [currentInterval,setCurrentInterval] = useState(typeof interval == "number" ? interval : (interval.max-interval.min)/2)
    
    const [centerValue,setCenterValue] = mode==="basic"?useState(restrict(props.value,currentInterval,props.max-currentInterval)):useState(currentInterval);
    const [offset,setOffset] = useState(0);
    // mode basic only
    const [preventEffect,setPreventEffect] = useState(false);
    // mode rudder only
    const [selected,setSelected] = useState(false);
    
    let a = mode==="basic"?1:100

    
    useEffect(()=>{
        const init = centerValue
        if(mode==="basic" && !preventEffect){
            setCenterValue(restrict(props.value,currentInterval,props.max-currentInterval))
        }

        if(mode==="rudder" && props.value>=min && props.value <= props.max){
            setCenterValue(props.value)
        }

        return(()=>{
            setCenterValue(init)
        })
    },[props.value,currentInterval])

    const [subMin,subMax] = [centerValue-currentInterval,centerValue+currentInterval]




    /* -- RUDDER MODE ONLY -- */

    const handleTimeCapture = ()=>{
        props.onChange(centerValue+offset)
    }
    const timer = useInterval(handleTimeCapture,msCapture)

    // J'essaye de remettre le curseur au centre à chaque fois que le clic est relevé sans avoir à faire de useEffect sans dépendence
    useEffect(()=>{
        const baseOffset = offset
        if(!selected){
            setOffset(0)
        }
        return()=>{
            setOffset(baseOffset)
        }
    },[selected])
    const handleMouseDown = ()=>{
        switch(mode){
            case "basic":
                setPreventEffect(true);
                break;
            case "rudder":
                setSelected(true);
                timer.start();
                break;
            default :
                console.error("Uncaught error : incorrect mode props ");
        }
    }
    const handleMouseUp =()=>{
        switch(mode){
            case "basic":
                setPreventEffect(false);
                break;
            case "rudder":
                if(timer.isActive){
                    timer.isActive&&timer.stop();
                    setSelected(false);
                }
                break;
            default:
                console.error('Uncaught error : incorrect mode props');
        }
    }

    /*-- END RUDDER MODE ONLY --*/
    



    /*-- BASIC MODE ONLY --*/

    const changeCenterValue = (n:number)=>{
        props.onChange(n);
        setCenterValue(restrict(props.value,currentInterval,props.max-currentInterval))
    }

    /*-- END BASIC MODE ONLY --*/
    


    /*-- COMPONENT RESULT --*/

    const handleSubSliderChange = (newVal:number)=>{
        if(Math.abs(offset)<=currentInterval){
            setOffset(newVal-centerValue)
            mode==="basic"&&props.onChange(centerValue+offset)
        }else{
            setOffset((offset/Math.abs(offset))*currentInterval)
        }
    }
    
    const pixelPos = (val:number) => secondToPixel(val,props.max-min,virtualWidth)

    const handleIntervalChange = (n:number)=>{
        if(typeof interval == "object"){
            setCurrentInterval(restrict(n,interval.min,interval.max))
        }
    }

    const jsxBody = <>
        <InputSlider value={props.value} onChange={changeCenterValue} height={props.height} max={props.max} width={virtualWidth}>
            {/* <div>{((props.max-min)*(props.fps||1)/virtualWidth).toFixed(2)} {props.fps?"frames":"seconds"} per pixel </div> */}
            <div className="input-range-highlighter" style={{ pointerEvents:'none',backgroundColor: "#80808080", width:pixelPos(2*currentInterval),height:props.height,marginInline : 0,position:"absolute",left : pixelPos(centerValue-currentInterval)+(videoScreen?.offsetLeft||ref.current?.offsetLeft||0),display:"flex",}}/>
        </InputSlider>
        <br/>
        <InputSlider value={centerValue+offset} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onChange={handleSubSliderChange} min={subMin} max={subMax} width={virtualWidth} height={props.height} >
            {/* <div className="mt-2">{(currentInterval*(props.fps||1)*2/virtualWidth).toFixed(2)} {props.fps?"frames":"seconds"} per pixel </div> */}
            <div className="input-range-highlighter" style={{pointerEvents:'none',backgroundColor: "#80808080",width:3,height:props.height, marginInline : "auto",position:"absolute",left :((virtualWidth-3)/2)+(videoScreen?.offsetLeft||ref.current?.offsetLeft||0), display:"flex",}}/>
        </InputSlider>
    </>

    return <div ref={ref}>
        {typeof interval=="object"&&<input style={{height:30}} type="range" min={interval.min*a} max={interval.max*a} value={currentInterval*a} onChange={e=>handleIntervalChange(parseInt(e.target.value)/a)}/>}
        {videoScreen?.parentElement?createPortal(jsxBody,videoScreen?.parentElement):jsxBody}
    </div>
}