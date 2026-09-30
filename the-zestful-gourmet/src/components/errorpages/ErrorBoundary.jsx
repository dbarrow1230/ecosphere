// ErrorBoundary.jsx
import React from "react";
import Error500 from "./Error500";

export default class ErrorBoundary extends React.Component{
 constructor(props){
  super(props);
  this.state={hasError:false};
 }

 static getDerivedStateFromError(){
  return{hasError:true};
 }

 componentDidUpdate(prevProps){
  if(this.state.hasError&&prevProps.resetKey!==this.props.resetKey){
   this.setState({hasError:false});
  }
 }

 componentDidCatch(error,info){
  console.error(error,info);
 }

 render(){
  if(this.state.hasError){
   return <Error500/>;
  }
  return this.props.children;
 }
}
