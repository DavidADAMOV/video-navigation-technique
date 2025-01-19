import { /*HTMLAttributes,*/ useRef } from "react"
import Measure from "../util/measure";
import { SliderProps } from "../slider";

export interface InputSliderProps extends SliderProps{
    step? : number,
    title? : string,
    children? : React.ReactNode,
    measureDivide? : number,
    onMouseDown? : React.MouseEventHandler<HTMLInputElement>,
    onMouseUp? : React.MouseEventHandler<HTMLInputElement>
}



/**
 * This slider is the first slider I implemented in this project.
 * The creation and implementation of this method is rather easy, but the customization is limited
 * @param {string} title *optional* : The text that shows if the component don't have a child
 * @param {number} measureDivide *optional* : the number of units in the measure component 
 * @param {{React.HTMLAttributes<HTMLInputElement>}} props HTML input attributes that can be added (*except onChange*)
 * @param {number} step *unrecomended prop* : the step that takes the slider 
 * 
 * @see {@linkcode SliderProps} the interface where extends the component
 */
export default function InputSlider({width,height=20,title='', value, onChange, min=0, max, step=(max-min)/width, children, measureDivide,...props}:InputSliderProps):JSX.Element{

    const ref = useRef<HTMLInputElement>(null);

    return <div>
            {children||title}
        <input
            ref={ref}
            type="range" 
            className="slider custom-bg-secondary pb-0"
            style={{width:`${width}px`,height:`${height}px`}}
            min={min/step}
            max={max/step}
            value={value/step}
            onChange={e=>{
                onChange(parseFloat(e.target.value)*step);
            }}
            {...props}
        />
        {!props.remove_measure&&<Measure data={{min:min,max:max}} width={width} divisionCoeff={measureDivide}/>}
    </div>
}