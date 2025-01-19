import { useEffect, useRef, useState } from "react"
import { ErrorBoundary } from "react-error-boundary";
import Slider, { SliderString } from "./sliders/slider";
import { restrict } from "../assets/util";

interface Params{
    value : number,
    onChange : (newvalue:number)=>any,
    step : number,
    max : number,
    sliderRef? : React.RefObject<HTMLDivElement>,
    videoRef? : React.RefObject<HTMLElement>,
    fps? : number
}

/**This component lists all the sliders available in the application.
 * 
 * @param {number} value the value of the sliders
 * @param {Function} onChange callback function each time the value of one of these sliders changes
 * @param {number} max the maximum value of the sliders
 * @param {number} fps frames per soconds of the referenced video 
 * 
 * @param {number} step the step of the given value
 * @param {React.RefObject<HTMLDivElement>} sliderRef *optional* : the reference of the slider
 * @param {React.RefObject<HTMLMediaElement>} videoRef *optional* : the reference of the video screen
 */
export default function SliderList({videoRef, sliderRef, value, onChange, max, step,...props}:Params){

    const [sliderKey,SetSliderKey] = useState(1);
    const [width,setWidth] = useState(0);
    const ref = useRef<HTMLDivElement>(null)
    const slider = (sliderRef||ref).current

    useEffect(()=>{
        const prev = width
        if(slider){
            setWidth(slider.offsetWidth)
        }
        return((()=>setWidth(prev)))
    },[slider?.offsetWidth])
    
    const sliderList:{
        title:string, 
        type:SliderString|undefined,
        props?:Object
    }[] = [
        {
            title : "none",
            type : undefined,
        },{
            title : "Basic input slider",
            type : "BasicSlider",
            props : {
                model:"input"
            }
        },{
            title : "Basic div slider",
            type : "BasicSlider",
            props:{
                model : "div"
            }
        },{
            title : "Context slider",
            type : "ContextSlider",
            props:{
                mode:"basic",
                interval:{min:1,max: restrict(max/8,1,1800)}
                //interval:10
            }
        },{
            title : "Rudder context slider",
            type : "ContextSlider",
            props : {
                mode:"rudder",
                interval : {min:0.1, max : 2}
            }
        },{
            title : "Subpixel Slider",
            type : "SubpixelSlider"
        },{
            title : "Zoom Slider",
            type : "ZoomSlider",
            props : {
                direction : "upward",
                remove_measure:false,
                options : {
                    layeredYAxis : false,
                    cursorInBase:false,
                    hideToggleWhenNotUsed:true
                }
            }
        }
    ]

    const style = {
        height : 30,
        borderWidth : 0,
        //backgroundColor: "#C8C8FF"
    }
    const toggleStyle={
        //backgroundColor:"blue",
        width : 5,
        borderRadius : 1
    }

    const manageSliderChange = (e:number)=> SetSliderKey(e)
    
    return <div ref={sliderRef||ref}>
        <select className="mb-1" value={sliderKey} onChange={(e)=>manageSliderChange(parseInt(e.target.value))}>
            {sliderList.map((slider,i) =>(
                <option key={i} value={i}>{slider.title}</option>
            ))}
        </select>
        <br/>
        
        <ErrorBoundary fallback={<div className="alert alert-danger">ERROR : SLIDER LIST FAILED TO RENDER !</div>}>
            <Slider 
                type={sliderList[sliderKey].type} 
                value={value} 
                onChange={onChange} 
                max={max} 
                fps={props.fps} 
                videoreference={videoRef} 
                width={width} 
                style={style} 
                togglestyle={toggleStyle} 
                height={style.height||9} 
                {...sliderList[sliderKey].props} />
        </ErrorBoundary>

    </div>
}