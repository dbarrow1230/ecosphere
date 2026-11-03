export default function RequestFeedback({error,message}){
 return <>{error&&<p role="alert" className="text-danger">{error}</p>}{message&&<p role="status" className="text-success">{message}</p>}</>;
}
