import {PropagateLoader} from 'react-spinners';

export default function FullPageLoader(){
 
  return (
    <div className="fixed inset-0 bg-white bg-opacity-80 z-50 flex items-center justify-center">
      <PropagateLoader color="#155dfc" />
    </div>
  )
}
