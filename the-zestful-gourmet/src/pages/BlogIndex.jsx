import {useEffect,useState} from "react";
import {Link} from "react-router-dom";
import api from "../services/blogApi.js";
import "../styles/Blog.css";

export default function BlogIndex(){
 const [posts,setPosts]=useState([]);const [error,setError]=useState("");
 useEffect(()=>{api.get("/posts").then(({data})=>setPosts(data)).catch(err=>setError(err.response?.data?.message||"Unable to load blog posts."));},[]);
 return <main className="blog-page"><header className="blog-page-heading"><p className="blog-kicker">Stories from the kitchen</p><h1>The Zestful Gourmet</h1><p>Recipes, techniques, ingredients, and thoughtful notes for curious cooks.</p></header>{error&&<div className="blog-alert">{error}</div>}<div className="blog-grid">{posts.map(post=><article className="blog-card" key={post._id}>{post.featuredImage&&<img src={post.featuredImage} alt={post.imageAlt||post.title}/>}<div className="blog-card-body"><p className="blog-meta">{post.category?.name||"Journal"} · {new Date(post.publishedAt||post.createdAt).toLocaleDateString()}</p><h2><Link to={`/blog/${post.slug}`}>{post.title}</Link></h2><p>{post.excerpt||post.content.slice(0,180)}</p><Link className="blog-link" to={`/blog/${post.slug}`}>Read article</Link></div></article>)}</div>{!error&&!posts.length&&<p className="blog-empty">No published posts yet. An administrator can create the first article from the dashboard.</p>}</main>;
}
