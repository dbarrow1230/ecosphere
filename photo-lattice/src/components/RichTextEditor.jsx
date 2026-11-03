import {useEffect} from "react";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import {TextStyle} from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import {EditorContent,useEditor} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import "../styles/RichText.css";

const extensions=[
 StarterKit,
 Underline,
 TextStyle,
 Color,
 Highlight.configure({multicolor:true}),
 TextAlign.configure({types:["heading","paragraph"]}),
 Link.configure({openOnClick:false,autolink:true,defaultProtocol:"https"})
];

function ToolbarButton({active=false,onClick,children,title}){
 return <button type="button" className={active?"is-active":""} onClick={onClick} title={title}>{children}</button>;
}

function RichTextEditor({value="",onChange,placeholder="",minHeight="10rem",disabled=false}){
 const editor=useEditor({
  extensions,
  content:value||"",
  editable:!disabled,
  editorProps:{attributes:{class:"rich-text-editor__content","data-placeholder":placeholder}},
  onUpdate:({editor:currentEditor})=>onChange(currentEditor.isEmpty?"":currentEditor.getHTML())
 });

 useEffect(()=>{
  if(!editor)return;
  const incoming=value||"";
  if(editor.getHTML()!==incoming)editor.commands.setContent(incoming,{emitUpdate:false});
 },[editor,value]);

 useEffect(()=>{
  editor?.setEditable(!disabled);
 },[disabled,editor]);

 if(!editor)return null;

 const setLink=()=>{
  const previous=editor.getAttributes("link").href||"";
  const href=window.prompt("Link URL",previous);
  if(href===null)return;
  if(!href.trim())editor.chain().focus().extendMarkRange("link").unsetLink().run();
  else editor.chain().focus().extendMarkRange("link").setLink({href:href.trim()}).run();
 };

 return(
  <div className={`rich-text-editor${disabled?" is-disabled":""}`} style={{"--rich-text-min-height":minHeight}}>
   <div className="rich-text-editor__toolbar" role="toolbar" aria-label="Text formatting">
    <ToolbarButton title="Bold" active={editor.isActive("bold")} onClick={()=>editor.chain().focus().toggleBold().run()}><strong>B</strong></ToolbarButton>
    <ToolbarButton title="Italic" active={editor.isActive("italic")} onClick={()=>editor.chain().focus().toggleItalic().run()}><em>I</em></ToolbarButton>
    <ToolbarButton title="Underline" active={editor.isActive("underline")} onClick={()=>editor.chain().focus().toggleUnderline().run()}><u>U</u></ToolbarButton>
    <ToolbarButton title="Heading" active={editor.isActive("heading",{level:2})} onClick={()=>editor.chain().focus().toggleHeading({level:2}).run()}>H2</ToolbarButton>
    <ToolbarButton title="Bullet list" active={editor.isActive("bulletList")} onClick={()=>editor.chain().focus().toggleBulletList().run()}>• List</ToolbarButton>
    <ToolbarButton title="Numbered list" active={editor.isActive("orderedList")} onClick={()=>editor.chain().focus().toggleOrderedList().run()}>1. List</ToolbarButton>
    <ToolbarButton title="Block quote" active={editor.isActive("blockquote")} onClick={()=>editor.chain().focus().toggleBlockquote().run()}>Quote</ToolbarButton>
    <ToolbarButton title="Highlight" active={editor.isActive("highlight")} onClick={()=>editor.chain().focus().toggleHighlight().run()}>Mark</ToolbarButton>
    <ToolbarButton title="Link" active={editor.isActive("link")} onClick={setLink}>Link</ToolbarButton>
    <ToolbarButton title="Undo" onClick={()=>editor.chain().focus().undo().run()}>↶</ToolbarButton>
    <ToolbarButton title="Redo" onClick={()=>editor.chain().focus().redo().run()}>↷</ToolbarButton>
   </div>
   <EditorContent editor={editor}/>
  </div>
 );
}

export default RichTextEditor;