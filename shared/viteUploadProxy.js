// Upload prefixes may also contain SPA pages such as /vendors/seeds.
// Let Vite handle document navigation; actual files still reach the backend.
export function bypassUploadPageRequest(request){
 const pathname=String(request.url||'').split('?')[0];
 const filename=pathname.slice(pathname.lastIndexOf('/')+1);
 if(String(request.headers?.accept||'').includes('text/html')&&!filename.includes('.'))return request.url;
}
