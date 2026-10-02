import { memo } from "react"


export const Image=memo(({src, alt,className,...props})=>{
   return <img src={src} alt={alt}  className={className}  {...props}/>
})

