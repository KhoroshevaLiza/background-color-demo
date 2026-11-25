let finderSelection=null,pendingCropMedia=null;
const mediaStyles=['Оригинал','Горизонтальный градиент','Вертикальный градиент','Затемнение','Осветление'];
const defaultMedia=type=>({type,style:0,fit:'Кадрировать',position:'По центру',alpha:100,blur:0,contrast:100,saturation:100,temperature:0,strength:50});
function mediaFilter(value,target){
  const temperature=Math.max(-50,Math.min(50,value.temperature||0));
  let tint='';
  if(temperature){
    const ns='http://www.w3.org/2000/svg',id='media-temperature-'+target;
    let matrix=document.getElementById(id+'-matrix');
    if(!matrix){
      let definitions=document.getElementById('media-filter-definitions');
      if(!definitions){definitions=document.createElementNS(ns,'svg');definitions.id='media-filter-definitions';definitions.setAttribute('width','0');definitions.setAttribute('height','0');definitions.style.position='absolute';definitions.setAttribute('aria-hidden','true');document.body.append(definitions);}
      const filter=document.createElementNS(ns,'filter');filter.id=id;filter.setAttribute('color-interpolation-filters','sRGB');
      matrix=document.createElementNS(ns,'feColorMatrix');matrix.id=id+'-matrix';matrix.setAttribute('type','matrix');filter.append(matrix);definitions.append(filter);
    }
    const shift=temperature/50*.25;
    matrix.setAttribute('values',`${1+shift} 0 0 0 0  0 1 0 0 0  0 0 ${1-shift} 0 0  0 0 0 1 0`);
    tint=`url("#${id}") `;
  }
  return `${tint}blur(${value.blur/2}px) contrast(${value.contrast/100}) saturate(${value.saturation/100})`;
}
function mediaOverlay(value){
  if(!value)return 'transparent';
  const color=value.styleColor||(typeof dominantPhotoColor==='function'?dominantPhotoColor(value):'#FFFFFF'),alpha=(value.styleAlpha??100)/100;
  const channels=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)).join(',');
  if(value.style===1)return `linear-gradient(to right,rgba(${channels},${alpha}) 36.949%,rgba(${channels},0) 77.679%)`;
  if(value.style===2)return `linear-gradient(to top,rgba(${channels},${alpha}) 46.529%,rgba(${channels},0))`;
  if(value.style===3)return `rgba(0,0,0,${value.strength/100})`;
  if(value.style===4)return `rgba(255,255,255,${value.strength/100})`;
  return 'transparent';
}
function closeMediaOverlays(){for(const id of ['#media-load-menu','#media-finder','#media-crop-screen','#media-options-menu','#media-position-menu','#media-color-dialog']){const element=$(id);if(element)element.hidden=true;}}
function renderMediaScreen(screen){
  const media=screen==='media';
  $('#media-screen').hidden=!media||!draft.media;
  $('.value-card').hidden=media;
  $('.commands .icon[aria-label="Пипетка"]').hidden=media;
  if(!media){closeMediaOverlays();return;}
  if(!draft.media)return;
  const value=draft.media,video=value.type==='video';
  $('#media-screen').classList.toggle('photo-settings',!video);
  if(!video){
    const reference=$(value.fit==='Вписать'?'#media-position':'#media-fit').previousElementSibling,style=getComputedStyle(reference),context=document.createElement('canvas').getContext('2d');
    context.font=style.font;context.letterSpacing=style.letterSpacing;
    $('#media-screen').style.setProperty('--photo-label-width',context.measureText(reference.textContent).width+'px');
  }
  $('#media-preview-image').src=video?'assets/video-poster.png':'assets/photo.png';
  $('#media-preview-image').style.filter=mediaFilter(value,'preview');
  $('#media-preview-image').style.opacity=value.alpha/100;
  applyPhotoCrop($('#media-preview-image'),value);
  $('#media-preview-style').style.background=mediaOverlay(value);
  $('#media-preview-style').style.opacity=value.alpha/100;
  $('#photo-layout-controls').hidden=video;$('#media-edit').hidden=video;
  $('#video-dummy-controls').hidden=!video;
  $('#media-style').textContent=value.style===0?`Оригинал ${video?'видео':'картинки'}`:mediaStyles[value.style];
  $('#media-fit').textContent=value.fit;$('#media-position').textContent=value.position;
  $('#media-position').closest('.media-property').hidden=['Растянуть','Кадрировать','Замостить'].includes(value.fit);
  $('#media-crop').hidden=video||value.fit!=='Кадрировать';
  renderMediaEffects();syncReset();
  if(typeof renderMediaSettings==='function')renderMediaSettings();
  if(typeof syncPhotoViewerButton==='function')syncPhotoViewerButton();
  if(typeof syncVideoPreview==='function')syncVideoPreview();
}
function patchMedia(patch){draft.media={...draft.media,...patch};renderMediaScreen('media');}
function renderMediaEffects(){
  const value=draft.media,video=value.type==='video';
  const effects=[['alpha','Прозрачность',0,100,'%'],['blur','Размытие',0,5,''],...video?[]:[['contrast','Контраст',0,200,'%'],['saturation','Насыщенность',0,200,'%'],['temperature','Температура',-50,50,'']]];
  const container=$('#media-effects');
  if(container.dataset.type!==value.type){
    container.replaceChildren();container.dataset.type=value.type;
    for(const [key,label,min,max,suffix]of effects){
      const row=document.createElement('div');row.className='media-effect';row.dataset.effect=key;
      row.innerHTML=`<span>${label}</span><input class="media-range" type="range" min="${min}" max="${max}" step="1" aria-label="${label}"><label><input class="media-number" type="number" min="${min}" max="${max}" step="1" aria-label="Значение: ${label}">${suffix}</label>`;
      for(const input of row.querySelectorAll('input'))input.oninput=event=>patchMedia({[key]:Math.round(Math.max(min,Math.min(max,Number(event.target.value)||0)))});
      container.append(row);
    }
  }
  for(const [key,,min,max]of effects){const row=container.querySelector(`[data-effect="${key}"]`);for(const input of row.querySelectorAll('input'))if(input!==document.activeElement)input.value=value[key];row.style.setProperty('--range-fill',((value[key]-min)/(max-min)*100)+'%');}
  if(video){
    const reference=container.querySelector('[data-effect="alpha"]>span'),style=getComputedStyle(reference),context=document.createElement('canvas').getContext('2d');
    context.font=style.font;context.letterSpacing=style.letterSpacing;
    container.style.setProperty('--video-effect-label-width',context.measureText(reference.textContent).width+'px');
  }
  const strength=$('#media-style-strength');strength.hidden=value.style<3;
  const styleLabel=$('#media-style').previousElementSibling;styleLabel.style.width='';delete styleLabel.dataset.strengthLabel;
  if(value.style>=3){
    if(!strength.firstChild){const row=document.createElement('div');row.className='media-effect';row.innerHTML='<span></span><input class="media-range" type="range" min="0" max="100"><label><input class="media-number" type="number" min="0" max="100">%</label>';for(const input of row.querySelectorAll('input'))input.oninput=event=>patchMedia({strength:Math.max(0,Math.min(100,Number(event.target.value)||0))});strength.append(row);}
    strength.querySelector('span').textContent=mediaStyles[value.style];for(const input of strength.querySelectorAll('input'))if(input!==document.activeElement)input.value=value.strength;
    if(video){styleLabel.dataset.strengthLabel=mediaStyles[value.style];styleLabel.style.width='max-content';}
    strength.style.setProperty('--range-fill',value.strength+'%');
  }
}
function renderAppliedMedia(){
  const host=$('#applied-media');
  if(applied.mode!=='media'||!applied.media){host.hidden=true;host.querySelector('video')?.pause();return false;}
  const value=applied.media,video=value.type==='video';host.hidden=false;
  $('#background').style.display='none';$('#background-texture').hidden=true;$('#background-surface').style.filter='none';
  if(host.dataset.type!==value.type){
    host.replaceChildren();host.dataset.type=value.type;
    const element=document.createElement(video?'video':'img');element.className='applied-media-source';element.src=video?'assets/nature.mp4':'assets/photo.png';
    if(video){element.muted=true;element.loop=true;element.autoplay=true;element.playsInline=true;}else element.alt='';
    host.append(element);const overlay=document.createElement('div');overlay.className='applied-media-style';host.append(overlay);
  }
  const source=host.querySelector('.applied-media-source');source.style.filter=mediaFilter(value,'applied');source.style.opacity=value.alpha/100;
  applyPhotoCrop(source,value);
  source.style.objectFit=value.fit==='Вписать'||value.fit==='Растянуть'?'contain':'cover';
  source.style.objectPosition=value.position==='Сверху'?'center top':value.position==='Снизу'?'center bottom':value.position==='Слева'?'left center':value.position==='Справа'?'right center':'center';
  host.lastChild.style.background=mediaOverlay(value);host.lastChild.style.opacity=value.alpha/100;
  if(video)source.play().catch(()=>{});
  if(typeof paintMediaSurface==='function')paintMediaSurface(host,source,host.querySelector('.applied-media-style'),value,'applied');
  return true;
}
function openLoadMenu(){hideTooltip();$('#media-options-menu').hidden=true;$('#media-load-menu').hidden=false;$('#media-load-scroll').scrollTop=0;}
function showColorSettings(){draft.mode='color';setScreen('palette');update();}
$('#media-load-close').onclick=()=>{$('#media-load-menu').hidden=true;if(!draft.media)setScreen('palette');};
$('#media-computer').onclick=()=>{finderSelection=null;$('#finder-open').disabled=true;document.querySelectorAll('[data-file]').forEach(button=>button.classList.remove('selected'));$('#media-load-menu').hidden=true;$('#media-finder').hidden=false;};
$('#media-replace').onclick=openLoadMenu;
$('#finder-cancel').onclick=()=>{$('#media-finder').hidden=true;openLoadMenu();};
document.querySelectorAll('[data-file]').forEach(button=>{
  button.onclick=()=>{finderSelection=button.dataset.file;$('#finder-open').disabled=false;document.querySelectorAll('[data-file]').forEach(item=>item.classList.toggle('selected',item===button));};
  button.ondblclick=()=>{button.click();chooseMediaFile();};
});
function chooseMediaFile(){
  if(!finderSelection)return;
  if(finderSelection==='video'&&typeof mediaVideoAllowed!=='undefined'&&!mediaVideoAllowed)return;
  $('#media-finder').hidden=true;
  if(finderSelection==='photo'){showCrop(defaultMedia('photo'));}
  else{draft.media=defaultMedia('video');draft.mode='media';setScreen('media');renderMediaScreen('media');}
}
$('#finder-open').onclick=chooseMediaFile;
function openCrop(){showCrop(draft.media);}
$('#media-edit').onclick=$('#media-crop').onclick=openCrop;
$('#crop-apply').onclick=()=>{draft.media=pendingCropMedia;draft.mode='media';pendingCropMedia=null;$('#media-crop-screen').hidden=true;setScreen('media');};
$('#crop-cancel').onclick=()=>{pendingCropMedia=null;$('#media-crop-screen').hidden=true;if(!draft.media){setScreen('palette');openLoadMenu();}else renderMediaScreen('media');};
// The two supplied files are the only available files. No file-system access or storage.
function applyPhotoCrop(element,value){
  const crop=value.type==='photo'&&value.fit==='Кадрировать'?value.crop:null;
  element.style.objectViewBox=crop?`inset(${crop.y*100}% ${(1-crop.x-crop.width)*100}% ${(1-crop.y-crop.height)*100}% ${crop.x*100}%)`:'none';
}
function showCrop(value){
  pendingCropMedia={...value,crop:{...(value.crop||{x:109/877,y:246/547,width:689/877,height:177/547})}};
  $('#media-crop-screen').hidden=false;renderCropFrame();
}
function renderCropFrame(){
  if(!pendingCropMedia)return;
  const image=$('#crop-photo'),frame=$('.crop-frame'),crop=pendingCropMedia.crop;
  frame.style.left=(image.offsetLeft+crop.x*image.offsetWidth)+'px';
  frame.style.top=(image.offsetTop+crop.y*image.offsetHeight)+'px';
  frame.style.width=(crop.width*image.offsetWidth)+'px';frame.style.height=(crop.height*image.offsetHeight)+'px';
}
const cropFrame=$('.crop-frame');
cropFrame.tabIndex=0;cropFrame.setAttribute('role','group');cropFrame.setAttribute('aria-label','Область кадрирования. Перетащите рамку или её границы; стрелки перемещают область.');
cropFrame.querySelectorAll('i').forEach((handle,index)=>handle.dataset.resize=['nw','ne','sw','se'][index]);
for(const direction of ['n','e','s','w']){const handle=document.createElement('span');handle.className='crop-edge crop-edge-'+direction;handle.dataset.resize=direction;cropFrame.append(handle);}
let cropDrag=null;
cropFrame.onpointerdown=event=>{
  if(event.button!==0)return;
  cropDrag={id:event.pointerId,x:event.clientX,y:event.clientY,rect:$('#crop-photo').getBoundingClientRect(),crop:{...pendingCropMedia.crop},edge:event.target.dataset.resize||''};
  cropFrame.setPointerCapture(event.pointerId);cropFrame.focus();event.preventDefault();
};
cropFrame.onpointermove=event=>{
  if(!cropDrag||event.pointerId!==cropDrag.id)return;
  const {crop,rect,edge}=cropDrag,dx=(event.clientX-cropDrag.x)/rect.width,dy=(event.clientY-cropDrag.y)/rect.height;
  const minWidth=24/rect.width,minHeight=24/rect.height;
  let left=crop.x,top=crop.y,right=crop.x+crop.width,bottom=crop.y+crop.height;
  if(!edge){left=Math.max(0,Math.min(1-crop.width,crop.x+dx));top=Math.max(0,Math.min(1-crop.height,crop.y+dy));right=left+crop.width;bottom=top+crop.height;}
  else{
    if(edge.includes('w'))left=Math.max(0,Math.min(right-minWidth,crop.x+dx));
    if(edge.includes('e'))right=Math.max(left+minWidth,Math.min(1,crop.x+crop.width+dx));
    if(edge.includes('n'))top=Math.max(0,Math.min(bottom-minHeight,crop.y+dy));
    if(edge.includes('s'))bottom=Math.max(top+minHeight,Math.min(1,crop.y+crop.height+dy));
  }
  pendingCropMedia.crop={x:left,y:top,width:right-left,height:bottom-top};renderCropFrame();
};
cropFrame.onpointerup=cropFrame.onpointercancel=()=>{cropDrag=null;};
cropFrame.onkeydown=event=>{
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
  event.preventDefault();const crop=pendingCropMedia.crop,step=event.shiftKey?10:1,image=$('#crop-photo');
  const dx=event.key==='ArrowLeft'?-step/image.offsetWidth:event.key==='ArrowRight'?step/image.offsetWidth:0;
  const dy=event.key==='ArrowUp'?-step/image.offsetHeight:event.key==='ArrowDown'?step/image.offsetHeight:0;
  pendingCropMedia.crop={...crop,x:Math.max(0,Math.min(1-crop.width,crop.x+dx)),y:Math.max(0,Math.min(1-crop.height,crop.y+dy))};renderCropFrame();
};
$('#finder-video-image').src='assets/video-poster.png';
renderMediaScreen('palette');
