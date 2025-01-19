
import ContextSlider from "./contextSlider";
import ZoomSlider from "./zoomSlider";
import SubpixelSlider from "./subpixelSlider";

import { CSSProperties } from "react";
import BasicSlider from "./basicSlider";


/**
 * @param {number} props.value the current value of the slider
 * @param {Function} props.onChange callback function each time the value of the slider changes
 * @param {React.RefObject<HTMLElement>} videoreference The ref object of the video screen
 * @param {number} props.max the maximum value of the slider 
 * @param {number} props.width the width (*in pixel*) of the slider
 * @param {number} fps the fps of video targeted by the slider
 * @param {number} props.min *optional* : the minimum value of the slider
 * @param {number} props.height *optional* : the height of the slider
 * @param {CSSProperties} style *optional* : the CSS properties of the slider
 * @param {CSSProperties} togglestyle *optional* : the CSS properties of the slider's toggle (*doesn't work with zoom slider*)
 * @param {boolean} options.removeMeasure removes the measure UI under the slider
 */
export interface SliderProps{
    value:number,
    onChange:(n:number)=>any,
    videoreference? : React.RefObject<HTMLElement>,
    min?:number,
    max:number,
    width:number,
    height?:number,
    style? : CSSProperties,
    togglestyle? : CSSProperties,
    fps?:number,
    remove_measure?:boolean,
}

interface extendedSliderProps extends SliderProps{

    /*--- BASIC SLIDER ---*/
    model? : "input"|"div"
    //---DIV---
    children? : React.ReactNode,
    toggleHeight?:number,
    measureDivide? : number,
    onRef? : React.RefObject<HTMLDivElement>,
    option_preventDefaultMouseEvent? :boolean
    //---INPUT---
    step? : number,
    title? : string

    /*--- SUBPIXEL SLIDER --- */
    capturePerSec? : number,
    forceTimeCapture ? : boolean,

    /*--- CONTEXT SLIDER --- */
    interval? : number | {min:number,max:number}
    capturePerSecond? : number
    mode? : "basic"|"rudder",
    
    /*--- ZOOM SLIDER ---*/
    toggleSize? : number,
    direction? : "upward"|"downward",
    minimalMovement?: number,
    layers? : number,
    
    
    options? : {
        /* -- SUBPIXEL -- */
        onScreenNavigation : boolean,

        /*-- ZOOM SLIDER -- */
        cursorInBase? : boolean,
        toggleStartsInMousePosition? : boolean,
        hideToggleWhenNotUsed? : boolean,
        layeredYAxis? : boolean,
    },
}

export const SliderTypes = {BasicSlider,ContextSlider, ZoomSlider, SubpixelSlider,/*RudderSlider,InputSlider,DivSlider*/} 
type SliderTypes = typeof SliderTypes;
type Slider = SliderTypes[keyof SliderTypes]
type StringifiedSliders = keyof SliderTypes;

export type SliderString = StringifiedSliders


interface SliderEltProps extends SliderProps{
    type: Slider | null,
    showError? : boolean,
}

function SliderElt({type : SliderType, ...props} : SliderEltProps){
    return SliderType?<SliderType {...props}/>:(props.showError&&<div>SliderList Component Error : SliderType is not defined</div>)
}

interface Props extends extendedSliderProps{
    type? : StringifiedSliders,
    showError? : boolean,
}

/**This component is a slider. It navigates through the whole video.
 * 
 * 
 * @**important props**
 * @param {number} props.value the current value of the slider
 * @param {Function} props.onChange callback function each time the value of the slider changes
 * @param {StringifiedSliders?} type The slider component that should be included in the *SliderTypes* object. By default it is null
 * @param {React.RefObject<HTMLElement>} videoreference The ref object of the video screen
 * @param {number} props.max the maximum value of the slider 
 * @param {number} props.width the width (*in pixel*) of the slider
 * @param {number} fps the fps of video targeted by the slider
 * 
 * @**style props**
 * @param {number} props.height *optional* : the height of the slider
 * @param {CSSProperties} style *optional* : the CSS properties of the slider
 * @param {CSSProperties} togglestyle *optional* : the CSS properties of the slider's toggle (*doesn't work with zoom slider*)
 * @param {boolean} options.removeMeasure removes the measure UI under the slider
 * 
 * @**other props**
 * @param {number} props.min *optional* : the minimum value of the slider
 * @param {boolean?} showError If true, shows an error message when the slider type is *null* 
 * 
 * @**slider types**
 * @see {@linkcode BasicSlider} the basic slider component
 * @see {@linkcode ContextSlider} the context slider component
 * @see {@linkcode ZoomSlider} the zoom slider component
 * @see {@linkcode SubpixelSlider} the subpixel slider component
 * 
 * @see {@linkcode SliderProps} the interface where extends the component
 */
export default function Slider({type,...props}:Props){

    return <>
            <SliderElt type={type?SliderTypes[type]:null} min={props.min||0} {...props}/>
        </>
}