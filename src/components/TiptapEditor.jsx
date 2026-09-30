import {useEffect} from "react";
import {EditorContent,useEditor} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

function TiptapEditor({
 value="",
 onChange,
 placeholder="Write here...",
 className=""
}){
 const editor=useEditor({
  extensions:[
   StarterKit,
   Placeholder.configure({
    placeholder
   })
  ],
  content:value||"",
  editorProps:{
   attributes:{
    class:`tiptap-editor-content ${className}`.trim()
   }
  },
  onUpdate:({editor})=>{
   if(onChange)onChange(editor.getHTML());
  }
 });

 useEffect(()=>{
  if(!editor)return;

  const current=editor.getHTML();
  const next=value||"";

  if(current!==next){
   editor.commands.setContent(next,false);
  }
 },[editor,value]);

 return(
  <div className="tiptap-editor">
   <div className="tiptap-toolbar">
    <button type="button" onClick={()=>editor?.chain().focus().toggleBold().run()} className={editor?.isActive("bold")?"active":""}>Bold</button>
    <button type="button" onClick={()=>editor?.chain().focus().toggleItalic().run()} className={editor?.isActive("italic")?"active":""}>Italic</button>
    <button type="button" onClick={()=>editor?.chain().focus().toggleBulletList().run()} className={editor?.isActive("bulletList")?"active":""}>Bullets</button>
    <button type="button" onClick={()=>editor?.chain().focus().toggleOrderedList().run()} className={editor?.isActive("orderedList")?"active":""}>Numbers</button>
   </div>

   <EditorContent editor={editor}/>
  </div>
 );
}

export default TiptapEditor;