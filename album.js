(function(){
var R=REPLAY,q=new URLSearchParams(location.search),rel=R.get(q.get('id'))||REPLAY_RELEASES[0];
var a=document.getElementById('audio'),pp=document.getElementById('pp'),seek=document.getElementById('seek'),cur=-1,dragging=false;
var total=rel.tracks.reduce(function(s,t){return s+R.secs(t.length);},0);
document.title=rel.title+' by '+rel.artist+' | RawReplay';
var h='<section class="rel"><img class="cover" src="'+R.cover(rel)+'" alt="Cover of '+R.esc(rel.title)+'"><div><div class="kind">Release</div><h1>'+R.esc(rel.title)+'</h1>'+
 '<div class="meta"><b>'+R.esc(rel.artist)+'</b> &middot; '+rel.tracks.length+' tracks &middot; '+Math.round(total/60)+' min ('+R.fmt(total)+')</div>'+
 '<button class="bigplay" id="big" aria-label="Play release">&#9654;</button></div></section><ul class="tracks" id="list">';
rel.tracks.forEach(function(t,i){h+='<li data-i="'+i+'"><span class="n">'+(i+1)+'</span><span class="t">'+R.esc(t.title)+'<small>'+R.esc(rel.artist)+'</small></span><span class="dt">'+rel.released+'</span><span class="d">'+t.length+'</span></li>';});
h+='</ul><div class="license"><b>License:</b> <a href="'+rel.licenseUrl+'" target="_blank" rel="noopener">'+rel.license+'</a><br><b>Credit:</b> '+R.esc(rel.credit)+
 '. Source: <a href="'+R.item(rel)+'" target="_blank" rel="noopener">archive.org/details/'+rel.archiveId+'</a><br><i>Demo content for the RawReplay prototype.</i></div>';
document.getElementById('main').innerHTML=h;
var items=document.querySelectorAll('#list li');
function load(i){cur=i;var t=rel.tracks[i];a.src=R.src(rel,t);a.play().catch(function(){});
 document.getElementById('nowT').textContent=t.title;document.getElementById('nowA').textContent=rel.artist+' \u2014 '+rel.title;
 items.forEach(function(li,j){li.classList.toggle('on',j===i);});}
function toggle(){if(cur<0)return load(0);a.paused?a.play().catch(function(){}):a.pause();}
items.forEach(function(li){li.onclick=function(){load(+li.dataset.i);};});
document.getElementById('big').onclick=toggle;pp.onclick=toggle;
function icon(){var s=a.paused?'\u25B6':'\u275A\u275A';pp.textContent=s;document.getElementById('big').textContent=s;pp.setAttribute('aria-label',a.paused?'Play':'Pause');}
a.addEventListener('play',icon);a.addEventListener('pause',icon);
a.addEventListener('loadedmetadata',function(){seek.max=a.duration;document.getElementById('dur').textContent=R.fmt(a.duration);});
a.addEventListener('timeupdate',function(){if(!dragging)seek.value=a.currentTime;document.getElementById('cur').textContent=R.fmt(a.currentTime);});
a.addEventListener('ended',function(){if(cur<rel.tracks.length-1)load(cur+1);else icon();});
seek.addEventListener('input',function(){dragging=true;document.getElementById('cur').textContent=R.fmt(seek.value);});
seek.addEventListener('change',function(){a.currentTime=+seek.value;dragging=false;});
var start=parseInt(q.get('t'),10);if(start>=0&&start<rel.tracks.length)load(start);
window.__replay={audio:a,cur:function(){return cur;},load:load};
})();
