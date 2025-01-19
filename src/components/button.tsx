import { ButtonHTMLAttributes, ReactNode } from "react"

interface Params extends ButtonHTMLAttributes<HTMLButtonElement>{
    onClick : ()=>any,
    label? : string,
    children? : ReactNode|null,
    style?:React.CSSProperties
}

/**
 * The button component
 * @param {Function} onClick the function that will be called each time the button is clicked
 * @param {string} label the text inside the button. It appears if the component have no childrens 
 */
function Button({className,style,onClick,label='',children=null}:Params): JSX.Element{
    return <button 
        className={`btn ${!style&&"custom-btn-primary"} text-light m-2 border border-dark`+(className||'')}
        onClick={onClick}
        style={style}
    >
        {children||label}
    </button>
}

export default Button