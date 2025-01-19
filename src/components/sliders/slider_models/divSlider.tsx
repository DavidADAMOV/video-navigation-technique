import React, { useEffect, useRef, useState } from "react"
import Measure from "../util/measure";
import { SliderProps } from "../slider";
import { useWindowListener } from "../../../hooks/useWindowListener";
import InputSlider from "./inputSlider";
import { pixelToSecond, secondToPixel } from "../../../assets/util";

type onMouseFunction = (e:MouseEvent, ref:React.RefObject<HTMLDivElement>)=>any

export interface DivSliderProps extends SliderProps{
    onMouseUp? : onMouseFunction,
    onMouseDown? : onMouseFunction,
    onMouseMove? : onMouseFunction,
    min?:number,
    height?:number,
    toggleHeight?:number,
    toggleStyle? : React.CSSProperties,
    measureDivide? : number,
    onRef? : React.RefObject<HTMLDivElement>,
    children? : React.ReactNode,
    option_preventDefaultMouseEvent? :boolean
}

const DEFAULT_HEIGHT = 20

/** The slider component that uses the div HTML Element : 
 * 
 * This slider component is more customizable than the {@linkcode InputSlider} component but is a bit more heavy 
 * 
 * @**PARAMETERS**
 * @param {number} toggleHeight *optional* : the height of the slider's toggle, by default it is 20 pixels
 * @param {React.CSSProperties} toggleStyle : *optional* : customize the style of toggle property 
 * @param {number} props.measureDivide - *optional* : the number of units in the measure component.
 * 
 * @**Mouse Event Props**
 * @param {onMouseFunction} props.onMouseUp callback function when the mouse is up
 * @param {onMouseFunction} props.onMouseDown callback function when the mouse is down
 * @param {onMouseFunction} props.onMouseMove callback function when the mouse is down and moves
 * @param {boolean} props.option_preventDefaultMouseEvent *optional* : Prevents the component's default mouse behavior
 * 
 * @*other*
 * @see {@linkcode SliderProps} the interface where extends the component
 */
export default function DivSlider({children,min=0,height=DEFAULT_HEIGHT,...props}:DivSliderProps){
    const ref = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState(0);
    const [isDragging, setIsDragging] = useState(false)

    const baseStyle:React.CSSProperties={
        border : `solid #2B2B2B`,
        borderWidth: 0,
        borderRadius : 2,
        ...props.style,
        height: `${height}px`,
        cursor: "pointer",
    }
    const toggleStyle:React.CSSProperties={
        backgroundColor : "#CF3E3E",
        ...props.togglestyle,
        height : `${props.toggleHeight||height}px`,
    }
    const sliderStyle:React.CSSProperties={
        margin: "5px 0",
        backgroundColor : "#F0B6B6",
        marginBottom:'0px',
        boxShadow: "1px 1px 1px #50555C",
        width : `${props.width}px`,
    }

    //Updates the position state
    useEffect(()=>{
        if(!children){
            const prevPosition = position;
            
            if(ref.current){
                setPosition(secondToPixel(props.value-min,props.max-min,props.width))
            }
            return(()=>{
                setPosition(prevPosition)
            })
        }
    },[props.value,props.width])

    const mouseUpdate = (e:MouseEvent)=>{
        if (ref.current){
            const pos = e.pageX-ref.current.offsetLeft
            props.onChange( pixelToSecond(pos,props.width,props.max-min) )
        }
    }
    const handleMouseDown = (e:React.MouseEvent<Element, MouseEvent>)=>{
        e.preventDefault();
        if(ref.current){
            setIsDragging(true);
            !props.option_preventDefaultMouseEvent&&mouseUpdate(e.nativeEvent)
            if( props.onMouseDown){
                props.onMouseDown(e.nativeEvent,ref)
            }
        }else{
            console.error("DivSlider cannot be referenced")
        }
    }
    const handleMouseUp = (e:MouseEvent) => {
        if(isDragging&&ref.current){
            setIsDragging(false);
            props.onMouseUp&&props.onMouseUp(e,ref)
        }else if(!ref.current){
            console.error("DivSlider cannot be referenced")
        }
    }
    const handleMouseMove = (e:MouseEvent)=>{
        if(isDragging&&ref.current){
            !props.option_preventDefaultMouseEvent&&mouseUpdate(e)
            if(props.onMouseMove){
                props.onMouseMove(e,ref)
            }
        }else if(!ref.current){
            console.error("DivSlider cannot be referenced")
        }
    }
    
    //These hooks basically handles the mouse event each time we interact with the slider
    useWindowListener("mousemove",handleMouseMove)
    useWindowListener("mouseup",handleMouseUp)

    return <div>
        <div onMouseDown={handleMouseDown} ref={ref} style={{...sliderStyle,...baseStyle}}>
            {!children?
                <Toggle posX={position} style={{...baseStyle,...toggleStyle}}/>:
                children}
        </div>
        {!props.remove_measure&&<Measure data={{min:min,max:props.max}} width={props.width} divisionCoeff={props.measureDivide}/>}
    </div>
}




interface ToggleProps{
    posX : number,
    posY? : number,
    style?:React.CSSProperties,
    className? : string
}
/** This component is a slider's toggle. It will navigate through its parent
 * 
 * @param {number} props.posX the position (*in pixels*) of the toggle's x axis from its parent
 * @param {number} props.posY *optional* : the position (*in pixels*) of the toggle's y axis from its parent
 * @param {React.CSSProperties} props.style CSS properties of the component
 * @param {string} props.className HTML class name of the component
 */
export function Toggle({...props}:ToggleProps){

    const ref = useRef<HTMLDivElement>(null)

    const posRate = (pos:number,total:number) => {
        return total!=0?pos*100/total:50
    }
    const w = ref.current?.parentElement?.offsetWidth||0
    const h = ref.current?.parentElement?.offsetHeight||0


    const baseStyle:React.CSSProperties={
        width:`10px`,
        height:`10px`,
        backgroundColor : "#CF3E3E",
        overflow: "hidden",
        ...props.style,
        position:"relative",
        left: `${props.posX-parseInt(ref.current?.style.borderWidth||'0')}px`,
        top : `${(props.posY||0)-parseInt(ref.current?.style.borderWidth||'0')}px`,
        transform :`translateX(-${posRate(props.posX,w)}%)`+(props.posY!=undefined?`translateY(-${posRate(props.posY,h)}%)`:""),
    }

    return <div className={props.className}ref={ref} style={{...baseStyle}}/>
}
