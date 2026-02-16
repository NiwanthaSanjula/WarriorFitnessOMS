import { ImSpinner3 } from "react-icons/im";

interface SpinnerProps {
    size?: number | string;
    color?: string;
}


const Spinner = ({ size = 28 , color = "warrior-orange"}: SpinnerProps ) => {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <ImSpinner3 size={size} className={`text-${color} animate-spin`} />
    </div>
  )
}

export default Spinner
