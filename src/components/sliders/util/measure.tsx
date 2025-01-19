import { useEffect, useState } from "react";

interface MeasureProps {
    data: { min: number; max: number };
    width: number;
    divisionCoeff? : number;
  }

/**This component shows a measure ruler at the bottom of the upper component
 * 
 * @param {{min:number,max:number}} data an object that contains the minimum and the maximum data value
 * @param {number} width the width (*in pixel*) of the measure component
 * @param {number} divisionCoeff this prop is an integer that indicates the number of units of this component. 
 */
export default function Measure({ data, width, divisionCoeff=14}:MeasureProps){
    const [marks, setMarks] = useState<number[]>([]);
    const dataWidth = data.max-data.min;

    const displayTime = (seconds:number)=>{
      const ms = Math.round(((seconds%60)*100)%100)
      const s = Math.trunc(seconds%60)
      const m = Math.trunc((seconds/60)%60)
      const h = Math.trunc(seconds/3600)
      const doubleDigits = (n:number) =>{
        return (n<10?'0':'')+n.toString()
      }
      /*const display = (a:number,b:number,c?:number)=>{
        return doubleDigits(a)+':'+doubleDigits(b)+(c?':'+doubleDigits(c):'')
      }*/
      const res = `${data.max>3600?doubleDigits(h)+':':'' }${data.max>60?doubleDigits(m%60)+':':''}${doubleDigits(s%60)+':'+doubleDigits(ms%100)}`
      return res
      //return Math.trunc(dataWidth/3600)>0?display(h,m%60)+'h':Math.trunc(dataWidth/60)>0?display(m,s)+'m':seconds.toFixed(2)+'s'
    } 

    useEffect(() => {
        const newMarks:number[] = [];
        divisionCoeff = Math.trunc(divisionCoeff)
        for (let i=0;i<=divisionCoeff;i++) {
            let elt = ((dataWidth*i)/divisionCoeff)+data.min;
            newMarks.push(elt);
        }
        setMarks(newMarks);
      },[data.max,data.min])
  
    return (
      <div className="user-select-none" style={{height:"13px",width: `${width}px`, display: 'flex', justifyContent: 'space-between'}}>
        {marks.map((mark, index) => (
          <div key={index} style={{ position: 'relative', width: '1px', backgroundColor: '#000', height: '10px' }}>
            <div style={{ position: 'absolute', top: '7px', left: '0', transform: `translateX(-${Math.trunc((index/(marks.length-1))*100)}%)`, fontSize:"50%"}}>{displayTime(mark)}</div>
          </div>
        ))}
      </div>
    );
}
