(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const a of n)if(a.type==="childList")for(const r of a.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&i(r)}).observe(document,{childList:!0,subtree:!0});function o(n){const a={};return n.integrity&&(a.integrity=n.integrity),n.referrerPolicy&&(a.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?a.credentials="include":n.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function i(n){if(n.ep)return;n.ep=!0;const a=o(n);fetch(n.href,a)}})();class Q extends Error{constructor(t,o,i,n){super(i||`请求失败（HTTP ${t}，${n}）`),this.status=t,this.errorType=o,this.serverMessage=i,this.name="ApiError"}status;errorType;serverMessage}async function G(e,t={},o="request"){const i=await fetch(e,{credentials:"same-origin",...t,headers:{Accept:"application/json",...t.headers||{}}});if(!i.ok){let a={};try{const r=await i.json();r&&typeof r=="object"&&!Array.isArray(r)&&(a=r)}catch{}throw new Q(i.status,typeof a.error=="string"?a.error:"",typeof a.message=="string"?a.message:typeof a.reason=="string"?a.reason:"",o)}if(!(i.headers.get("content-type")||"").includes("application/json"))throw new Q(i.status,"UnexpectedResponse","",o);return await i.json()}async function Re(e,t,o={}){const i=new AbortController,n=window.setTimeout(()=>i.abort(),t);try{return await fetch(e,{...o,signal:i.signal})}finally{window.clearTimeout(n)}}async function He(e,t){const o=new URL("/autocomplete.json",e);o.searchParams.set("search[type]","tag_query"),o.searchParams.set("search[query]",t),o.searchParams.set("limit","10");const i=await G(o.toString(),{},"autocomplete");return(Array.isArray(i)?i:[]).map(We).filter(n=>n.value)}function We(e){const t=e||{};return{value:String(t.value||t.name||t.label||t.tag||"").trim(),count:"",category:String(t.category_name||t.category||t.type||"")}}function ve(){return document.querySelector('meta[name="csrf-token"]')?.content||""}function xe(){const e=ve();return e?{"X-CSRF-Token":e}:{}}async function Fe(e,t){ke();const o=new URL("/favorites",e);o.searchParams.set("post_id",t);const i=await fetch(o.toString(),{method:"POST",credentials:"same-origin",headers:{Accept:"application/json",...xe()}});if(i.status!==409&&!i.ok){const n=await i.text();if(/already\s+favorited/i.test(n))return;throw new Error(ye(i.status))}}async function Ve(e,t){ke();const o=ve(),i=await fetch(new URL(`/favorites/${encodeURIComponent(t)}`,e).toString(),{method:"POST",credentials:"same-origin",headers:{Accept:"application/json","Content-Type":"application/x-www-form-urlencoded;charset=UTF-8",...xe()},body:new URLSearchParams({_method:"delete",authenticity_token:o,button:""}).toString()});if(!i.ok&&i.status!==404)throw new Error(ye(i.status))}async function Ne(e,t){const o=Le();if(!o)return!1;const i=new URL("/favorites.json",e);i.searchParams.set("search[post_id]",t),i.searchParams.set("search[user_id]",o);const n=await G(i.toString(),{},"favorites.json");return Array.isArray(n)&&n.some(a=>Ye(a,t,o))}function ye(e){return e===401||e===403?"登录已失效或权限不足，请刷新原站并确认登录后重试。":e===404?"图片不存在或已被删除。":e===429?"操作过于频繁，请稍等一分钟后重试。":"服务器未能完成收藏操作，请稍后重试。（HTTP "+e+"）"}function ke(){if(!Le())throw new Error("未检测到登录状态")}function Le(){const e=document.body.dataset.currentUserId||"",t=document.body.dataset.currentUserIsAnonymous==="true";return!e||t?"":e}function Ye(e,t,o){const i=e||{};return String(i.post_id??i.postId??"")===t&&String(i.user_id??i.userId??"")===o}async function Ge(e,t,o){const i=new URL("/posts.json",e),a=new URLSearchParams(t.pageUrlSearch||"").get("z");i.searchParams.set("tags",t.tags),i.searchParams.set("page",String(t.page)),a&&i.searchParams.set("z",a);const r=await G(i.toString(),{},"posts.json"),s=Array.isArray(r)?r:[];return{posts:s.map(o).filter(c=>c.available),hasSourcePosts:s.length>0}}function k(e,t){const o=typeof e=="string"?e.trim():"";return o?/^https?:\/\//i.test(o)?o:o.startsWith("//")?`${location.protocol}${o}`:o.startsWith("/")?new URL(o,t).toString():o:""}function Z(e){return/^https?:\/\//i.test(e)}function Ze(e,t,o){const i=new URL("/posts",e);return t&&i.searchParams.set("tags",t),o&&o>1&&i.searchParams.set("page",String(o)),i.toString()}const U=new Set(["jpg","jpeg","png","webp","gif","avif"]),W=new Set(["mp4","webm"]);function Xe(e,t){const o=e||{},i=Array.isArray(o.media_asset?.variants)?o.media_asset.variants:[],n=k(o.file_url||C(i,["original","file"]),t),a=k(o.large_file_url||C(i,["large","sample","720x720"]),t),r=k(o.sample_file_url||o.sample_url||C(i,["sample","large","720x720"]),t),s=k(o.preview_file_url||o.preview_url||C(i,["preview","360x360","180x180","small"]),t),c=k(C(i,["720x720","360x360","180x180"],U)||$([o.preview_file_url,o.preview_url,o.sample_file_url,o.sample_url,o.large_file_url],U),t),h=Number(o.image_width||o.width||o.media_asset?.image_width||0),d=Number(o.image_height||o.height||o.media_asset?.image_height||0),m=String(o.file_ext||X(n)||"").toLowerCase(),L=m==="zip",x=W.has(m)?n:k(C(i,["sample","720x720"],W)||$([o.sample_file_url,o.sample_url,o.large_file_url],W),t),y=!!x,Oe=c||s||$([r,a,n],U),De=$([r,a,n],U)||c||s;return{id:String(o.id??""),raw:o,fileUrl:n,largeUrl:a,sampleUrl:r,previewUrl:s,thumbnailUrl:c,playbackUrl:x,listUrl:Oe,viewerUrl:De,width:h,height:d,aspectRatio:h&&d?h/d:1,tags:Ce(o),tagGroups:Ke(o),rating:o.rating||"u",score:Number(o.score||0),source:qe(o,t),fileExt:m,isVideo:y,isUgoira:L,favorited:ot(o),available:!o.is_deleted&&!o.is_banned&&!!o.id&&!!(n||a||r||s)}}function v(e){return Array.isArray(e)?e.map(String).filter(Boolean):typeof e=="string"?e.split(/\s+/).filter(Boolean):[]}function Ce(e){return Array.isArray(e.tag_string)?e.tag_string.map(String).filter(Boolean):typeof e.tag_string=="string"?v(e.tag_string):typeof e.tags=="string"?v(e.tags):e.tags&&typeof e.tags=="object"?Object.values(e.tags).flatMap(t=>v(t)):[]}function Ke(e){const t=e.tags&&typeof e.tags=="object"?e.tags:{},o={artist:v(e.tag_string_artist||t.artist),copyright:v(e.tag_string_copyright||t.copyright),character:v(e.tag_string_character||t.character),general:v(e.tag_string_general||t.general),meta:v(e.tag_string_meta||t.meta)};if(!o.general.length){const i=new Set([...o.artist,...o.copyright,...o.character,...o.meta]);o.general=Ce(e).filter(n=>!i.has(n))}return o}function C(e,t,o){if(!e)return"";for(const i of t){const n=e.find(a=>{const r=String(a.type||a.name||a.variant||"").toLowerCase();return(r===i||r.includes(i))&&(!o||o.has(tt(a)))});if(n?.url)return n.url}return""}function X(e){try{return new URL(e).pathname.split(".").pop()||""}catch{return e.split(/[?#]/)[0]?.split(".").pop()||""}}function qe(e,t){const o=Je(e.pixiv_id);if(o)return ee(o);const i=k(e.source||"",t),n=Qe(i);return n?ee(n):et(i)||i}function Je(e){const t=String(e??"").trim();return/^\d+$/.test(t)?t:""}function Qe(e){if(!e)return"";try{const t=new URL(e),o=t.hostname.toLowerCase();if(o==="www.pixiv.net"||o==="pixiv.net"){const i=t.pathname.match(/\/(?:en\/)?artworks\/(\d+)/);if(i?.[1])return i[1];const n=t.searchParams.get("illust_id");if(n&&/^\d+$/.test(n))return n}if(o.endsWith("pximg.net")){const i=t.pathname.match(/\/(\d+)_p\d+(?:_[a-z0-9]+)?\.[a-z0-9]+$/i);if(i?.[1])return i[1]}}catch{const t=e.match(/\/(\d+)_p\d+(?:_[a-z0-9]+)?\.[a-z0-9]+(?:\?|$)/i);if(t?.[1])return t[1]}return""}function ee(e){return`https://www.pixiv.net/artworks/${e}`}function et(e){try{const t=new URL(e),o=t.hostname.toLowerCase();if(o.endsWith("patreonusercontent.com")){const i=t.pathname.match(/\/post\/(\d+)\//)?.[1];if(i)return`https://www.patreon.com/posts/${i}`}if(o==="c.fantia.jp"){const i=t.pathname.match(/\/uploads\/post\/file\/(\d+)\//)?.[1];if(i)return`https://fantia.jp/posts/${i}`}}catch{return""}return""}function tt(e){return String(e.file_ext||X(e.url||"")).toLowerCase()}function $(e,t){return e.find(o=>!!o&&t.has(X(String(o)).toLowerCase()))||""}function ot(e){return!!(e.is_favorited||e.is_favorited_by_current_user||e.is_favorited_by_user||e.favorited||e.has_favorite||e.current_user_favorite||e.favorite_id)}class it{constructor(t="https://danbooru.donmai.us"){this.origin=t}origin;siteName="Danbooru";isMatch(t){return t.origin===this.origin&&(t.pathname==="/"||t.pathname.startsWith("/posts"))}getPosts(t){return Ge(this.origin,t,o=>this.normalizePost(o))}getAutocomplete(t){return He(this.origin,t)}createFavorite(t){return Fe(this.origin,t)}deleteFavorite(t){return Ve(this.origin,t)}isFavorited(t){return Ne(this.origin,t)}getPostUrl(t,o=""){const i=new URL(`/posts/${encodeURIComponent(t)}`,this.origin);return o&&i.searchParams.set("q",o),i.toString()}getPostsPageUrl(t,o){return Ze(this.origin,t,o)}normalizePost(t){return Xe(t,this.origin)}}const nt=900,_e=220,Ie=280,_=12,z=[{key:"small",label:"小",value:180},{key:"medium",label:"中",value:_e},{key:"big",label:"大",value:Ie}];function j(e){const t=document.getElementById("dmh-grid");if(!t)return;const o=Math.max(0,t.clientWidth),i=e.cardWidth,n=Math.max(1,Math.floor((o+_)/(i+_))),r=Math.max(80,(o-(n-1)*_)/n),s=Array.from({length:n},()=>0),c=t.querySelectorAll(".dmh-card");for(const h of c){const d=e.posts[Number(h.dataset.index)];if(!d)continue;const m=rt(s),L=m*(r+_),x=s[m],y=st(d.width,d.height,r);h.style.width=`${r}px`,h.style.left=`${L}px`,h.style.top=`${x}px`,h.style.height=`${y}px`,s[m]+=y+_}t.style.height=`${Math.max(0,...s)||0}px`}function at(e){e.started&&(cancelAnimationFrame(e.resizeRaf),e.resizeRaf=requestAnimationFrame(()=>j(e)))}function te(){return document.documentElement.scrollHeight-window.innerHeight-window.scrollY<nt}function rt(e,t=_){const o=Math.min(...e);return e.findIndex(i=>i<=o+t)}function st(e,t,o){return!e||!t?o:Math.max(80,Math.round(o*t/e))}const dt="https://cdn.jsdelivr.net/gh/kano0222/danbooru-tag-zh@main/artifacts/ffdkj/zh-hans.min.json",lt=2500;class ct{data={};loading=null;loaded=!1;load(){return this.loading||(this.loading=this.loadOnce()),this.loading}translate(t){for(const o of this.lookupKeys(t)){const i=this.data[o];if(i)return i}return""}format(t){const o=this.translate(t);return o?`${t} ${o}`:t}async loadOnce(){try{const t=await Re(dt,lt,{cache:"no-cache",headers:{Accept:"application/json"},credentials:"omit"});if(!t.ok)throw new Error(`HTTP ${t.status}`);return this.data=await t.json(),this.loaded=!0,!0}catch(t){return console.warn("[Danbooru Masonry] tag translation load failed:",t),this.data={},this.loaded=!1,!1}}lookupKeys(t){const o=t.replace(/\s+/g,"_"),i=o.replace(/_/g," ");return[t,o,i,t.toLowerCase(),o.toLowerCase(),i.toLowerCase()]}}const ht="danbooru-masonry.cardSize",pt="danbooru-masonry.viewerUseOriginal",mt="danbooru-masonry.viewerPreloadCount",ut="danbooru-masonry.showThumbnailInfo",gt="danbooru-masonry.showThumbnailButtons",ft="danbooru-masonry.viewerWheelNavigation",bt="danbooru-masonry.showScrollbar",wt="danbooru-masonry.autoEnterMasonry",vt="danbooru-masonry.downloadFilenameTemplates",xt="danbooru-masonry.hideNsfw",Ee="danbooru-masonry.viewerTagsOpen",yt="danbooru-masonry.tagClickBehavior";function kt(e){return e==="masonry-current-tab"||e==="masonry-new-tab"?e:"masonry-new-tab"}function Lt(e){At(Ee,e)}const oe="__dmh_missing__",K=[{key:"pixiv",label:"Pixiv",template:"pixiv[{artist}]_{original}"},{key:"fanbox",label:"Fanbox",template:"fanbox[{username}]_{id}"},{key:"fantia",label:"Fantia",template:"fantia[{artist}]_{id}"},{key:"patreon",label:"Patreon",template:"patreon[{artist}]_{id}"},{key:"weibo",label:"Weibo",template:"weibo[{artist}]({userid})_{id}"},{key:"twitter",label:"X / Twitter",template:"twitter[{username}]_{id}"},{key:"bilibili",label:"Bilibili",template:"bilibili[{artist}]_{id}"},{key:"danbooru",label:"其他",template:"danbooru[{artist}]_{postid}"}],S=Object.fromEntries(K.map(e=>[e.key,e.template]));function Ct(e){return{adapter:e,page:_t(),tags:new URLSearchParams(location.search).get("tags")||"",posts:[],sourcePosts:[],blacklist:{enabled:!1,rules:[]},blacklistText:"",blacklistSaving:!1,blacklistAvailable:!1,loading:!1,done:!1,started:!1,starting:!1,loadMore:null,requestToken:0,resizeRaf:0,layoutObserver:null,autocompleteTimer:0,autocompleteToken:0,autocompleteIndex:-1,hideNsfw:w(xt,!1),autoEnterMasonry:w(wt,!0),viewerTagsOpen:w(Ee,!1),tagClickBehavior:kt(A(yt)),viewerIndex:-1,viewerChromeHidden:!1,zoomMode:!1,zoomScale:1,zoomX:0,zoomY:0,zoomDragging:!1,zoomMoved:!1,zoomStartX:0,zoomStartY:0,zoomBaseX:0,zoomBaseY:0,lastViewerWheelAt:0,favoriteLoading:!1,favoritePostIds:new Set,favoriteStateCache:new Map,favoriteStateLoading:new Set,cardWidth:It(),viewerUseOriginal:Et(),viewerPreloadCount:St(A(mt)),showThumbnailInfo:w(ut,!1),showThumbnailButtons:w(gt,!0),viewerWheelNavigation:w(ft,!0),showScrollbar:w(bt,!0),downloadFilenameTemplates:zt(),translations:new ct}}function _t(){const e=Number(new URLSearchParams(location.search).get("page"));return Number.isFinite(e)&&e>0?Math.floor(e):1}function It(){const e=A(ht);return Tt(e)?.value??Ie}function Et(){return w(pt,!1)}function St(e){const t=Number(e);return Number.isInteger(t)&&t>=0&&t<=5?t:2}function zt(){const e=A(vt),t={...S};if(e&&typeof e=="object")for(const o of K){const i=e[o.key];typeof i=="string"&&i.trim()&&(t[o.key]=i.replace(/\.\{ext\}\s*$/,""))}return t}function w(e,t){const o=A(e);return o===!1||o==="false"?!1:o===!0||o==="true"?!0:t}function A(e){try{const t=GM_getValue(e,oe);if(t!==oe)return t}catch{}}function At(e,t){try{GM_setValue(e,t)}catch{}}function Tt(e){return z.find(t=>t.key===e)}function Ut(e){const t=e.tagGroups,o=new Set([...t.artist,...t.copyright,...t.character,...t.meta]);return[...new Set(t.general)].filter(i=>i&&!o.has(i))}function Se(e,t,o){const i=new URL(e.getPostsPageUrl(t));return o==="masonry-new-tab"&&i.searchParams.set("dmh","1"),i.toString()}function b(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]??t)}const f=b;function p(e){return document.getElementById(e)}function ze(e){if(typeof GM_openInTab=="function"){GM_openInTab(e,{active:!0,insert:!0});return}window.open(e,"_blank","noreferrer")}function Ae(e){return e.thumbnailUrl||e.previewUrl||e.listUrl||""}const ie=new WeakMap;function O(e){let t=ie.get(e);return t||(t={images:new Map,generation:0},ie.set(e,t)),t}function Te(e,t){const o=O(e),i=o.images.get(t);if(i)return i;const n=new Image;return t&&(o.images.set(t,n),n.src=t),n}function ne(e,t){O(e).images.delete(t)}async function $t(e,t,o){const i=O(e),n=++i.generation,a=e.viewerPreloadCount>0?o.filter(Boolean):[],r=new Set([t,...a]);for(const s of i.images.keys())r.has(s)||i.images.delete(s);for(const s of a){if(n!==i.generation)return;const c=Te(e,s);if(c.complete||await new Promise(h=>{const d=()=>{c.removeEventListener("load",d),c.removeEventListener("error",d),h()};c.addEventListener("load",d),c.addEventListener("error",d)}),n!==i.generation)return;c.naturalWidth||i.images.delete(s)}}function Mt(e){const t=O(e);t.generation++,t.images.clear()}function V(e,t){if(t<0||t>=e.posts.length)return;const o=e.posts[t];e.viewerIndex=t;const i=p("dmh-viewer"),n=p("dmh-viewer-img"),a=p("dmh-viewer-video"),r=p("dmh-viewer-loading"),s=p("dmh-viewer-info");if(!i||!n||!a||!r||!s)return;if(D(e,!1),o.playbackUrl)Y(r),n.hidden=!0,n.src="",a.hidden=!1,a.poster=o.thumbnailUrl||o.previewUrl||"",a.src=o.playbackUrl,a.load(),a.play().catch(h=>console.warn("[Danbooru Masonry] video autoplay failed:",h));else{a.pause(),a.hidden=!0,a.removeAttribute("src"),a.removeAttribute("poster"),a.load();const h=B(e,o),d=Ae(o);d?(n.onload=null,n.onerror=null,n.src=d,n.hidden=!1):(n.hidden=!0,n.removeAttribute("src")),Zt(r);const m=Te(e,h),L=()=>i.classList.contains("dmh-open")&&e.posts[e.viewerIndex]?.id===o.id&&B(e,o)===h,x=()=>{if(L()){if(!m.naturalWidth){ne(e,h),re(r);return}n.onload=null,n.onerror=null,n.src=h,n.hidden=!1,Y(r)}},y=()=>{L()&&(ne(e,h),d||(n.hidden=!0),re(r))};m.onload=x,m.onerror=y,m.complete&&window.requestAnimationFrame(m.naturalWidth?x:y)}vo(e);const c=e.favoriteStateCache.get(o.id);c!==void 0?N(e,o,c):o.favorited?e.favoritePostIds.add(o.id):e.favoritePostIds.delete(o.id),Me(e,o),Nt(e,o),Yt("dmh-open-source",Z(o.source)),Pe("dmh-open-source",`来源 ${o.source||""}`.trim()),R(e),$e(e),i.classList.add("dmh-open"),i.setAttribute("aria-hidden","false"),document.documentElement.classList.add("dmh-no-scroll"),Pt(e)}function Pt(e){const t=e.viewerIndex,o=e.posts[t];if(!o)return;const i=o.playbackUrl?"":B(e,o),n=[];if(!o.playbackUrl&&e.viewerPreloadCount>0)for(let a=t+1;a<e.posts.length&&n.length<e.viewerPreloadCount;a++){const r=e.posts[a];if(r.playbackUrl)continue;const s=B(e,r);s&&n.push(s)}$t(e,i,n)}function P(e){const t=p("dmh-viewer"),o=p("dmh-viewer-img"),i=p("dmh-viewer-video"),n=p("dmh-viewer-loading");!t||!o||!i||!n||(t.classList.remove("dmh-open"),t.setAttribute("aria-hidden","true"),Mt(e),D(e,!1),Y(n),o.onload=null,o.onerror=null,o.src="",i.pause(),i.hidden=!0,i.removeAttribute("src"),i.removeAttribute("poster"),i.load(),p("dmh-settings-panel")?.classList.contains("dmh-open")||document.documentElement.classList.remove("dmh-no-scroll"))}async function T(e,t){const o=e.viewerIndex+t;if(o>=0&&o<e.posts.length){V(e,o);return}if(t<0||o<0||e.done||e.loading||!e.loadMore)return;const i=e.posts.length;await e.loadMore(),e.posts.length>i&&o<e.posts.length&&V(e,o)}function Bt(e){const t=e.posts[e.viewerIndex];t?.source&&Z(t.source)&&ze(t.source)}function jt(e,t,o=S){const i=e?.fileUrl||e?.viewerUrl||"";if(!e||!Z(i)||t?.classList.contains("dmh-download-loading"))return;const n=Xt(e,o);E(t,!0);try{GM_download({url:i,name:n,onload:()=>E(t,!1),onerror:a=>{E(t,!1),!oo(a)&&(console.warn("[Danbooru Masonry] download failed:",a),F("下载失败"))},ontimeout:()=>{E(t,!1),console.warn("[Danbooru Masonry] download timed out"),F("下载超时，请稍后重试。")}})}catch(a){E(t,!1),console.warn("[Danbooru Masonry] download failed:",a),F("下载失败")}}function Ot(e,t){if(t.stopPropagation(),e.zoomMoved){e.zoomMoved=!1;return}e.zoomMode||(e.viewerChromeHidden=!e.viewerChromeHidden,$e(e))}function Ue(e,t){t?.stopPropagation(),D(e,!e.zoomMode)}function D(e,t){e.zoomMode=t,e.zoomScale=1,e.zoomX=0,e.zoomY=0,e.zoomDragging=!1,e.zoomMoved=!1,R(e)}function Dt(e,t){t.stopPropagation(),e.zoomMode&&D(e,!0)}function Rt(e,t){!e.zoomMode||t.button!==0||(t.preventDefault(),t.stopPropagation(),e.zoomDragging=!0,e.zoomMoved=!1,e.zoomStartX=t.clientX,e.zoomStartY=t.clientY,e.zoomBaseX=e.zoomX,e.zoomBaseY=e.zoomY,t.currentTarget.setPointerCapture?.(t.pointerId),R(e))}function Ht(e,t){if(!e.zoomMode||!e.zoomDragging)return;t.preventDefault();const o=t.clientX-e.zoomStartX,i=t.clientY-e.zoomStartY;(Math.abs(o)>2||Math.abs(i)>2)&&(e.zoomMoved=!0),e.zoomX=e.zoomBaseX+o,e.zoomY=e.zoomBaseY+i,q(e)}function ae(e,t){e.zoomDragging&&(e.zoomDragging=!1,t.currentTarget.releasePointerCapture?.(t.pointerId),R(e))}function Wt(e,t){if(!p("dmh-viewer")?.classList.contains("dmh-open")||!t.deltaY||t.target.closest?.("#dmh-viewer-tags-panel"))return;if(t.preventDefault(),t.stopPropagation(),e.zoomMode){Vt(e,t);return}if(!e.viewerWheelNavigation)return;const i=Date.now();i-e.lastViewerWheelAt<300||(e.lastViewerWheelAt=i,T(e,t.deltaY>0?1:-1))}function Ft(e,t){if(p("dmh-viewer")?.classList.contains("dmh-open")&&!t.defaultPrevented){if(t.key==="Escape"&&e.viewerTagsOpen&&!e.viewerChromeHidden&&!p("dmh-viewer-tags")?.hidden){t.preventDefault(),Be(e,!1,!0);return}t.key==="Escape"&&P(e),t.key==="ArrowLeft"&&T(e,-1),t.key==="ArrowRight"&&T(e,1),t.key.toLowerCase()==="e"&&!e.posts[e.viewerIndex]?.isVideo&&Ue(e)}}function $e(e){p("dmh-viewer")?.classList.toggle("dmh-chrome-hidden",e.viewerChromeHidden)}function R(e){const t=p("dmh-viewer"),o=p("dmh-viewer-img"),i=p("dmh-zoom-toggle");t?.classList.toggle("dmh-zoom-mode",e.zoomMode),o&&(o.draggable=!e.zoomMode,o.classList.toggle("dmh-dragging",e.zoomDragging)),i&&(i.classList.toggle("dmh-active",e.zoomMode),Pe("dmh-zoom-toggle",e.zoomMode?"退出原图模式":"查看大图"),i.hidden=e.posts[e.viewerIndex]?.isVideo||!1),q(e)}function q(e){const t=p("dmh-viewer-img");t&&(t.style.transform=e.zoomMode?`translate(${e.zoomX}px, ${e.zoomY}px) scale(${e.zoomScale})`:"")}function Vt(e,t){const o=e.zoomScale,i=Math.min(5,Math.max(.25,o*(t.deltaY<0?1.12:.88)));if(i===o)return;const n=p("dmh-viewer-img");if(!n)return;const a=n.getBoundingClientRect(),r=a.left+a.width/2,s=a.top+a.height/2,c=i/o-1;e.zoomX-=(t.clientX-r)*c,e.zoomY-=(t.clientY-s)*c,e.zoomScale=i,q(e)}function Me(e,t,o="收藏"){const i=p("dmh-favorite");if(!i)return;const n=e.favoritePostIds.has(t.id)||t.favorited;i.classList.toggle("dmh-favorited",n),i.disabled=e.favoriteLoading;const a=Gt(o,n);i.dataset.dmhTooltip=a,i.setAttribute("aria-label",a),i.removeAttribute("title")}async function Nt(e,t){if(!e.adapter.isFavorited)return;const o=e.favoriteStateCache.get(t.id);if(o!==void 0){N(e,t,o);return}if(!e.favoriteStateLoading.has(t.id)){e.favoriteStateLoading.add(t.id);try{const i=await e.adapter.isFavorited(t.id);if(e.favoriteStateCache.set(t.id,i),e.posts[e.viewerIndex]?.id!==t.id)return;N(e,t,i)}catch(i){console.warn("[Danbooru Masonry] favorite state check failed:",i)}finally{e.favoriteStateLoading.delete(t.id)}}}function N(e,t,o){t.favorited=o,o?e.favoritePostIds.add(t.id):e.favoritePostIds.delete(t.id),Me(e,t)}function Yt(e,t){const o=p(e);o&&(o.hidden=!t,o.disabled=!t)}function Pe(e,t){const o=p(e);o&&(o.removeAttribute("title"),o.dataset.dmhTooltip=t,o.setAttribute("aria-label",t))}function Gt(e,t){return e.includes("失败")||e.includes("中")?e:t?"取消收藏":"收藏"}function F(e){const t=p("dmh-snackbar");if(!t)return;t.textContent=e,t.classList.add("dmh-open"),window.clearTimeout(Number(t.dataset.timer||0));const o=window.setTimeout(()=>t.classList.remove("dmh-open"),2600);t.dataset.timer=String(o)}function Zt(e){e.hidden=!1,e.setAttribute("aria-hidden","false"),p("dmh-viewer-progress")?.removeAttribute("hidden"),p("dmh-viewer-error")?.setAttribute("hidden","")}function Y(e){e.hidden=!0,e.setAttribute("aria-hidden","true"),p("dmh-viewer-progress")?.removeAttribute("hidden"),p("dmh-viewer-error")?.setAttribute("hidden","")}function re(e){e.hidden=!1,e.setAttribute("aria-hidden","false"),p("dmh-viewer-progress")?.setAttribute("hidden",""),p("dmh-viewer-error")?.removeAttribute("hidden")}function B(e,t){return e.viewerUseOriginal&&!t.isUgoira?t.fileUrl||t.thumbnailUrl||t.previewUrl||"":t.viewerUrl||t.thumbnailUrl||t.previewUrl||t.listUrl||""}function Xt(e,t){const o=Kt(e),i=t[o.platform]||S[o.platform]||S.danbooru;return eo(xo(i)?S[o.platform]:i,o)}function Kt(e){const t=e.raw||{},i=(typeof t.source=="string"?t.source:"")||e.source||"",n=se(i),a=se(e.source||i),r=g(e.fileExt||io(e.fileUrl)||"jpg"),s=g(qt(t.tag_string_artist)||e.tagGroups.artist[0]||"unknown"),c=Qt(e,s,r,n),h=String(t.pixiv_id||ro(n,i)||"").trim();if(h){const d=n?H(n):"",m=g(d.replace(/\.[^.]+$/,"")||h);return{...c,platform:"pixiv",id:h,original:m}}if(a&&so(a)){const d=g(lo(a)||s),m=g(co(a)||e.id);return{...c,platform:"fanbox",username:d,artist:d,id:m}}if(n&&de(n)){const d=g(le(n)||e.id);return{...c,platform:"fantia",id:d}}if(a&&de(a)){const d=g(le(a)||e.id);return{...c,platform:"fantia",id:d}}if(n&&ce(n)){const d=g(he(n)||e.id);return{...c,platform:"patreon",id:d}}if(a&&ce(a)){const d=g(he(a)||e.id);return{...c,platform:"patreon",id:d}}if(n&&ho(n)){const d=g(po(n)||"unknown"),m=g(mo(n)||e.id);return{...c,platform:"weibo",userid:d,id:m}}if(n&&uo(n)){const d=g(n.pathname.split("/").filter(Boolean)[0]||"unknown"),m=g(go(n)||pe(n)||e.id);return{...c,platform:"twitter",username:d,id:m}}if(n&&fo(n)){const d=g(bo(n)||pe(n)||e.id);return{...c,platform:"bilibili",id:d}}return c}function se(e){try{return e?new URL(e):null}catch{return null}}function qt(e){return typeof e=="string"&&e.split(/\s+/).filter(Boolean)[0]||""}function g(e){return e.trim().replace(/[<>:"/\\|?*]+/g,"_").replace(/[\n\r\t]+/g,"_").replace(/\s+/g,"_").replace(/_+/g,"_").replace(/^_+|_+$/g,"").slice(0,120)||"unknown"}function Jt(e){return e.trim().replace(/[<>:"/\\|?*]+/g,"_").replace(/[\n\r\t]+/g,"_").replace(/\s+/g,"_").replace(/_+/g,"_").replace(/^\.+/g,"").slice(0,180)||"danbooru"}function Qt(e,t,o,i){const n=g(no(i&&H(i)||ao(e.fileUrl)||e.id));return{platform:"danbooru",artist:t,username:t,userid:"",id:g(e.id),postid:g(e.id),original:n,ext:o}}function eo(e,t){const i=e.replace(/\.\{ext\}$/,"").replace(/\.(?:jpe?g|png|gif|webp|avif|webm|mp4|zip)$/i,"").replace(/\{([a-zA-Z]+)\}/g,(a,r)=>r in t?to(String(t[r]??"")):"");return`${Jt(i)}.${t.ext}`}function to(e){return e?g(e):""}function oo(e){const t=e&&typeof e=="object"&&"error"in e?String(e.error||""):String(e||"");return/cancel|abort|not_succeeded/i.test(t)}function E(e,t){e&&(e.classList.toggle("dmh-download-loading",t),t?e.setAttribute("aria-busy","true"):e.removeAttribute("aria-busy"))}function io(e){try{return new URL(e).pathname.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase()||""}catch{return e.match(/\.([a-z0-9]+)(?:\?|#|$)/i)?.[1]?.toLowerCase()||""}}function no(e){return e.replace(/\.[^.]+$/,"")}function ao(e){try{return H(new URL(e))}catch{return decodeURIComponent(e.split("?")[0]?.split("/").filter(Boolean).pop()||"")}}function H(e){return decodeURIComponent(e.pathname.split("/").filter(Boolean).pop()||"")}function ro(e,t){if(e?.hostname.toLowerCase().includes("pixiv.net")){const o=e.pathname.match(/\/(?:en\/)?artworks\/(\d+)/)?.[1],i=H(e).match(/^(\d+)_p\d+/)?.[1];return o||i||""}return t.match(/(\d+)_p\d+/)?.[1]||""}function so(e){const t=e.hostname.toLowerCase();return t==="fanbox.cc"||t.endsWith(".fanbox.cc")||t.includes("pixiv.net")}function lo(e){const t=e.hostname.toLowerCase();return t.endsWith(".fanbox.cc")&&t!=="www.fanbox.cc"?t.split(".")[0]||"":e.searchParams.get("creatorId")||""}function co(e){return e.pathname.match(/\/posts\/(\d+)/)?.[1]||""}function de(e){const t=e.hostname.toLowerCase();return t==="fantia.jp"||t.endsWith(".fantia.jp")}function le(e){return e.pathname.match(/\/posts\/(\d+)/)?.[1]||e.pathname.match(/\/uploads\/post\/file\/(\d+)\//)?.[1]||""}function ce(e){const t=e.hostname.toLowerCase();return t==="patreon.com"||t.endsWith(".patreon.com")||t.endsWith("patreonusercontent.com")}function he(e){return e.pathname.match(/\/posts\/(\d+)/)?.[1]||e.pathname.match(/\/post\/(\d+)\//)?.[1]||""}function ho(e){const t=e.hostname.toLowerCase();return t==="weibo.com"||t==="www.weibo.com"||t.endsWith(".weibo.com")}function po(e){return e.pathname.split("/").filter(Boolean)[0]||""}function mo(e){return e.pathname.split("/").filter(Boolean)[1]||""}function uo(e){const t=e.hostname.toLowerCase();return t==="x.com"||t==="twitter.com"||t.endsWith(".twitter.com")||t.endsWith(".x.com")}function go(e){return e.pathname.match(/\/status(?:es)?\/(\d+)/)?.[1]||""}function fo(e){const t=e.hostname.toLowerCase();return t==="bilibili.com"||t.endsWith(".bilibili.com")||t==="b23.tv"}function bo(e){const t=e.pathname;return t.match(/\/video\/(BV[a-zA-Z0-9]+)/)?.[1]||t.match(/\/video\/av(\d+)/i)?.[1]||t.match(/\/opus\/(\d+)/)?.[1]||t.match(/\/dynamic\/(\d+)/)?.[1]||t.match(/\/read\/cv(\d+)/i)?.[1]||""}function pe(e){return(e.pathname.split("/").filter(Boolean).map(decodeURIComponent).at(-1)||e.hostname).replace(/\.[^.]+$/,"")}function wo(e,t){const o=[`<a class="dmh-info-pill dmh-pill-id" href="${f(e.adapter.getPostUrl(t.id,e.tags))}" target="_blank" rel="noreferrer">#${b(t.id)}</a>`],i={artist:"画师",copyright:"版权",character:"角色"};for(const n of["artist","copyright","character"])for(const a of t.tagGroups[n]){const r=e.translations.translate(a),s=`[ ${i[n]} ] ${a}${r?` [ ${r} ]`:""}`;o.push(`<a class="dmh-info-pill dmh-pill-${f(n)}" data-viewer-tag="${f(a)}" href="${f(Se(e.adapter,a,e.tagClickBehavior))}" target="_blank" rel="noreferrer">${b(s)}</a>`)}return o.join("")}function Be(e,t,o=!1){const i=t;e.viewerTagsOpen!==i&&(e.viewerTagsOpen=i,Lt(i));const n=p("dmh-viewer-tags-panel");n&&(n.hidden=!e.viewerTagsOpen);const a=p("dmh-viewer-tags-toggle");a?.setAttribute("aria-expanded",String(e.viewerTagsOpen)),a&&(a.textContent=e.viewerTagsOpen?"隐藏标签":"显示标签"),o&&p("dmh-viewer-tags-toggle")?.focus()}function vo(e){const t=e.posts[e.viewerIndex],o=p("dmh-viewer-tags"),i=p("dmh-viewer-tags-list");if(!o||!i)return;const n=t?Ut(t):[];if(o.hidden=!n.length,Be(e,e.viewerTagsOpen),t){const r=p("dmh-viewer-info");r&&(r.innerHTML=wo(e,t))}i.innerHTML=n.map(r=>{const s=e.translations.translate(r);return`<a class="dmh-info-pill dmh-pill-id" data-viewer-tag="${f(r)}" href="${f(Se(e.adapter,r,e.tagClickBehavior))}" target="_blank" rel="noreferrer">${b(r)}${s?` [ ${b(s)} ]`:""}</a>`}).join(""),i.scrollTop=0;const a=p("dmh-viewer-tags-toggle");a&&(a.textContent=e.viewerTagsOpen?"隐藏标签":"显示标签")}function xo(e){return e.trim()?"":"模板不能为空"}function yo(e){window.addEventListener("keydown",t=>Ft(e,t))}const u={search:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search-icon lucide-search"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>',hot:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M4.89054 17.272L4.89277 17.2742C6.49674 18.8782 8.66472 19.7888 10.9624 19.7888C13.2503 19.7888 15.2113 19.0539 16.6107 17.6108L16.6128 17.6086C18.0002 16.1345 18.7835 14.182 18.7421 12.1819C18.7852 11.3835 18.6916 9.36321 17.4088 6.75488L17.4082 6.7537C17.209 6.35523 16.8163 6.06598 16.3391 5.96993C15.8904 5.87103 15.4021 6.01997 15.061 6.35741C14.9094 6.48781 14.7796 6.61755 14.6655 6.7317L14.6329 6.76426C14.2107 3.35588 12.6083 1.7368 11.1654 1.00465C11.148 0.987812 11.1036 0.950782 10.9694 0.888912C10.2276 0.608301 9.41043 1.01168 9.1237 1.77629L9.12314 1.7778C8.50566 3.46558 7.35287 4.62281 6.16627 5.76704C4.51756 7.33121 2.75938 9.03623 2.80163 12.093C2.75906 14.055 3.54464 15.8826 4.89054 17.272ZM10.9306 17.7376C12.4802 17.8192 13.9509 17.2497 15.0989 16.1856C16.1154 15.1261 16.6483 13.655 16.6483 12.1785V12.1362C16.6483 10.8624 16.3969 9.6266 15.8955 8.49474C15.2436 9.11663 14.7845 9.49093 14.4179 9.68717C14.2122 9.79725 14.0268 9.85633 13.846 9.86789C13.6644 9.8795 13.5028 9.84219 13.3473 9.78249C12.9207 9.62211 12.6679 9.20129 12.6679 8.74864C12.6889 7.69735 12.6046 6.55594 12.2954 5.53554C12.01 4.59379 11.5372 3.76766 10.7904 3.20655C9.96581 4.94926 8.72521 6.18561 7.58695 7.28323L7.50836 7.35967C5.97191 8.85397 4.81321 9.98087 4.85306 12.1325L4.85309 12.1362C4.85309 13.5239 5.38326 14.8277 6.36125 15.8057L6.36363 15.8082C7.55387 17.0394 9.19573 17.7374 10.9201 17.7374H10.9306Z" fill="currentColor"/></svg>',favoriteStar:'<svg xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 20 21" fill="none" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M11.0505 3.16759L12.7915 6.69573C12.954 7.02647 13.2702 7.25612 13.6349 7.30949L17.5294 7.87474C18.448 8.00817 18.8159 9.13785 18.1504 9.78639L15.3331 12.5334C15.0686 12.7905 14.9481 13.1609 15.0104 13.5256L15.6759 17.4031C15.8328 18.3184 14.8721 19.0171 14.0497 18.5845L10.5661 16.7537C10.2402 16.5823 9.85042 16.5823 9.52373 16.7537L6.04087 18.5845C5.21848 19.0171 4.2578 18.3184 4.41468 17.4031L5.07939 13.5256C5.14166 13.1609 5.02198 12.7905 4.75755 12.5334L1.9394 9.78639C1.27469 9.13785 1.64182 8.00817 2.56126 7.87474L6.4549 7.30949C6.82041 7.25612 7.13578 7.02647 7.29832 6.69573L9.04015 3.16759C9.45095 2.33468 10.6389 2.33468 11.0505 3.16759Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M11.603 11.8739C11.413 12.5556 10.7871 13.0554 10.0447 13.0554C9.29592 13.0554 8.66679 12.5467 8.48242 11.8569" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',exit:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-arrow-right-exit-icon lucide-square-arrow-right-exit"><path d="M10 12h11"/><path d="m17 16 4-4-4-4"/><path d="M21 6.344V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-1.344"/></svg>',heart:'<svg viewBox="0 0 32 32" width="32" height="32"><path d="M21,5.5 C24.8659932,5.5 28,8.63400675 28,12.5 C28,18.2694439 24.2975093,23.1517313 17.2206059,27.1100183 C16.4622493,27.5342993 15.5379984,27.5343235 14.779626,27.110148 C7.70250208,23.1517462 4,18.2694529 4,12.5 C4,8.63400691 7.13400681,5.5 11,5.5 C12.829814,5.5 14.6210123,6.4144028 16,7.8282366 C17.3789877,6.4144028 19.170186,5.5 21,5.5 Z"></path><path d="M16,11.3317089 C15.0857201,9.28334665 13.0491506,7.5 11,7.5 C8.23857625,7.5 6,9.73857647 6,12.5 C6,17.4386065 9.2519779,21.7268174 15.7559337,25.3646328 C15.9076021,25.4494645 16.092439,25.4494644 16.2441073,25.3646326 C22.7480325,21.7268037 26,17.4385986 26,12.5 C26,9.73857625 23.7614237,7.5 21,7.5 C18.9508494,7.5 16.9142799,9.28334665 16,11.3317089 Z"></path></svg>',zoom:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-hidden="true"><path d="M15.5,14L20.5,19L19,20.5L14,15.5V14.71L13.73,14.43C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.43,13.73L14.71,14H15.5M9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14M12,10H10V12H9V10H7V9H9V7H10V9H12V10Z"></path></svg>',info:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>',download:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download-icon lucide-download"><path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/></svg>',settings:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-hidden="true" class="v-icon__svg" style="font-size: 22px; height: 22px; width: 22px;"><path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"></path></svg>',github:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-hidden="true"><path d="M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.87 8.35 6.84 9.71.5.1.68-.22.68-.49 0-.24-.01-1.05-.01-1.91-2.78.62-3.37-1.21-3.37-1.21-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.36-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.35 9.35 0 0 1 12 6.95c.85 0 1.71.12 2.51.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.59.69.49A10.24 10.24 0 0 0 22 12.23C22 6.58 17.52 2 12 2Z"></path></svg>',external:'<svg role="img" aria-hidden="true" viewBox="0 0 24 24"><path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z"></path></svg>',close:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-hidden="true"><path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"></path></svg>',prev:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-hidden="true"><path d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z"></path></svg>',next:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-hidden="true"><path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"></path></svg>',arrowUp:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>'};function ko(e,t,o,i){const n=document.getElementById("dmh-grid");if(!n)return;const a=document.createDocumentFragment();t.forEach((r,s)=>{const c=o+s,h=document.createElement("article");h.className="dmh-card",h.dataset.id=r.id,h.dataset.index=String(c),h.innerHTML=`
      <img loading="lazy" alt="" src="${f(Ae(r))}">
      <div class="dmh-card-error" hidden>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10,6 C10,4.8954305 10.8954305,4 12,4 C13.1045695,4 14,4.8954305 14,6 L14,12.5 C14,13.6045695 13.1045695,14.5 12,14.5 C10.8954305,14.5 10,13.6045695 10,12.5 L10,6 Z M12,20 C10.7573593,20 9.75,18.9926407 9.75,17.75 C9.75,16.5073593 10.7573593,15.5 12,15.5 C13.2426407,15.5 14.25,16.5073593 14.25,17.75 C14.25,18.9926407 13.2426407,20 12,20 Z"></path></svg>
        <span>加载失败</span>
      </div>
      ${r.isVideo?'<div class="dmh-video-badge">video</div>':""}
      <div class="dmh-card-meta">
        <span>#${b(r.id)}</span>
        <span>${b(r.width)} x ${b(r.height)}</span>
      </div>
      <div class="dmh-card-actions">
        <button class="dmh-card-action dmh-card-source-button" type="button" data-card-action="source" aria-label="打开来源">${u.external}</button>
        <button class="dmh-card-action dmh-card-download-button" type="button" data-card-action="download" aria-label="下载原图">${u.download}</button>
      </div>
    `,h.addEventListener("click",()=>i(c)),h.querySelector(".dmh-card-actions")?.addEventListener("click",d=>{d.stopPropagation();const m=d.target.closest("button[data-card-action]");if(m){if(m.dataset.cardAction==="download"){jt(r,m,e.downloadFilenameTemplates);return}m.dataset.cardAction==="source"&&r.source&&ze(r.source)}}),h.querySelector("img")?.addEventListener("load",d=>{const m=d.currentTarget;h.querySelector(".dmh-card-error")?.setAttribute("hidden",""),!r.width&&m.naturalWidth&&(r.width=m.naturalWidth,r.height=m.naturalHeight,r.aspectRatio=r.width/r.height,at(e))}),h.querySelector("img")?.addEventListener("error",d=>{const m=d.currentTarget;m.hidden=!0,h.querySelector(".dmh-card-error")?.removeAttribute("hidden")}),a.appendChild(h)}),n.appendChild(a)}function Lo(e,t,o){return!e||o||!t.trim()?"":`ordfav:${t.trim().replace(/\s+/g,"_")}`}function Co(e){document.title="Danbooru Masonry";const t=!!(e.blacklistAvailable&&document.body.dataset.currentUserId&&document.body.dataset.currentUserIsAnonymous!=="true"),o=!!Lo(document.body.dataset.currentUserId||"",document.body.dataset.currentUserName||"",document.body.dataset.currentUserIsAnonymous==="true"),i=z.find(r=>r.value===e.cardWidth)?.key||"medium",n=z.map(r=>`<option value="${r.key}"${r.value===e.cardWidth?" selected":""}>${r.label}</option>`).join(""),a=K.map(r=>`
              <label class="dmh-download-template-row" for="dmh-download-template-${r.key}">
                <span class="dmh-download-template-heading">
                  <span class="dmh-download-template-label">${r.label}</span>
                  <span class="dmh-setting-help dmh-download-preview" id="dmh-download-preview-${r.key}"></span>
                </span>
                <input class="dmh-download-template-input" id="dmh-download-template-${r.key}" type="text" data-download-template="${r.key}" value="${f(e.downloadFilenameTemplates[r.key])}" aria-describedby="dmh-download-preview-${r.key}">
              </label>`).join("");document.body.innerHTML=`
    <div id="dmh-app" data-card-size="${i}" data-show-thumbnail-info="${e.showThumbnailInfo}" data-show-thumbnail-buttons="${e.showThumbnailButtons}">
      <header class="dmh-topbar" id="dmh-topbar">
        <div class="dmh-toolbar-content">
          <div class="dmh-brand">
            <button class="dmh-title" id="dmh-title-exit" type="button" aria-label="退出瀑布流">danbooru</button>
            <div class="dmh-page-group">
              <span class="dmh-page-label">页码</span>
              <label class="dmh-page-control" title="页码" aria-label="页码">
                <input class="dmh-page-input" id="dmh-page" type="text" inputmode="numeric" pattern="[0-9]*" size="1" value="${e.page}">
              </label>
            </div>
          </div>
          <div class="dmh-search">
            <form class="dmh-search-form" id="dmh-search">
              <input id="dmh-tags" type="search" autocomplete="off" placeholder="搜索标签" value="${f(e.tags)}">
              <button class="dmh-button dmh-icon-button" type="submit" data-dmh-tooltip="搜索" aria-label="搜索">${u.search}</button>
              <button class="dmh-button dmh-icon-button dmh-hot-button" id="dmh-hot-search" type="button" data-dmh-tooltip="热门" aria-label="热门">${u.hot}</button>
              <button class="dmh-button dmh-icon-button" id="dmh-favorites-search" type="button" data-dmh-tooltip="${o?"我的收藏":"登录后可查看收藏"}" aria-label="我的收藏" ${o?"":"disabled"}>${u.favoriteStar}</button>
              <div class="dmh-ac" id="dmh-ac"></div>
            </form>
          </div>
          <div class="dmh-toolbar-actions">
            <div class="dmh-status" id="dmh-status">已加载 0 张</div>
            <button class="dmh-settings-button dmh-icon-button" id="dmh-settings-toggle" type="button" data-dmh-tooltip="设置" aria-label="设置" aria-expanded="false" aria-controls="dmh-settings-panel">${u.settings}</button>
            <button class="dmh-exit-button dmh-icon-button" id="dmh-exit" type="button" data-dmh-tooltip="退出瀑布流" aria-label="退出瀑布流">${u.exit}</button>
          </div>
        </div>
        <div class="dmh-loading-progress" id="dmh-loading-progress" role="progressbar" aria-label="正在加载瀑布流" aria-hidden="true" hidden>
          <div class="dmh-loading-progress-bar"></div>
        </div>
      </header>
      <main class="dmh-grid" id="dmh-grid"></main>
      <div class="dmh-message" id="dmh-message"></div>
      <div class="dmh-scrollbar" id="dmh-scrollbar" role="scrollbar" aria-label="瀑布流滚动位置" aria-controls="dmh-grid" aria-orientation="vertical" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" tabindex="0">
        <div class="dmh-scrollbar-thumb" id="dmh-scrollbar-thumb"></div>
      </div>
      <button class="dmh-back-to-top" id="dmh-back-to-top" type="button" aria-label="回到顶部" title="回到顶部">${u.arrowUp}</button>
      <div class="dmh-settings-overlay" id="dmh-settings-overlay" aria-hidden="true"></div>
      <aside class="dmh-settings-panel" id="dmh-settings-panel" role="dialog" aria-modal="true" aria-labelledby="dmh-settings-title" aria-hidden="true">
        <div class="dmh-settings-header">
          <h2 id="dmh-settings-title">设置</h2>
          <button class="dmh-settings-close" id="dmh-settings-close" type="button" aria-label="关闭设置">${u.close}</button>
        </div>
        <div class="dmh-settings-content">
          <h3 class="dmh-settings-group-title">瀑布流</h3>
          <section class="dmh-setting-section">
            <div class="dmh-setting-row">
              <span class="dmh-setting-copy"><span class="dmh-setting-label">自动进入瀑布流</span><span class="dmh-setting-help">打开原站图片列表页时自动使用瀑布流浏览</span></span>
              <label class="dmh-setting-switch" aria-label="自动进入瀑布流">
                <input id="dmh-auto-enter-masonry" type="checkbox" ${e.autoEnterMasonry?"checked":""}>
                <span class="dmh-setting-switch-track" aria-hidden="true"></span>
              </label>
            </div>
          </section>
          <section class="dmh-setting-section">
            <label class="dmh-setting-row" for="dmh-card-size">
              <span class="dmh-setting-copy"><span class="dmh-setting-label">缩略图大小</span><span class="dmh-setting-help">调整列表中图片卡片的宽度</span></span>
              <select class="dmh-setting-select" id="dmh-card-size">
${n}
              </select>
            </label>
          </section>
          <section class="dmh-setting-section">
            <div class="dmh-setting-row">
              <span class="dmh-setting-copy"><span class="dmh-setting-label">显示 NSFW</span><span class="dmh-setting-help">包含敏感、限制级内容</span></span>
              <label class="dmh-setting-switch" aria-label="显示 NSFW">
                <input id="dmh-show-nsfw" type="checkbox" ${e.hideNsfw?"":"checked"}>
                <span class="dmh-setting-switch-track" aria-hidden="true"></span>
              </label>
            </div>
          </section>
          <section class="dmh-setting-section">
            <div class="dmh-setting-row">
              <span class="dmh-setting-copy"><span class="dmh-setting-label">显示缩略图操作按钮</span><span class="dmh-setting-help">在图片卡片上显示收藏和下载按钮</span></span>
              <label class="dmh-setting-switch" aria-label="显示缩略图操作按钮">
                <input id="dmh-show-thumbnail-buttons" type="checkbox" ${e.showThumbnailButtons?"checked":""}>
                <span class="dmh-setting-switch-track" aria-hidden="true"></span>
              </label>
            </div>
          </section>
          <section class="dmh-setting-section">
            <div class="dmh-setting-row">
              <span class="dmh-setting-copy"><span class="dmh-setting-label">显示缩略图信息</span><span class="dmh-setting-help">在图片卡片上显示作品信息</span></span>
              <label class="dmh-setting-switch" aria-label="显示缩略图信息">
                <input id="dmh-show-thumbnail-info" type="checkbox" ${e.showThumbnailInfo?"checked":""}>
                <span class="dmh-setting-switch-track" aria-hidden="true"></span>
              </label>
            </div>
          </section>
          <section class="dmh-setting-section">
            <div class="dmh-setting-row">
              <span class="dmh-setting-copy"><span class="dmh-setting-label">显示瀑布流滚动条</span><span class="dmh-setting-help">在页面右侧显示滚动条</span></span>
              <label class="dmh-setting-switch" aria-label="显示瀑布流滚动条">
                <input id="dmh-show-scrollbar" type="checkbox" ${e.showScrollbar?"checked":""}>
                <span class="dmh-setting-switch-track" aria-hidden="true"></span>
              </label>
            </div>
          </section>
          <h3 class="dmh-settings-group-title">详情页</h3>
          <section class="dmh-setting-section">
            <div class="dmh-setting-row">
              <span class="dmh-setting-copy"><span class="dmh-setting-label">使用滚轮切换图片</span><span class="dmh-setting-help">在详情查看器中滚动切换上一张或下一张</span></span>
              <label class="dmh-setting-switch" aria-label="使用滚轮切换图片">
                <input id="dmh-viewer-wheel-navigation" type="checkbox" ${e.viewerWheelNavigation?"checked":""}>
                <span class="dmh-setting-switch-track" aria-hidden="true"></span>
              </label>
            </div>
          </section>
          <section class="dmh-setting-section">
            <div class="dmh-setting-row">
              <span class="dmh-setting-copy"><span class="dmh-setting-label">加载原图</span><span class="dmh-setting-help">打开详情页时直接加载高质量原图</span></span>
              <label class="dmh-setting-switch" aria-label="加载原图">
                <input id="dmh-viewer-use-original" type="checkbox" ${e.viewerUseOriginal?"checked":""}>
                <span class="dmh-setting-switch-track" aria-hidden="true"></span>
              </label>
            </div>
          </section>
          <section class="dmh-setting-section">
            <label class="dmh-setting-row" for="dmh-viewer-preload-count">
              <span class="dmh-setting-copy"><span class="dmh-setting-label">预加载数量</span><span class="dmh-setting-help">提前加载后续图片；设为 0 可关闭</span></span>
              <select class="dmh-setting-select" id="dmh-viewer-preload-count">
                ${[0,1,2,3,4,5].map(r=>`<option value="${r}" ${e.viewerPreloadCount===r?"selected":""}>${r===0?"0（关闭）":r}</option>`).join("")}
              </select>
            </label>
          </section>
          <section class="dmh-setting-section">
            <div class="dmh-setting-row">
              <label class="dmh-setting-copy" for="dmh-tag-click-behavior"><span class="dmh-setting-label">标签点击行为</span><span class="dmh-setting-help">选择点击详情标签后的搜索方式</span></label>
              <select class="dmh-setting-select dmh-tag-click-select" id="dmh-tag-click-behavior">
                ${[["masonry-current-tab","当前页瀑布流搜索"],["masonry-new-tab","新标签页瀑布流搜索"]].map(([r,s])=>`<option value="${r}"${e.tagClickBehavior===r?" selected":""}>${s}</option>`).join("")}
              </select>
            </div>
          </section>
          <h3 class="dmh-settings-group-title">其他</h3>
          <button class="dmh-setting-editor-button" id="dmh-blacklist-editor-open" type="button" aria-haspopup="dialog" aria-controls="dmh-blacklist-editor"><span class="dmh-setting-copy"><span>Danbooru 黑名单规则</span><span class="dmh-setting-help">编辑用于过滤图片的原站规则</span></span><span aria-hidden="true">›</span></button>
          <button class="dmh-setting-editor-button" id="dmh-download-editor-open" type="button" aria-haspopup="dialog" aria-controls="dmh-download-editor"><span class="dmh-setting-copy"><span>下载文件名模板</span><span class="dmh-setting-help">按图片来源自定义下载文件名</span></span><span aria-hidden="true">›</span></button>
        </div>
        <div class="dmh-settings-footer">
          <a class="dmh-settings-github" href="https://github.com/kano0222/danbooru-masonry" target="_blank" rel="noreferrer" aria-label="打开 GitHub 仓库" title="GitHub">${u.github}</a>
        </div>
      </aside>
      <dialog class="dmh-settings-editor" id="dmh-blacklist-editor" aria-labelledby="dmh-blacklist-editor-title">
        <div class="dmh-settings-header">
          <h2 id="dmh-blacklist-editor-title">Danbooru 黑名单规则</h2>
          <button class="dmh-settings-close" id="dmh-blacklist-editor-close" type="button" aria-label="关闭Danbooru 黑名单规则" autofocus>${u.close}</button>
        </div>
        <div class="dmh-settings-editor-content">
          <section class="dmh-setting-section">
            <div class="dmh-setting-stack">
              <textarea class="dmh-blacklist-rules" id="dmh-blacklist-rules" aria-labelledby="dmh-blacklist-editor-title" rows="7" spellcheck="false" ${t?"":"readonly"}>${b(e.blacklistText)}</textarea>
              <div class="dmh-template-help">每行一条规则，关闭窗口或取消会放弃未保存修改。</div>
              <div class="dmh-blacklist-actions">
                <span class="dmh-blacklist-status" id="dmh-blacklist-status" role="status">${e.blacklistAvailable?t?"":"登录 Danbooru 后可修改":"未能读取原站黑名单，请刷新原站后重试"}</span>
                <div class="dmh-blacklist-buttons">
                  <button class="dmh-template-reset" id="dmh-blacklist-cancel" type="button">取消</button>
                  <button class="dmh-blacklist-save" id="dmh-blacklist-save" type="button" ${t?"":"disabled"}>保存</button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </dialog>
      <dialog class="dmh-settings-editor" id="dmh-download-editor" aria-labelledby="dmh-download-editor-title">
        <div class="dmh-settings-header">
          <h2 id="dmh-download-editor-title">下载文件名模板</h2>
          <button class="dmh-settings-close" id="dmh-download-editor-close" type="button" aria-label="关闭下载文件名模板" autofocus>${u.close}</button>
        </div>
        <div class="dmh-settings-editor-content">
          <section class="dmh-setting-section">
            <div class="dmh-setting-stack">
              <div class="dmh-download-template-list">
${a}
              </div>
              <div class="dmh-template-help">
                <div><code>{original}</code> 原文件名，不含后缀</div>
                <div><code>{artist}</code> Danbooru 画师标签</div>
                <div><code>{username}</code> 来源 URL 可解析到的用户名，缺失时回退到画师标签</div>
                <div><code>{userid}</code> 来源 URL 可解析到的用户 ID</div>
                <div><code>{id}</code> 来源作品 ID，缺失时回退到 Danbooru ID</div>
                <div><code>{postid}</code> Danbooru ID</div>
                <div>关闭窗口或取消会放弃未保存修改。</div>
              </div>
              <div class="dmh-download-template-actions">
                <span class="dmh-download-template-status" id="dmh-download-template-status" role="status" aria-live="polite"></span>
                <div class="dmh-download-template-buttons">
                  <button class="dmh-template-reset" id="dmh-download-template-reset" type="button">恢复默认</button>
                  <button class="dmh-template-reset" id="dmh-download-cancel" type="button">取消</button>
                  <button class="dmh-blacklist-save" id="dmh-download-save" type="button">保存</button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </dialog>
      <div class="dmh-viewer" id="dmh-viewer" aria-hidden="true">
        <div class="dmh-viewer-tags" id="dmh-viewer-tags" hidden>
          <section class="dmh-viewer-tags-panel" id="dmh-viewer-tags-panel" aria-label="图片标签" hidden>
            <div class="dmh-viewer-tags-list" id="dmh-viewer-tags-list"></div>
          </section>
          <button class="dmh-info-pill dmh-pill-id" id="dmh-viewer-tags-toggle" type="button" aria-expanded="false" aria-controls="dmh-viewer-tags-panel">显示标签</button>
        </div>
        <div class="dmh-viewer-info" id="dmh-viewer-info"></div>
        <div class="dmh-viewer-actions">
          <button class="dmh-viewer-button" id="dmh-open-source" type="button" data-dmh-tooltip="来源" aria-label="来源">${u.external}</button>
          <button class="dmh-viewer-button" id="dmh-favorite" type="button" data-dmh-tooltip="收藏" aria-label="收藏">${u.heart}</button>
          <button class="dmh-viewer-button" id="dmh-zoom-toggle" type="button" data-dmh-tooltip="查看大图" aria-label="查看大图">${u.zoom}</button>
          <button class="dmh-viewer-button" id="dmh-open-post" type="button" data-dmh-tooltip="详情" aria-label="详情">${u.info}</button>
          <button class="dmh-viewer-button" id="dmh-download" type="button" data-dmh-tooltip="下载原图" aria-label="下载原图">${u.download}</button>
          <button class="dmh-viewer-button" id="dmh-close" type="button" data-dmh-tooltip="关闭" aria-label="关闭">${u.close}</button>
        </div>
        <button class="dmh-viewer-nav dmh-viewer-prev" id="dmh-prev" type="button" aria-label="上一张">${u.prev}</button>
        <button class="dmh-viewer-nav dmh-viewer-next" id="dmh-next" type="button" aria-label="下一张">${u.next}</button>
        <img id="dmh-viewer-img" alt="" draggable="true">
        <video id="dmh-viewer-video" controls autoplay loop playsinline hidden></video>
        <div class="img_detail_loading" id="dmh-viewer-loading" hidden aria-hidden="true">
          <div class="v-progress-circular" id="dmh-viewer-progress" role="status" aria-label="正在加载图片"></div>
          <div class="dmh-viewer-error" id="dmh-viewer-error" hidden>
            <div class="sc-13hg6mj-1 bsMYYv">
              <svg viewBox="0 0 24 24" size="72" class="sc-11csm01-0 fieitW"><path d="M10,6 C10,4.8954305 10.8954305,4 12,4 C13.1045695,4 14,4.8954305 14,6 L14,12.5 C14,13.6045695 13.1045695,14.5 12,14.5 C10.8954305,14.5 10,13.6045695 10,12.5 L10,6 Z M12,20 C10.7573593,20 9.75,18.9926407 9.75,17.75 C9.75,16.5073593 10.7573593,15.5 12,15.5 C13.2426407,15.5 14.25,16.5073593 14.25,17.75 C14.25,18.9926407 13.2426407,20 12,20 Z" transform=""></path></svg>
            </div>
            <h1>加载失败</h1>
          </div>
        </div>
      </div>
      <div class="dmh-snackbar" id="dmh-snackbar" role="status" aria-live="polite"></div>
    </div>
  `}function _o(){if(document.getElementById("dmh-style"))return;const e=document.createElement("style");e.id="dmh-style",e.textContent=`
    * { box-sizing: border-box; }
    html, body { margin: 0; min-height: 100%; scrollbar-width: none; background: #f6f7f9; color: #1f2328; font-family: Arial, "Helvetica Neue", sans-serif; }
    html { overflow-x: hidden; }
    body { overflow-x: clip; }
    html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; width: 0; height: 0; }
    html.dmh-no-scroll { overflow: hidden; }
    #dmh-app { min-height: 100vh; }
    .dmh-topbar { position: fixed; top: 0; left: 0; right: 0; z-index: 10; min-height: 56px; background: rgba(255,255,255,.94); border-bottom: 1px solid #d8dee4; backdrop-filter: blur(10px); overflow: visible; }
    .dmh-loading-progress { position: absolute; right: 0; bottom: -1px; left: 0; height: 3px; overflow: hidden; background: rgba(9,105,218,.14); pointer-events: none; }
    .dmh-loading-progress[hidden] { display: none; }
    .dmh-loading-progress-bar { width: 42%; height: 100%; background: #0969da; transform: translateX(-110%); animation: dmh-loading-progress 1.15s ease-in-out infinite; }
    @keyframes dmh-loading-progress { 0% { transform: translateX(-110%); } 55% { transform: translateX(135%); } 100% { transform: translateX(265%); } }
    .dmh-toolbar-content { display: grid; grid-template-columns: minmax(0, 1fr) minmax(180px, 496px) minmax(0, 1fr); align-items: center; gap: 12px; width: 100%; min-width: 0; min-height: 56px; padding: 10px 16px; overflow: visible; white-space: nowrap; }
    .dmh-brand { display: flex; align-items: center; justify-self: start; gap: 25px; min-width: 0; }
    #dmh-app .dmh-title, #dmh-app .dmh-title:hover, #dmh-app .dmh-title:active, #dmh-app .dmh-title:focus, #dmh-app .dmh-title:focus-visible { margin: -11px -12px; padding: 11px 12px; border: 0; border-radius: 0; outline: 0; background: transparent; color: inherit; box-shadow: none; font: inherit; font-size: 22px; font-weight: 700; line-height: 1; white-space: nowrap; cursor: pointer; appearance: none; -webkit-tap-highlight-color: transparent; user-select: none; }
    .dmh-search { display: block; justify-self: center; width: min(496px, 100%); min-width: 0; max-width: 496px; }
    .dmh-search-form { position: relative; display: grid; grid-template-columns: minmax(0, 1fr) repeat(3, 38px); align-items: center; gap: 8px; width: 100%; min-width: 0; }
    #dmh-app .dmh-search input { width: 100%; height: 36px; padding: 0 12px; border: 1px solid #afb8c1; border-radius: 6px; background: #fff; color: inherit; }
    .dmh-page-group { display: flex; align-items: center; gap: 6px; min-width: 0; color: #57606a; font-size: 12px; font-weight: 700; }
    .dmh-page-label { user-select: none; }
    .dmh-page-control { display: flex; align-items: center; justify-content: center; height: 28px; padding: 0; border: 1px solid #d0d7de; border-radius: 999px; background: #f6f8fa; color: #57606a; }
    .dmh-page-control:focus-within { border-color: #0969da; background: #fff; box-shadow: 0 0 0 3px rgba(9,105,218,.12); }
    .dmh-page-input { width: 42px; min-width: 42px; height: 26px; padding: 0; border: 0; border-radius: 0; background: transparent; color: #24292f; text-align: center; font-weight: 700; outline: 0; appearance: textfield; }
    .dmh-page-input::-webkit-inner-spin-button, .dmh-page-input::-webkit-outer-spin-button { margin: 0; appearance: none; }
    #dmh-app .dmh-search-form > button, #dmh-app .dmh-settings-button, #dmh-app .dmh-exit-button { height: 36px; padding: 0; border: 0; border-radius: 50%; background: transparent; color: #57606a; cursor: pointer; box-shadow: none; }
    #dmh-app .dmh-icon-button { display: inline-flex; align-items: center; justify-content: center; width: 38px; min-width: 38px; padding: 0; }
    .dmh-icon-button svg { width: 22px; height: 22px; fill: none; stroke: currentColor; }
    .dmh-hot-button svg { fill: currentColor; stroke: none; }
    .dmh-settings-button svg { fill: currentColor; stroke: none; }
    #dmh-app [data-dmh-tooltip] { position: relative; }
    #dmh-app [data-dmh-tooltip]::after { content: attr(data-dmh-tooltip); position: absolute; top: calc(100% + 8px); left: 50%; z-index: 200; max-width: min(520px, 90vw); padding: 6px 10px; border-radius: 4px; background: rgba(33,33,33,.95); color: #fff; font-size: 12px; font-weight: 500; line-height: 1.35; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; opacity: 0; pointer-events: none; transform: translate(-50%, -4px); transition: opacity .14s ease, transform .14s ease; }
    #dmh-app [data-dmh-tooltip]:hover::after, #dmh-app [data-dmh-tooltip]:focus-visible::after { opacity: 1; transform: translate(-50%, 0); }
    #dmh-app .dmh-search-form > button:hover, #dmh-app .dmh-settings-button:hover, #dmh-app .dmh-exit-button:hover { background: rgba(9,105,218,.08); color: #0969da; }
    #dmh-app .dmh-search-form > button:focus-visible, #dmh-app .dmh-settings-button:focus-visible, #dmh-app .dmh-exit-button:focus-visible { outline: 2px solid rgba(9,105,218,.38); outline-offset: 2px; }
    #dmh-app .dmh-search-form > button:disabled { color: #afb8c1; cursor: not-allowed; }
    #dmh-app .dmh-search-form > button:disabled:hover { background: transparent; color: #afb8c1; }
    .dmh-exit-button { flex: 0 0 auto; }
    .dmh-toolbar-actions { display: flex; align-items: center; justify-self: end; gap: 8px; min-width: 0; }
    .dmh-status { min-width: 112px; overflow: hidden; color: #57606a; font-size: 13px; text-align: right; text-overflow: ellipsis; white-space: nowrap; }
    .dmh-grid { position: relative; width: calc(100% - 32px); margin: 68px 16px 12px; overflow: hidden; }
    .dmh-layout { display: block; }
    .dmh-sidebar { display: none; }
    .dmh-scrollbar { position: fixed; right: 0; bottom: 8px; z-index: 8; width: 16px; min-height: 48px; border-radius: 999px; background: transparent; cursor: pointer; touch-action: none; user-select: none; }
    .dmh-scrollbar::before { content: ''; position: absolute; inset: 0 4px; border-radius: 999px; background: rgba(87,96,106,.18); transition: background .16s ease; }
    .dmh-scrollbar:hover::before, .dmh-scrollbar.dmh-dragging::before { background: rgba(87,96,106,.28); }
    .dmh-scrollbar[hidden] { display: none; }
    .dmh-scrollbar:focus-visible { outline: 2px solid rgba(9,105,218,.38); outline-offset: 2px; }
    .dmh-scrollbar-thumb { position: absolute; top: 0; left: 0; width: 16px; min-height: 36px; border-radius: 999px; background: transparent; will-change: transform; }
    .dmh-scrollbar-thumb::before { content: ''; position: absolute; inset: 0 4px; border-radius: 999px; background: rgba(87,96,106,.68); box-shadow: 0 1px 2px rgba(27,31,36,.15); transition: background .16s ease; }
    .dmh-scrollbar:hover .dmh-scrollbar-thumb::before, .dmh-scrollbar.dmh-dragging .dmh-scrollbar-thumb::before { background: #57606a; }
    #dmh-app .dmh-back-to-top { position: fixed; right: 22px; bottom: 20px; z-index: 9; display: inline-flex; align-items: center; justify-content: center; width: 42px; height: 42px; padding: 0; border: 1px solid #d0d7de; border-radius: 50%; background: rgba(255,255,255,.94); color: #57606a; cursor: pointer; box-shadow: 0 3px 12px rgba(27,31,36,.16); opacity: 0; visibility: hidden; pointer-events: none; transform: translateY(8px); transition: opacity .18s ease, visibility 0s linear .18s, transform .18s ease, background .16s ease, color .16s ease, border-color .16s ease; }
    #dmh-app .dmh-back-to-top[hidden] { display: none; }
    #dmh-app .dmh-back-to-top.dmh-visible { opacity: 1; visibility: visible; pointer-events: auto; transform: translateY(0); transition-delay: 0s; }
    #dmh-app .dmh-back-to-top:hover { border-color: #0969da; background: #eef6ff; color: #0969da; }
    #dmh-app .dmh-back-to-top:focus-visible { outline: 2px solid rgba(9,105,218,.38); outline-offset: 2px; }
    .dmh-back-to-top svg { width: 23px; height: 23px; }
    .dmh-card { position: absolute; width: ${_e}px; overflow: hidden; border-radius: 6px; background: #d8dee4; box-shadow: 0 1px 2px rgba(27,31,36,.12); transition: left .18s ease, top .18s ease, width .18s ease; }
    .dmh-card img { display: block; width: 100%; height: 100%; object-fit: cover; background: #d8dee4; pointer-events: none; }
    .dmh-card-error { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 12px; background: #f6f8fa; color: #57606a; text-align: center; }
    .dmh-card-error[hidden] { display: none; }
    .dmh-card-error svg { width: 42px; height: 42px; fill: currentColor; }
    .dmh-card-error span { font-size: 13px; font-weight: 700; color: #24292f; }
    .dmh-card-meta { position: absolute; left: 0; right: 0; top: 0; display: flex; justify-content: space-between; gap: 8px; padding: 5px 7px; color: #fff; font-size: 12px; background: linear-gradient(rgba(0,0,0,.68), transparent); opacity: 0; transform: translateY(-100%); transition: opacity .16s ease, transform .16s ease; }
    .dmh-card:hover .dmh-card-meta { opacity: 1; transform: translateY(0); }
    #dmh-app[data-show-thumbnail-info="true"] .dmh-card-meta { opacity: 1; transform: translateY(0); }
    .dmh-card-actions { position: absolute; left: 0; right: 0; bottom: 0; z-index: 2; display: flex; justify-content: space-between; opacity: 1; pointer-events: none; }
    #dmh-app[data-show-thumbnail-buttons="false"] .dmh-card-actions { display: none; }
    #dmh-app .dmh-card-actions .dmh-card-action { position: relative; display: inline-flex; align-items: center; justify-content: center; width: 35px; height: 35px; padding: 5px; border: 0; border-radius: 5px; background: #9ca3af !important; background-color: #9ca3af !important; backdrop-filter: blur(4px); color: #fff; cursor: pointer; box-shadow: none !important; filter: none; transform: none !important; transition: none !important; pointer-events: auto; }
    #dmh-app .dmh-card-actions .dmh-card-action:hover, #dmh-app .dmh-card-actions .dmh-card-action:active, #dmh-app .dmh-card-actions .dmh-card-action:focus, #dmh-app .dmh-card-actions .dmh-card-action:focus-visible { background: #9ca3af !important; background-color: #9ca3af !important; color: #fff; outline: 0; box-shadow: none !important; filter: none; transform: none !important; transition: none !important; }
    .dmh-card-actions .dmh-card-action svg { width: 25px; height: 25px; fill: currentColor; color: #fff; }
    .dmh-card-actions .dmh-card-action svg[fill="none"] { fill: none; }
    #dmh-app[data-card-size="small"] .dmh-card-actions .dmh-card-action { width: 30px; height: 30px; padding: 4px; }
    #dmh-app[data-card-size="small"] .dmh-card-actions .dmh-card-action svg { width: 22px; height: 22px; }
    #dmh-app[data-card-size="small"] .dmh-card-actions .dmh-card-action.dmh-download-loading::after { width: 14px; height: 14px; }
    #dmh-app[data-card-size="big"] .dmh-card-actions .dmh-card-action { width: 40px; height: 40px; padding: 6px; }
    #dmh-app[data-card-size="big"] .dmh-card-actions .dmh-card-action svg { width: 28px; height: 28px; }
    #dmh-app[data-card-size="big"] .dmh-card-actions .dmh-card-action.dmh-download-loading::after { width: 18px; height: 18px; }
    .dmh-card-action.dmh-favorited { color: rgb(255, 64, 96); }
    #dmh-app .dmh-card-actions .dmh-card-action.dmh-download-loading svg { opacity: 0; }
    #dmh-app .dmh-card-actions .dmh-card-action.dmh-download-loading::after { content: ''; position: absolute; width: 16px; height: 16px; border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%; animation: dmh-download-spin .75s linear infinite; }
    @keyframes dmh-download-spin { to { transform: rotate(360deg); } }
    .dmh-video-badge { position: absolute; top: 6px; right: 6px; padding: 2px 6px; color: #fff; font-size: 12px; border-radius: 4px; background: rgba(0,0,0,.62); }
    .dmh-message { padding: 24px; text-align: center; color: #57606a; }
    .dmh-settings-overlay { position: fixed; inset: 0; z-index: 300; background: rgba(31,35,40,.32); opacity: 0; pointer-events: none; transition: opacity .22s ease; }
    .dmh-settings-overlay.dmh-open { opacity: 1; pointer-events: auto; }
    .dmh-settings-panel { position: fixed; top: 50%; right: 12px; bottom: auto; z-index: 301; display: flex; flex-direction: column; height: fit-content; max-height: calc(100dvh - 24px); width: min(440px, calc(100vw - 32px)); padding: 0; border-left: 1px solid #d8dee4; background: #fff; box-shadow: -8px 0 24px rgba(27,31,36,.18); opacity: 0; pointer-events: none; transform: translate(100%, -50%); transition: transform .22s ease, opacity .22s ease; }
    .dmh-settings-panel.dmh-open { opacity: 1; pointer-events: auto; transform: translate(0, -50%); }
    .dmh-settings-header { display: flex; align-items: center; justify-content: space-between; min-height: 56px; flex: 0 0 auto; padding: 0 16px; border-bottom: 1px solid #d8dee4; }
    .dmh-settings-header h2 { margin: 0; font-size: 18px; font-weight: 700; line-height: 1; color: #24292f; }
    .dmh-settings-close { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; padding: 0; border: 0; border-radius: 50%; background: transparent; color: #57606a; cursor: pointer; }
    .dmh-settings-close:hover { background: rgba(9,105,218,.08); color: #0969da; }
    .dmh-settings-close:focus-visible { outline: 2px solid rgba(9,105,218,.38); outline-offset: 2px; }
    .dmh-settings-close svg { width: 22px; height: 22px; fill: currentColor; stroke: none; }
    .dmh-settings-content { display: flex; flex-direction: column; gap: 22px; min-height: 0; padding: 20px 18px; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: none; }
    .dmh-settings-content::-webkit-scrollbar { display: none; width: 0; height: 0; }
    .dmh-settings-footer { display: flex; flex: 0 0 auto; justify-content: center; padding: 10px 18px; border-top: 1px solid #d8dee4; }
    #dmh-app .dmh-settings-github { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; color: #57606a; text-decoration: none; }
    #dmh-app .dmh-settings-github:hover { background: rgba(9,105,218,.08); color: #0969da; }
    #dmh-app .dmh-settings-github:focus-visible { outline: 2px solid rgba(9,105,218,.38); outline-offset: 2px; }
    .dmh-settings-github svg { width: 22px; height: 22px; fill: currentColor; }
    #dmh-app .dmh-settings-editor { position: fixed; inset: 0; width: min(580px, calc(100vw - 32px)); max-width: none; height: fit-content; max-height: calc(100dvh - 32px); margin: auto; padding: 0; border: 1px solid #d8dee4; border-radius: 12px; background: #fff; color: #24292f; box-shadow: 0 16px 48px rgba(27,31,36,.24); overflow: hidden; }
    #dmh-app .dmh-settings-editor:not([open]) { display: none; }
    #dmh-app .dmh-settings-editor[open] { display: flex; flex-direction: column; }
    .dmh-settings-editor::backdrop { background: rgba(31,35,40,.4); }
    .dmh-settings-editor .dmh-settings-header { flex: 0 0 auto; }
    .dmh-settings-editor-content { min-height: 0; padding: 20px; overflow-y: auto; overscroll-behavior: contain; }
    #dmh-app .dmh-setting-editor-button { display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%; min-height: 42px; padding: 10px 12px; border: 1px solid #d0d7de; border-radius: 6px; background: #f6f8fa; color: #24292f; font: 700 13px Arial, sans-serif; cursor: pointer; box-shadow: none; }
    #dmh-app .dmh-setting-editor-button:hover { background: #eaeef2; }
    #dmh-app .dmh-setting-editor-button:focus-visible { outline: 2px solid #0969da; outline-offset: 2px; }
    .dmh-settings-group-title { margin: 2px 0 -10px; color: #57606a; font-size: 12px; font-weight: 700; line-height: 1.2; letter-spacing: .08em; }
    .dmh-blacklist-rules { box-sizing: border-box; width: 100%; min-height: 132px; resize: vertical; padding: 9px 10px; border: 1px solid #afb8c1; border-radius: 6px; background: #fff; color: #24292f; font: 13px/1.45 ui-monospace, SFMono-Regular, Consolas, monospace; }
    .dmh-blacklist-rules:focus { border-color: #0969da; outline: 2px solid rgba(9,105,218,.18); }
    .dmh-blacklist-rules[readonly] { background: #f6f8fa; color: #57606a; }
    .dmh-setting-help { color: #57606a; font-size: 12px; line-height: 1.45; }

    .dmh-blacklist-status { min-width: 0; color: #57606a; font-size: 12px; line-height: 1.35; }
    .dmh-blacklist-status.dmh-error { color: #cf222e; }
    #dmh-app .dmh-blacklist-save { flex: 0 0 auto; min-height: 32px; padding: 0 12px; border: 1px solid #0969da; border-radius: 6px; background: #0969da; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; box-shadow: none; transition: background .16s ease, border-color .16s ease; }
    #dmh-app .dmh-blacklist-save:hover { border-color: #075bbd; background: #075bbd; color: #fff; }
    #dmh-app .dmh-blacklist-save:active { border-color: #054da2; background: #054da2; }
    #dmh-app .dmh-blacklist-save:focus-visible { outline: 2px solid rgba(9,105,218,.38); outline-offset: 2px; }
    #dmh-app .dmh-blacklist-save:disabled, #dmh-app .dmh-blacklist-save:disabled:hover { border-color: #0969da; background: #0969da; color: #fff; opacity: .6; cursor: default; }
    .dmh-setting-section { display: flex; flex-direction: column; gap: 10px; }
    .dmh-setting-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; min-height: 36px; }
    .dmh-setting-copy { display: flex; flex: 1 1 auto; min-width: 0; flex-direction: column; gap: 3px; text-align: left; }
    .dmh-setting-copy .dmh-setting-help { overflow-wrap: anywhere; }
    .dmh-setting-stack { display: flex; flex-direction: column; gap: 10px; }
    .dmh-setting-label { color: #24292f; font-size: 13px; font-weight: 700; line-height: 1.3; }
    .dmh-setting-select { width: 148px; height: 34px; padding: 0 30px 0 10px; border: 1px solid #d0d7de; border-radius: 6px; background: #fff; color: #24292f; font: 700 13px Arial, "Helvetica Neue", sans-serif; outline: 0; cursor: pointer; }
    .dmh-setting-select option { font: 700 13px Arial, "Helvetica Neue", sans-serif; }
    .dmh-setting-select:focus-visible { border-color: #0969da; box-shadow: 0 0 0 3px rgba(9,105,218,.12); }
    .dmh-setting-select-full { width: 100%; }
    .dmh-tag-click-select { width: 210px; }
    .dmh-setting-switch { display: inline-flex; flex: 0 0 auto; align-items: center; width: 48px; height: 28px; cursor: pointer; }
    .dmh-setting-switch input { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }
    .dmh-setting-switch-track { position: relative; width: 48px; height: 28px; border-radius: 999px; background: #d0d7de; transition: background .18s ease, box-shadow .18s ease; }
    .dmh-setting-switch-track::after { content: ''; position: absolute; top: 3px; left: 3px; width: 22px; height: 22px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(27,31,36,.22); transition: transform .18s ease; }
    .dmh-setting-switch input:checked + .dmh-setting-switch-track { background: #0969da; }
    .dmh-setting-switch input:checked + .dmh-setting-switch-track::after { transform: translateX(20px); }
    .dmh-setting-switch input:focus-visible + .dmh-setting-switch-track { box-shadow: 0 0 0 3px rgba(9,105,218,.18); }
    .dmh-download-template-list { display: flex; flex-direction: column; gap: 10px; }
    .dmh-download-template-row { display: flex; flex-direction: column; gap: 5px; }
    .dmh-download-template-heading { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
    .dmh-download-template-heading .dmh-download-template-label { flex: 0 0 auto; }
    .dmh-download-preview { min-width: 0; overflow-wrap: anywhere; text-align: right; }

    .dmh-download-template-label { color: #57606a; font-size: 12px; font-weight: 700; line-height: 1.2; }
    .dmh-download-template-input { width: 100%; height: 34px; padding: 0 10px; border: 1px solid #d0d7de; border-radius: 6px; background: #fff; color: #24292f; font: 600 12px Consolas, "Courier New", monospace; outline: 0; }
    .dmh-download-template-input:focus { border-color: #0969da; box-shadow: 0 0 0 3px rgba(9,105,218,.12); }
    .dmh-download-template-input:invalid { border-color: #cf222e; }
    .dmh-template-help { display: flex; flex-direction: column; gap: 5px; padding: 10px 12px; border: 1px solid #d0d7de; border-radius: 6px; background: #f6f8fa; color: #57606a; font-size: 12px; line-height: 1.45; }
    .dmh-template-help code { color: #0969da; font: 700 12px Consolas, "Courier New", monospace; }
    .dmh-download-template-actions, .dmh-blacklist-actions { display: flex; align-items: center; justify-content: space-between; gap: 12px; font-size: 12px; }
    .dmh-download-template-actions > [role="status"], .dmh-blacklist-actions > [role="status"] { flex: 1; min-width: 0; overflow-wrap: anywhere; }
    .dmh-download-template-status { min-width: 0; color: #57606a; font-size: 12px; line-height: 1.35; }
    .dmh-download-template-buttons, .dmh-blacklist-buttons { display: flex; flex-shrink: 0; justify-content: flex-end; align-items: center; gap: 8px; }


    #dmh-app .dmh-template-reset { min-height: 32px; padding: 0 12px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; box-shadow: none; }
    #dmh-app .dmh-template-reset { border: 1px solid #d0d7de; background: #f6f8fa; color: #24292f; }
    #dmh-app .dmh-template-reset:hover { border-color: #afb8c1; background: #eaeef2; color: #24292f; }
    #dmh-app .dmh-template-reset:focus-visible { outline: 2px solid rgba(9,105,218,.38); outline-offset: 2px; }
    .dmh-snackbar { position: fixed; top: 72px; left: 50%; z-index: 220; max-width: min(520px, calc(100vw - 32px)); padding: 10px 18px; border-radius: 4px; background: #323232; color: #fff; font-size: 14px; line-height: 1.45; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; box-shadow: 0 6px 18px rgba(27,31,36,.22); opacity: 0; pointer-events: none; transform: translate(-50%, -12px); transition: opacity .18s ease, transform .18s ease; }
    .dmh-snackbar.dmh-open { opacity: 1; transform: translate(-50%, 0); }
    .dmh-ac { position: absolute; top: 42px; left: 0; z-index: 20; width: min(450px, 100%); max-height: 320px; overflow: auto; scrollbar-width: none; padding: 4px; border: 1px solid #d0d7de; border-radius: 8px; background: #fff; box-shadow: 0 8px 24px rgba(140,149,159,.32); opacity: 0; visibility: hidden; pointer-events: none; transform: translateY(-6px) scale(.98); transform-origin: top center; transition: opacity .16s ease, transform .16s ease, visibility 0s linear .16s; }
    .dmh-ac::-webkit-scrollbar { display: none; width: 0; height: 0; }
    .dmh-ac.dmh-open { opacity: 1; visibility: visible; pointer-events: auto; transform: translateY(0) scale(1); transition-delay: 0s; }
    .dmh-ac-item { display: flex; align-items: center; width: 100%; min-height: 32px; padding: 0 12px; border: 0; border-radius: 4px; background: transparent; color: inherit; text-align: left; cursor: pointer; }
    .dmh-ac-item:hover { background: #f6f8fa; box-shadow: none; }
    .dmh-ac-item.dmh-selected, .dmh-ac-item.dmh-selected:hover { background: #eef6ff; box-shadow: inset 3px 0 0 #0969da; }
    .dmh-ac-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 600; }
    .dmh-ac-artist { color: rgb(201, 112, 0); }
    .dmh-ac-copyright { color: rgb(174, 63, 193); }
    .dmh-ac-character { color: rgb(12, 147, 18); }
    .dmh-ac-general { color: #0969da; }
    .dmh-ac-meta { color: #57606a; }
    .dmh-ac-cn { color: inherit; font-size: 12px; white-space: nowrap; }
    .dmh-viewer { position: fixed; inset: 0; z-index: 100; display: none; align-items: center; justify-content: center; background: #fff; }
    .dmh-viewer.dmh-open { display: flex; }
    .dmh-viewer img, .dmh-viewer video { display: block; max-width: 100vw; max-height: 100vh; object-fit: contain; }
    .dmh-viewer img[hidden], .dmh-viewer video[hidden] { display: none; }
    .dmh-viewer video { background: #000; }
    .img_detail_loading { position: absolute; top: 0; left: 0; z-index: 1; display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; margin: 0; pointer-events: none; }
    .img_detail_loading[hidden] { display: none; }
    #dmh-viewer-progress { position: absolute; top: 50%; left: 50%; z-index: 10; transform: translate(-50%, -50%); }
    .img_detail_loading .v-progress-circular { width: 100px; height: 100px; border: 6px solid rgba(26, 115, 232, .18); border-top-color: #1a73e8; border-radius: 50%; color: #1a73e8 !important; caret-color: #1a73e8 !important; animation: dmh-progress-circular .82s linear infinite; }
    @keyframes dmh-progress-circular { to { transform: translate(-50%, -50%) rotate(360deg); } }
    .dmh-viewer-error { position: absolute; z-index: 10; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; color: #57606a; }
    .dmh-viewer-error[hidden] { display: none; }
    .dmh-viewer-error h1 { margin: 0; font-size: 24px; line-height: 1.2; font-weight: 700; color: #24292f; }
    .fieitW { stroke: none; fill: currentcolor; width: 72px; height: 72px; line-height: 0; font-size: 0; vertical-align: middle; }
    .img_detail_loading img { object-fit: cover; }
    .dmh-viewer.dmh-zoom-mode img { max-width: none; max-height: none; cursor: grab; user-select: none; }
    .dmh-viewer.dmh-zoom-mode img.dmh-dragging { cursor: grabbing; }
    .dmh-viewer-actions { position: absolute; top: 14px; right: 14px; z-index: 3; display: flex; gap: 8px; opacity: 1; transition: opacity .18s ease; }
    .dmh-viewer-button { position: relative; display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; padding: 0; border: 0; border-radius: 50%; background: #cfe8ff; color: #0969da; cursor: pointer; box-shadow: 0 2px 8px rgba(9,105,218,.18); transition: background .16s ease, color .16s ease, transform .16s ease, box-shadow .16s ease; }
    .dmh-viewer-button:hover { background: #8ecbff; color: #034f9f; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(9,105,218,.24); }
    .dmh-viewer-button[disabled] { opacity: .45; cursor: not-allowed; }
    .dmh-viewer-button svg, .dmh-viewer-nav svg { width: 22px; height: 22px; fill: currentColor; }
    .dmh-viewer-button svg[fill="none"], .dmh-viewer-nav svg[fill="none"] { fill: none; }
    .dmh-viewer-button.dmh-favorited { background: #ffe5ea; color: rgb(255, 64, 96); box-shadow: 0 4px 12px rgba(255,64,96,.18); }
    .dmh-viewer-button.dmh-active { background: #8ecbff; color: #034f9f; }
    .dmh-viewer-button.dmh-download-loading { background: #cfe8ff; color: #0969da; transform: none; }
    .dmh-viewer-button.dmh-download-loading:hover { background: #cfe8ff; color: #0969da; transform: none; box-shadow: 0 2px 8px rgba(9,105,218,.18); }
    .dmh-viewer-button.dmh-download-loading svg { opacity: 0; }
    .dmh-viewer-button.dmh-download-loading::before { content: ''; position: absolute; width: 18px; height: 18px; border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%; animation: dmh-download-spin .75s linear infinite; }
    #dmh-app .dmh-viewer-button.dmh-download-loading[data-dmh-tooltip]::after { display: none; content: none; }
    .dmh-viewer-nav { position: absolute; top: 50%; z-index: 3; display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; padding: 0; border: 0; border-radius: 50%; background: #cfe8ff; color: #0969da; cursor: pointer; opacity: 1; transform: translateY(-50%); box-shadow: 0 2px 8px rgba(9,105,218,.18); transition: background .16s ease, color .16s ease, opacity .18s ease, transform .16s ease, box-shadow .16s ease; }
    .dmh-viewer-nav:hover { background: #8ecbff; color: #034f9f; transform: translateY(-50%) scale(1.06); box-shadow: 0 4px 12px rgba(9,105,218,.24); }
    .dmh-viewer-prev { left: 22px; }
    .dmh-viewer-next { right: 22px; }
    .dmh-viewer-info { position: absolute; top: 14px; left: 14px; z-index: 3; display: flex; flex-direction: column; align-items: flex-start; gap: 7px; max-width: min(360px, 36vw); max-height: calc(100vh - 96px); overflow-x: hidden; overflow-y: auto; scrollbar-width: none; opacity: 1; transform: translateY(0); transition: opacity .18s ease, transform .18s ease; pointer-events: none; }
    .dmh-viewer-info::-webkit-scrollbar { display: none; width: 0; height: 0; }
    .dmh-viewer.dmh-chrome-hidden .dmh-viewer-info { opacity: 0; transform: translateY(-6px); pointer-events: none; }
    .dmh-viewer.dmh-chrome-hidden .dmh-viewer-info .dmh-info-pill { pointer-events: none; }
    .dmh-viewer.dmh-chrome-hidden .dmh-viewer-actions, .dmh-viewer.dmh-chrome-hidden .dmh-viewer-nav { opacity: 0; pointer-events: none; }
    .dmh-info-pill { display: block; flex: 0 0 auto; max-width: 100%; height: 24px; padding: 0 10px; overflow: hidden; border: 1px solid transparent; border-radius: 999px; font-size: 12px; font-weight: bold; line-height: 24px; text-decoration: none; text-overflow: ellipsis; white-space: nowrap; pointer-events: auto; user-select: none; }
    .dmh-info-pill:hover { text-decoration: none; }
    .dmh-info-pill[data-viewer-tag] { transition: box-shadow .14s ease; }
    .dmh-info-pill[data-viewer-tag]:hover { box-shadow: 0 1px 4px rgba(31,35,40,.14); }
    .dmh-pill-id, .dmh-pill-id:visited { background: #bfe3ff; color: #0969da; }
    .dmh-pill-artist, .dmh-pill-artist:visited { color: rgb(201, 112, 0); background-color: rgb(255, 220, 176); border-color: rgb(255, 220, 176); }
    .dmh-pill-copyright, .dmh-pill-copyright:visited { color: rgb(174, 63, 193); background-color: rgb(249, 213, 255); border-color: rgb(249, 213, 255); }
    .dmh-pill-character, .dmh-pill-character:visited { color: rgb(12, 147, 18); background-color: rgb(196, 255, 199); border-color: rgb(196, 255, 199); }
    #dmh-app .dmh-pill-artist[data-viewer-tag]:hover { color: rgb(201, 112, 0); background-color: rgb(255, 220, 176); border-color: rgb(255, 220, 176); }
    #dmh-app .dmh-pill-copyright[data-viewer-tag]:hover { color: rgb(174, 63, 193); background-color: rgb(249, 213, 255); border-color: rgb(249, 213, 255); }
    #dmh-app .dmh-pill-character[data-viewer-tag]:hover { color: rgb(12, 147, 18); background-color: rgb(196, 255, 199); border-color: rgb(196, 255, 199); }
    .dmh-viewer-tags { position: absolute; left: 28px; bottom: 36px; z-index: 4; max-width: calc(100vw - 56px); }
    .dmh-viewer-tags[hidden], .dmh-viewer-tags-panel[hidden] { display: none; }
    .dmh-viewer.dmh-chrome-hidden .dmh-viewer-tags { visibility: hidden; pointer-events: none; }
    .dmh-viewer-tags-panel { position: absolute; left: calc(100% + 6px); bottom: calc(100% + 4px); display: flex; flex-direction: column; width: 360px; max-width: calc(100vw - 150px); max-height: 35vh; padding: 8px; border: 1px solid rgba(255,255,255,.22); border-radius: 10px; background: rgba(255,255,255,.1); box-shadow: 0 2px 10px rgba(31,35,40,.1); backdrop-filter: blur(8px) saturate(1.1); }
    .dmh-viewer-tags-list { display: flex; flex-wrap: wrap; align-content: flex-start; gap: 5px; overflow-y: auto; min-height: 0; overscroll-behavior: contain; scrollbar-width: none; }
    .dmh-viewer-tags-list::-webkit-scrollbar { display: none; width: 0; height: 0; }
    .dmh-viewer-tags-list .dmh-info-pill, .dmh-viewer-tags-list .dmh-info-pill:visited { height: auto; padding: 0 8px; border-color: rgba(94,119,138,.12); border-radius: 10px; background: rgba(190,207,219,.7); color: #30485a; font-weight: 600; line-height: 22px; white-space: normal; overflow-wrap: anywhere; }
    #dmh-app .dmh-viewer-tags-list .dmh-info-pill:hover { border-color: rgba(94,119,138,.12); background: rgba(190,207,219,.7); color: #30485a; }
    #dmh-viewer-tags-toggle { min-width: 88px; height: 40px; padding: 0 14px; border-color: rgba(255,255,255,.28); background: rgba(190,207,219,.72); color: #30485a; font-size: 13px; line-height: 40px; cursor: pointer; box-shadow: 0 2px 8px rgba(31,35,40,.1); backdrop-filter: blur(6px); transition: background .14s ease, border-color .14s ease, color .14s ease, box-shadow .14s ease; }
    #dmh-viewer-tags-toggle:hover { border-color: rgba(255,255,255,.36); background: rgba(190,207,219,.84); color: #263f50; box-shadow: 0 2px 8px rgba(31,35,40,.12); }
    .dmh-tag-chip { display: inline-flex; max-width: 100%; padding: 2px 7px; border-radius: 999px; color: #fff; text-decoration: none; background: rgba(143, 119, 181, .9); }
    .dmh-tag-chip:hover { text-decoration: none; }
    .dmh-tag-artist { background: rgba(251, 140, 0, .9); }
    .dmh-tag-copyright { background: rgba(171, 71, 188, .9); }
    .dmh-tag-character { background: rgba(102, 187, 106, .9); }
    .dmh-tag-meta { background: rgba(84, 110, 122, .9); }
    @media (max-width: 980px) { .dmh-title { display: none; } .dmh-brand { gap: 0; } }
    @media (max-width: 760px) { .dmh-toolbar-content { grid-template-columns: minmax(0, 1fr) max-content; gap: 8px; padding: 8px 10px; } .dmh-search { grid-column: 1 / -1; grid-row: 2; justify-self: stretch; width: 100%; max-width: none; } .dmh-search-form { grid-template-columns: minmax(0, 1fr) repeat(3, 38px); } .dmh-status { display: none; } .dmh-grid { margin-top: 108px; } #dmh-app .dmh-back-to-top { right: 16px; bottom: 16px; width: 40px; height: 40px; } .dmh-viewer-info { max-width: calc(100vw - 96px); max-height: calc(100vh - 104px); font-size: 12px; } .dmh-viewer-actions { flex-wrap: wrap; max-width: calc(100vw - 120px); } .dmh-viewer-button { width: 34px; height: 34px; } .dmh-viewer-button svg { width: 19px; height: 19px; } .dmh-viewer-nav { width: 50px; height: 50px; font-size: 26px; } .dmh-viewer-prev { left: 12px; } .dmh-viewer-next { right: 12px; } }
    @media (prefers-reduced-motion: reduce) { #dmh-app .dmh-back-to-top { transition: none; } .dmh-loading-progress-bar { width: 100%; animation: none; transform: none; } }
  `,document.head.appendChild(e)}const me=[{file:"01.jpg",width:2048,height:1044,author:"白石定規",handle:"jojojojougi",statusId:"968691347270991873"},{file:"02.jpg",width:1414,height:1e3,author:"Hiten",handle:"HitenKei",statusId:"848982747645267968"},{file:"03.jpg",width:2048,height:1348,author:"Hiten",handle:"HitenKei",statusId:"1065892245218373633"},{file:"04.jpg",width:1414,height:1e3,author:"Hiten",handle:"HitenKei",statusId:"1328675184757202945"},{file:"05.jpg",width:849,height:1200,author:"Hiten",handle:"HitenKei",statusId:"1473235665156702209"},{file:"06.jpg",width:1200,height:1055,author:"Hiten",handle:"HitenKei",statusId:"1591051073133113346"},{file:"07.jpg",width:1500,height:851,author:"アシマ",handle:"roro046",statusId:"1867527928780914897"},{file:"08.jpg",width:1500,height:844,author:"アシマ",handle:"roro046",statusId:"1952687063825842491"},{file:"09.jpg",width:1920,height:1080,author:"アシマ",handle:"roro046",statusId:"2075888896697913466"},{file:"10.jpg",width:3541,height:2508,author:"かみゆう",handle:"KYamiuu49",statusId:"2094077692086042729"}],ue=20,l=Ct(new it);let je=l.page;l.started=!0;l.tags="landscape 1girl";l.cardWidth=z.find(e=>e.key==="big")?.value??l.cardWidth;l.loadMore=J;_o();Co(l);const ge=document.getElementById("dmh-viewer-info");ge&&(ge.style.display="none");const I=document.getElementById("dmh-grid");J();So();I&&new ResizeObserver(()=>j(l)).observe(I);async function J(){if(!l.loading){l.loading=!0;try{const e=l.page,t=l.posts.length,o=Array.from({length:ue},(a,r)=>me[r%me.length]);for(let a=o.length-1;a>0;a--){const r=Math.floor(Math.random()*(a+1));[o[a],o[r]]=[o[r],o[a]]}const i=o.map((a,r)=>Eo((e-1)*ue+r,a));i.forEach(a=>l.favoriteStateCache.set(a.id,!1)),l.posts.push(...i),l.sourcePosts.push(...i),ko(l,i,t,a=>V(l,a)),j(l),je=e,l.page=e+1;const n=document.getElementById("dmh-page");n&&(n.value=String(e)),Io(e),M(`已加载 ${l.posts.length} 张 · 静态预览`)}finally{l.loading=!1}}}function fe(e){P(l),l.posts=[],l.sourcePosts=[],l.viewerIndex=-1,l.page=e,I&&(I.replaceChildren(),I.style.height="0px"),window.scrollTo({top:0,behavior:"instant"}),J()}function Io(e){if(location.protocol==="file:")return;const t=new URL(location.href);t.searchParams.set("page",String(e)),history.replaceState(null,"",t)}function Eo(e,t){const o=String(9e6+e+1),i=`./image/${t.file}`,n=`https://x.com/${t.handle}/status/${t.statusId}`;return{id:o,raw:null,fileUrl:i,largeUrl:i,sampleUrl:i,previewUrl:i,thumbnailUrl:i,playbackUrl:"",listUrl:i,viewerUrl:i,width:t.width,height:t.height,aspectRatio:t.width/t.height,tags:[],tagGroups:{artist:[],copyright:[],character:[],general:[],meta:[]},rating:"g",score:0,source:n,fileExt:"jpg",isVideo:!1,isUgoira:!1,favorited:!1,available:!0}}function So(){const e=document.getElementById("dmh-settings-toggle"),t=document.getElementById("dmh-settings-panel"),o=document.getElementById("dmh-settings-overlay"),i=s=>{t?.classList.toggle("dmh-open",s),o?.classList.toggle("dmh-open",s),t?.setAttribute("aria-hidden",String(!s)),o?.setAttribute("aria-hidden",String(!s)),e?.setAttribute("aria-expanded",String(s)),document.documentElement.classList.toggle("dmh-no-scroll",s)};e?.addEventListener("click",()=>i(!0)),document.getElementById("dmh-settings-close")?.addEventListener("click",()=>i(!1)),o?.addEventListener("click",()=>i(!1)),zo();const n=document.getElementById("dmh-page");n?.addEventListener("keydown",s=>{if(s.key==="Enter"){s.preventDefault();const h=Number(n.value);fe(Number.isFinite(h)&&h>0?Math.floor(h):1);return}if(s.key!=="ArrowUp"&&s.key!=="ArrowDown")return;s.preventDefault();const c=Math.max(1,je+(s.key==="ArrowUp"?-1:1));fe(c)}),n?.addEventListener("input",()=>{n.value=n.value.replace(/\D+/g,"")||"1"}),document.getElementById("dmh-card-size")?.addEventListener("change",s=>{const c=s.currentTarget.value,h=z.find(m=>m.key===c),d=document.getElementById("dmh-app");!h||!d||(l.cardWidth=h.value,d.dataset.cardSize=h.key,j(l))}),we("dmh-show-thumbnail-buttons","showThumbnailButtons"),we("dmh-show-thumbnail-info","showThumbnailInfo"),document.getElementById("dmh-show-scrollbar")?.addEventListener("change",s=>{const c=s.currentTarget.checked;document.getElementById("dmh-scrollbar")?.toggleAttribute("hidden",!c)}),document.getElementById("dmh-show-back-to-top")?.addEventListener("change",s=>{const c=s.currentTarget.checked;document.getElementById("dmh-back-to-top")?.toggleAttribute("hidden",!c)}),document.getElementById("dmh-search")?.addEventListener("submit",s=>{s.preventDefault(),M("静态预览不发起网络搜索")});for(const s of["dmh-title-exit","dmh-exit"])document.getElementById(s)?.addEventListener("click",()=>M("当前为静态预览"));I?.addEventListener("click",s=>{s.target.closest("[data-card-action]")?.dataset.cardAction==="download"&&(s.preventDefault(),s.stopImmediatePropagation(),M("静态预览不提供下载"))},!0);const a=document.getElementById("dmh-back-to-top");a?.addEventListener("click",()=>window.scrollTo({top:0,behavior:"smooth"}));let r=window.scrollY;window.addEventListener("scroll",()=>{a?.classList.toggle("dmh-visible",window.scrollY>320);const s=window.scrollY>r;r=window.scrollY,s&&!be()&&te()&&l.loadMore?.()},{passive:!0}),window.addEventListener("wheel",s=>{s.deltaY>0&&!be()&&te()&&l.loadMore?.()},{passive:!0}),a?.classList.toggle("dmh-visible",window.scrollY>320)}function be(){return!!document.querySelector("#dmh-viewer.dmh-open, #dmh-settings-panel.dmh-open")}function zo(){document.getElementById("dmh-viewer")?.addEventListener("click",e=>{e.target.id==="dmh-viewer"&&P(l)}),document.getElementById("dmh-viewer")?.addEventListener("wheel",e=>Wt(l,e),{passive:!1}),document.getElementById("dmh-viewer-img")?.addEventListener("click",e=>Ot(l,e)),document.getElementById("dmh-viewer-img")?.addEventListener("dblclick",e=>Dt(l,e)),document.getElementById("dmh-viewer-img")?.addEventListener("pointerdown",e=>Rt(l,e)),document.getElementById("dmh-viewer-img")?.addEventListener("pointermove",e=>Ht(l,e)),document.getElementById("dmh-viewer-img")?.addEventListener("pointerup",e=>ae(l,e)),document.getElementById("dmh-viewer-img")?.addEventListener("pointercancel",e=>ae(l,e)),document.getElementById("dmh-viewer-img")?.addEventListener("dragstart",e=>{l.zoomMode&&e.preventDefault()}),document.getElementById("dmh-close")?.addEventListener("click",()=>P(l)),document.getElementById("dmh-prev")?.addEventListener("click",()=>{T(l,-1)}),document.getElementById("dmh-next")?.addEventListener("click",()=>{T(l,1)}),document.getElementById("dmh-zoom-toggle")?.addEventListener("click",e=>Ue(l,e)),document.getElementById("dmh-open-source")?.addEventListener("click",()=>Bt(l));for(const e of["dmh-favorite","dmh-open-post","dmh-download"])document.getElementById(e)?.addEventListener("click",()=>Ao("静态预览不提供此操作"));yo(l)}function we(e,t){document.getElementById(e)?.addEventListener("change",o=>{const i=o.currentTarget.checked,n=document.getElementById("dmh-app");n&&(n.dataset[t]=String(i))})}function M(e){const t=document.getElementById("dmh-status");t&&(t.textContent=e)}function Ao(e){const t=document.getElementById("dmh-snackbar");t&&(t.textContent=e,t.classList.add("dmh-open"),window.setTimeout(()=>t.classList.remove("dmh-open"),2e3))}
