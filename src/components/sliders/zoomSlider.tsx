import { CSSProperties, RefObject, useEffect, useState } from "react";
import DivSlider, { Toggle } from "./slider_models/divSlider";
import { SliderProps } from "./slider";
import { pixelToSecond, restrict, secondToPixel } from "../../assets/util";
import { createPortal } from "react-dom";

export interface ZoomSliderProps extends SliderProps{
    toggleSize? : number,
    direction? : "upward"|"downward",
    minimalMovement?: number,
    options? : {
        cursorInBase? : boolean,
        toggleStartsInMousePosition? : boolean,
        hideToggleWhenNotUsed? : boolean,
        layeredYAxis? : boolean,
    },
    layers? : number
}


/**This slider have two axis.
 * 
 * On the x axis, we manipulate the main value.
 * On the y axis, we manipulate the precision of the x axis navigation. 
 * 
 * @**basic sliders props**
 * @see {@linkcode SliderProps} the interface where extends the component
 * 
 * @**specific component props**
 * @param {number} toggleSize the size of the round toggle
 * @param {"upward"|"downward"} direction *optional* : shows the direction where the Y axis gets its initial value
 * @param {number} minimalMovement *optional* : when the Y axis is at its maximum precision value, it stucks the zoom rate between 0 and 1. By default, it is 1%
 * @param {number} layers *optional* : The number of layers dividing the Y axis. By default it is 7. This prop is only useful when `options.layerdYAxis` is `true`.
 * 
 * @**Options props**
 * @param {boolean} options.cursorInBase sets the y axis to its initial value when  
 * @param {boolean} options.toggleStartsInMousePosition Initialize the toggle position to the mouse position when it is clicked.
 * @param {boolean} options.hideToggleWhenNotUsed if the mouse isn't hold, it hides the toggle.
 * @param {boolean} options.layeredYAxis Blocks the Y axis into defined layers
 * 
 * 
 */
export default function ZoomSlider({options={layeredYAxis:true},layers=7, height=250, toggleSize=20,min=0,minimalMovement=0.01,direction='downward',...props}:ZoomSliderProps){
    
    const virtualWidth = props.videoreference?.current?props.videoreference.current.offsetWidth:props.width
    const virtualHeight = props.videoreference?.current?props.videoreference.current.offsetHeight:height
    const baseY = direction==="downward"?0:virtualHeight
    
    const [zoom,setZoom] = useState(1)
    const [posX,setX] = useState(0)
    const [posY,setY] = useState(baseY)
    const [hide,setHide] = useState(options.hideToggleWhenNotUsed)
    const [frameInfo,setFrameInfo] = useState(false)

    // ? diamètre du cercle = temps d'une image
    const toggleStyle:CSSProperties={
        width:`${restrict(toggleSize*(zoom),5,virtualHeight)}px`,
        height : `${restrict(toggleSize*(zoom),5,virtualHeight)}px`,
        backgroundColor : "#FFFFFF",
        //border :"1px bold #000000", //déclaration abandonée : l'assignation des bordures ne marche pas. C'est peut être à cause de bootstrap
        borderRadius : toggleSize,
        overflow : "hidden",
        visibility : hide?"hidden":"visible"
    }

    const virtualY = options.layeredYAxis ? (virtualHeight/layers)*Math.round(posY*layers/virtualHeight) : posY

    /* 
    
    const form = useFormular(form, )

    */

    useEffect(()=>{
        const prevY=posY
        const prevX=posX
        setX(secondToPixel(props.value,props.max-min,virtualWidth))
        setY(baseY)
        return ()=>{
            setY(prevY)
            setX(prevX)
        }
    },[direction])

    // change zoom
    useEffect(()=>{
        const prevZoom = zoom
        const newVal = direction==="downward"?(1-virtualY/virtualHeight):virtualY/virtualHeight
        setZoom(restrict(newVal,minimalMovement,1))
        return(()=>{
            setZoom(restrict(prevZoom,minimalMovement,1))
        })
    },[posY])


    useEffect(()=>{
        const defaultValue = posX
        //setX(props.value)
        setX(secondToPixel(props.value,props.max-min,virtualWidth))
        return ()=>{
            setX(defaultValue)
        }
    },[props.value])

    useEffect(()=>{
        const init=hide
        if(!options.hideToggleWhenNotUsed){
            setHide(false)
        }
        return(()=>{
            setHide(init)
        })
    },[options.hideToggleWhenNotUsed])

    const initialize=(e:MouseEvent, ref : RefObject<HTMLDivElement>)=>{
        if (ref.current){
            const x = e.pageX-ref.current.offsetLeft
            options.toggleStartsInMousePosition&&setX(x)
        }
    }

    const mouseUpdate = (e:MouseEvent, ref : RefObject<HTMLDivElement>)=>{
        if(ref.current){
            if(e.movementX!=0){
                const deltaX = e.movementX*zoom
                props.onChange( pixelToSecond(posX+deltaX,virtualWidth,props.max-min) )
            }
            if(Math.abs(e.movementY)>0){
                const h = ref.current.offsetHeight
                const deltaY = e.movementY
                //setY(oldY =>restrict(oldY+deltaY,0,h))
                setY(restrict(posY+deltaY,0,h))
            }
        }
    }
    const handleMouseDown = (e:MouseEvent,localRef : RefObject<HTMLDivElement>)=>{
        if(localRef.current){
            localRef.current.requestPointerLock()
            setFrameInfo(true)
            options.hideToggleWhenNotUsed&&setHide(false)
            initialize(e,localRef)
        }
    }
    const handleMouseMove = (e: MouseEvent,localRef : RefObject<HTMLDivElement>) => mouseUpdate(e,localRef)
    const handleMouseUp = () => {
        options.hideToggleWhenNotUsed&&setHide(true)
        setFrameInfo(false)
        document.exitPointerLock()
        options.cursorInBase&&setY(baseY)
    }

    const personalizedBorderRadius = direction==="downward"?{borderTopLeftRadius:11, borderTopRightRadius:11}:{borderBottomLeftRadius:11, borderBottomRightRadius:11}

    

    const infoBlock = frameInfo&&<div className="border border-dark" style={{
        backgroundColor:"white",
        width : 40,
        //height : toggleSize,
        position:"relative",
        top:virtualY<virtualHeight?virtualY:virtualY-toggleSize*2,
        left:posX,
        fontSize:"x-small",
        overflow:"visible",
        borderRadius:5

    }}>
        {Math.trunc(100*zoom*props.max*(props.fps||30)/virtualWidth)/100}
    </div>

    const JSXcontent = 
                <DivSlider 
                    {...props}
                    width={virtualWidth}
                    height={virtualHeight} 
                    toggleHeight={toggleSize}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    style={props.videoreference?.current?{
                        ...personalizedBorderRadius,
                        // visibility:"hidden",
                        backgroundColor : "transparent",
                        boxShadow : "0px 0px 0px",
                        position:"absolute",
                        top:props.videoreference.current.offsetTop,
                        left:props.videoreference.current.offsetLeft,
                    }:personalizedBorderRadius}
                    option_preventDefaultMouseEvent
                >
                    <Toggle className={"border border-2 border-dark"} posX={posX} posY={virtualY} style={toggleStyle}/>
                    {infoBlock}
                </DivSlider>
    
// Référence directe sur la vidéo à finir.
    return<>
        {props.videoreference?.current?.parentElement?<>
            <div>click on the video screen</div>
            {createPortal( <>
                {JSXcontent}
                <div>{Math.trunc(100*zoom*props.max*(props.fps||30)/virtualWidth)/100} frame per movement unit</div>
            </> , props.videoreference.current.parentElement )}
            </> 
            : <>
            {Math.trunc(100*zoom*props.max*(props.fps||30)/virtualWidth)/100} frame per movement unit
            {JSXcontent}
            </>}
    </>
}