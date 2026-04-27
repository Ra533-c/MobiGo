import { useEffect, useState } from "react";

interface Props {
    orderId:string;
    onAccepted:()=>void;

}
const RiderOrderRequest = ({orderId,onAccepted}:Props) => {
    const [accepting, setAccepting] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(10);

    useEffect(()=>{
        const interval = setInterval(()=>{
            setSecondsLeft((prev)=>{
                if(prev <= 1){
                    clearInterval(interval);
                    onAccepted();
                    return 0 ;
                }
                return prev - 1 ;
            })
        },1000);

        return ()=> clearInterval(interval)
    },[onAccepted]);

  return (
    <div>RiderOrderRequest</div>
  )
}

export default RiderOrderRequest