const previewVideo=document.createElement('video');
previewVideo.id='media-preview-video';
previewVideo.src='assets/nature.mp4';
previewVideo.poster='assets/video-poster.png';
previewVideo.preload='none';
previewVideo.muted=true;
previewVideo.playsInline=true;
previewVideo.hidden=true;
$('#media-preview-style').before(previewVideo);
const previewPlay=$('.video-dummy-play');
previewPlay.setAttribute('role','button');
previewPlay.setAttribute('tabindex','0');
function updatePreviewPlay(){
  const playing=!previewVideo.paused;
  previewPlay.classList.toggle('playing',playing);
  previewPlay.setAttribute('aria-label',playing?'Приостановить видео':'Воспроизвести видео');
  previewPlay.setAttribute('aria-pressed',String(playing));
}
function syncVideoPreview(){
  if(activeScreen!=='media'||draft.media?.type!=='video'||$('#dialog').hidden){
    previewVideo.pause();previewVideo.hidden=true;return;
  }
  previewVideo.style.filter=$('#media-preview-image').style.filter;
}
function stopPreviewVideo(){
  previewVideo.pause();
  if(previewVideo.readyState)previewVideo.currentTime=0;
  previewVideo.hidden=true;
  $('#video-dummy-controls .video-dummy-progress i').style.left='-7px';
}
previewPlay.onclick=async()=>{
  if(!previewVideo.paused){previewVideo.pause();return;}
  previewVideo.hidden=false;syncVideoPreview();
  try{await previewVideo.play();}catch{previewVideo.hidden=true;updatePreviewPlay();}
};
previewPlay.onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();previewPlay.click();}};
previewVideo.addEventListener('play',updatePreviewPlay);
previewVideo.addEventListener('pause',updatePreviewPlay);
previewVideo.addEventListener('ended',stopPreviewVideo);
previewVideo.addEventListener('timeupdate',()=>{
  const progress=previewVideo.duration?previewVideo.currentTime/previewVideo.duration:0;
  $('#video-dummy-controls .video-dummy-progress i').style.left=`calc(${progress*100}% - 7px)`;
});
const previewVisibilityObserver=new MutationObserver(()=>{if($('#dialog').hidden||$('#media-screen').hidden||draft.media?.type!=='video')stopPreviewVideo();});
for(const element of [$('#dialog'),$('#media-screen')])previewVisibilityObserver.observe(element,{attributes:true,attributeFilter:['hidden']});
updatePreviewPlay();
