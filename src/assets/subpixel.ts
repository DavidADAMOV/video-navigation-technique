interface Props{
    cardinality? : number,
    widgetSize?:number,
    inputResolution?:number,
    minResHuman?:number,
    defaultResHuman?:number,
    displayResolution?:number,
    inputFPS?:number,
}

export default class Subpixel {
    cardinality:number
    widgetSize:number
    inputResolution:number
    minResHuman:number
    defaultResHuman:number
    resUseful:number
    displayResolution:number
    inputFPS:number
    gOpt=0
    vUse=0
    gPix=0
    vPix=0


    constructor(props:Props = {}) {
        this.cardinality = props.cardinality ?? 5160.  // number of frames in video (86 seconds * 60 fps)
        this.widgetSize = props.widgetSize ?? 800.  // pixel size of the slider (1200px set in css)
        this.inputResolution = props.inputResolution ?? 400.  // default 800 CPI as input capacity
        this.minResHuman = props.minResHuman ?? 200.  // minimum resolution human movements
        this.defaultResHuman = 400. // default resolution human movements
        this.resUseful = Math.min(Math.max(this.defaultResHuman, this.minResHuman), this.inputResolution)
        this.displayResolution = props.displayResolution ?? 108.79 // dpi of the display (e.g., 2560x1440 for 27'' on Philips Brilliance 272B display)
        // this.inputFPS = props.inputFPS ?? 125.  // refresh rate of the input device
        this.inputFPS = props.inputFPS ?? 100.  // we consider 10 fps refresh rate for a magic trackpad

        this.computeFactors()
    }

    computeFactors() {
        this.gOpt = this.widgetSize * this.resUseful / this.cardinality / this.displayResolution
        this.vUse = this.inputFPS / 1000. / this.resUseful

        this.gPix = (0.015) * this.inputResolution / this.displayResolution  // arbitrary numbers for ratio
        this.vPix = this.inputFPS / this.displayResolution / this.gPix
    }

    setFramesInVideo(cardinality:number) {
        this.cardinality = cardinality
        this.computeFactors()
    }

    defaultGainFunction = (dx:number, dy:number) => {
        const counts = Math.sqrt(dx*dx + dy*dy)
        const meters = (counts/this.inputResolution) * 0.0254
        const mouseSpeed = meters * this.inputFPS;
        // console.log("mouseSpeed ", mouseSpeed)

        const gMin = .01, gMax = 20, v1 = 0.03, v2 = 0.07
        //console.log("subpixel",mouseSpeed, v1, v2)

        let cdGain
        if(mouseSpeed <= v1) { cdGain = gMin }
        else if(mouseSpeed >= v2) { cdGain = gMax }
        else { cdGain = gMin + (gMax-gMin)/(v2-v1) * (mouseSpeed - v1) }

        const pixelGain = cdGain * this.displayResolution / this.inputResolution
        // console.log(cdGain, pixelGain)

        return { gdx: dx*pixelGain, gdy: dy*pixelGain }
    }

    computeGain = (dx:number, dy:number, dt:number) => {
        const deltaPix = Math.sqrt(dx*dx + dy*dy)
        const deltaTime = dt

        const movInches = deltaPix / this.inputResolution  // movement in inches
        const speed = Math.abs(movInches / (deltaTime/1000.))  // speed in inches/seconds


        const { gdx, gdy } = this.defaultGainFunction(dx, dy)
        
        let q = 1.0
        let gain = Math.sqrt(gdx*gdx + gdy*gdy) / movInches / this.displayResolution
        if(Number.isNaN(gain)) return

        if(this.vPix < this.vUse) { q = Math.min(Math.max((speed - this.vUse) / (this.vPix - this.vUse), 0.), 1.) }
        else { q = Math.min(speed / this.vPix, 1.) } // always here on current setup
        gain = (1 - q) * this.gOpt + q * gain
        // console.log("gain", q, gain, q*gain)

        const pixelGain = gain * this.displayResolution / this.inputResolution
        return pixelGain
    }
}