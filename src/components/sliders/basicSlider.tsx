import DivSlider from "./slider_models/divSlider";
import InputSlider from "./slider_models/inputSlider";
import { SliderProps } from "./slider";
import { createPortal } from "react-dom";

interface BasicSliderProps extends SliderProps{
    model? : "input"|"div"

    children? : React.ReactNode,
    toggleHeight?:number,
    measureDivide? : number,
    onRef? : React.RefObject<HTMLDivElement>,
    option_preventDefaultMouseEvent? :boolean

    step? : number,
    title? : string
}

/** a simple slider that navigates the video
 * 
 * @param {"input"|"div"} model "div" by default, determine how the slider should be build ("input":{@linkcode InputSlider} , "div":{@linkcode DivSlider}) 
 * @see {@linkcode InputSlider} 
 * @see {@linkcode DivSlider}
 */
export default function BasicSlider({model="div",...props} : BasicSliderProps){

    const videoBlock = props.videoreference?.current
    const virtualWidth = videoBlock?.parentElement?videoBlock.offsetWidth:props.width


    const jsxBody = model==="div"?<DivSlider{...props} width={virtualWidth}/>:<InputSlider{...props} width={virtualWidth}/>
    

    return<>
        {videoBlock?.parentElement?<>
        {createPortal(jsxBody,videoBlock.parentElement)}
        </>:<>
        {jsxBody}
        </>}
    </>

}