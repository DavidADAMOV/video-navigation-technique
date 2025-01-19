/**
 * Restrict the number in an inerval of two numbers
 * @param n the value n
 * @param m the minimum number
 * @param M the maximum number
 * @returns n if it is between m and M, otherwise m if under or M if over
 */
export const restrict = (n:number,m:number,M:number)=>(n<m)?m:(n>M)?M:n

//export const applyCondition = (condition:boolean,callback:Function,errorMessage:string) => condition?callback:console.error(errorMessage||"condition failed")

export const secondToFrame = (sec:number,fps:number)=> Math.trunc(sec*fps)
export const frameToSecond = (frame:number,fps:number) => frame/fps 

export const pixelToSecond = (pos:number,width:number,duration:number) => pos*duration/width
export const secondToPixel = (curr:number,duration:number,width:number) => curr*width/duration
export const frameToPixel = (curr:number,total:number,width:number) => Math.trunc(curr*width/total)
export const pixelToFrames = (pos:number,width:number,totalFrames:number) => Math.trunc(pos*totalFrames/width)