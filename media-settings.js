const photoPixelsImage=new Image();
const photoCache=new Map(),dominantCache=new Map();
photoPixelsImage.src=mediaPhotoSource;
photoPixelsImage.onload=()=>{if(activeScreen==='media')renderMediaScreen('media');if(applied.mode==='media')renderAppliedMedia();};
const mediaPositions=[['Слева сверху','left top'],['Сверху по центру','center top'],['Справа сверху','right top'],['Слева','left center'],['По центру','center center'],['Справа','right center'],['Слева снизу','left bottom'],['Снизу по центру','center bottom'],['Справа снизу','right bottom']];
function photoCropCanvas(value,size){
  if(!photoPixelsImage.naturalWidth)return null;
  const crop=value.crop||{x:0,y:0,width:1,height:1};
  const canvas=document.createElement('canvas');canvas.width=size||Math.max(1,Math.round(crop.width*photoPixelsImage.naturalWidth));canvas.height=size||Math.max(1,Math.round(crop.height*photoPixelsImage.naturalHeight));
  canvas.getContext('2d').drawImage(photoPixelsImage,crop.x*photoPixelsImage.naturalWidth,crop.y*photoPixelsImage.naturalHeight,crop.width*photoPixelsImage.naturalWidth,crop.height*photoPixelsImage.naturalHeight,0,0,canvas.width,canvas.height);return canvas;
}
function dominantPhotoColor(value){
  const key=JSON.stringify(value.crop||null);if(dominantCache.has(key))return dominantCache.get(key);
  const canvas=photoCropCanvas(value,64);if(!canvas)return '#FFFFFF';
  const pixels=canvas.getContext('2d').getImageData(0,0,64,64).data,buckets=new Map();
  for(let i=0;i<pixels.length;i+=4){const r=pixels[i],g=pixels[i+1],b=pixels[i+2],light=(r+g+b)/3;if(light<25||light>240)continue;const key=[r>>5,g>>5,b>>5].join(',');const bucket=buckets.get(key)||[0,0,0,0];bucket[0]++;bucket[1]+=r;bucket[2]+=g;bucket[3]+=b;buckets.set(key,bucket);}
  const winner=[...buckets.values()].sort((a,b)=>b[0]-a[0])[0];const color=winner?'#'+winner.slice(1).map(c=>Math.round(c/winner[0]).toString(16).padStart(2,'0')).join('').toUpperCase():'#808080';dominantCache.set(key,color);return color;
}
function tiledPhoto(){
  const key='original';if(photoCache.has(key))return photoCache.get(key);
  const canvas=photoCropCanvas({});if(!canvas)return null;const tile={url:canvas.toDataURL('image/png'),width:canvas.width,height:canvas.height};photoCache.set(key,tile);return tile;
}
function paintMediaSurface(host,source,overlay,value,target){
  const tile=value.type==='photo'&&value.fit==='Замостить'?tiledPhoto(value):null;
  let layer=host.querySelector('.media-tile-layer');
  if(!layer){layer=document.createElement('div');layer.className='media-tile-layer';host.insertBefore(layer,source);}
  const position=mediaPositions.find(([label])=>label===value.position)?.[1]||'center center';
  source.style.objectFit=value.fit==='Вписать'||value.fit==='Растянуть'?'contain':'cover';source.style.objectPosition=position;
  source.style.position='absolute';source.style.width='100%';source.style.height=value.fit==='Растянуть'?'auto':'100%';source.style.left='0';
  const vertical=position.includes('top')?0:position.includes('bottom')?100:50;
  source.style.top=value.fit==='Растянуть'?vertical+'%':'0';
  source.style.transform=value.fit==='Растянуть'?`translateY(-${vertical}%)`:'none';
  source.style.visibility=tile?'hidden':'visible';source.style.opacity=1;source.style.filter=mediaFilter(value,target);
  layer.hidden=!tile;
  if(tile){layer.style.backgroundImage=`url("${tile.url}")`;layer.style.backgroundSize=target==='preview'?'auto 100%':`${tile.width}px ${tile.height}px`;layer.style.backgroundPosition='left top';layer.style.filter=mediaFilter(value,target);}
  overlay.style.background=mediaOverlay(value);overlay.style.opacity=1;
  host.style.opacity=value.alpha/100;
}
function renderMediaSettings(){
  const value=draft.media;if(!value)return;
  $('#media-style').disabled=false;
  paintMediaSurface($('.media-preview-visual'),$('#media-preview-image'),$('#media-preview-style'),value,'preview');
  const gradient=value.style===1||value.style===2;
  $('#media-style-color-row').hidden=!gradient;
  if(gradient){const color=value.styleColor||dominantPhotoColor(value),alpha=value.styleAlpha??100;styleGradientColorCircle($('#media-style-color i'),color,alpha);$('#media-style-color>span').textContent=value.styleColor?color+(alpha<100?', '+alpha/100:''):'Доминантный';$('#media-style-color').style.background=`linear-gradient(to bottom right,${color}00,${color}26)`;$('#media-style-color-reset').hidden=!value.styleColor;}
}
function placeMediaPopup(element,anchor,{left=0,top=0,height,width}={}){
  const rect=anchor.getBoundingClientRect(),dialog=$('#dialog').getBoundingClientRect();
  const x=Math.max(8,Math.min(window.innerWidth-(width||element.offsetWidth)-20,rect.left+left));
  const y=Math.max(8,Math.min(window.innerHeight-(height||element.offsetHeight)-8,rect.top+top));
  element.style.left=(x-dialog.left)+'px';element.style.top=(y-dialog.top)+'px';
}
function closeSettingsMenus(){hideTooltip();$('#media-options-menu').hidden=true;$('#media-position-menu').hidden=true;}
function menuCloseButton(close){const button=document.createElement('button');button.className='media-menu-close';button.setAttribute('aria-label','Закрыть меню');const img=document.createElement('img');img.src='assets/close.svg';img.alt='';button.append(img);button.onclick=close;return button;}
$('#media-fit').onclick=()=>{
  closeSettingsMenus();const menu=$('#media-options-menu');menu.className='media-options-menu media-fit-menu';menu.replaceChildren();
  for(const fit of ['Вписать','Растянуть','Кадрировать','Замостить']){const button=document.createElement('button');button.className='media-fit-option';button.setAttribute('role','menuitemradio');button.setAttribute('aria-checked',String(draft.media.fit===fit));const dot=document.createElement('img');dot.src=draft.media.fit===fit?'assets/menu-radio-selected.svg':'assets/menu-radio-empty.svg';dot.alt='';button.append(dot,document.createTextNode(fit));button.onclick=()=>{patchMedia({fit});menu.hidden=true;};menu.append(button);}
  menu.append(menuCloseButton(()=>menu.hidden=true));menu.hidden=false;placeMediaPopup(menu,$('#media-fit'),{left:-30,top:-18,height:170,width:156});
};
const positionMenu=document.createElement('section');positionMenu.id='media-position-menu';positionMenu.hidden=true;positionMenu.setAttribute('aria-label','Расположение');
positionMenu.innerHTML='<div class="media-position-heading"><span>Расположение</span><button id="media-position-apply" class="success" aria-label="Сохранить расположение"><img src="assets/save.svg" alt=""></button><button id="media-position-cancel" aria-label="Отменить расположение"><img src="assets/close.svg" alt=""></button></div><div class="media-position-content"><div id="media-position-grid"></div></div>';
$('#dialog').append(positionMenu);
let pendingMediaPosition=4;
function renderPositionGrid(){
  const grid=$('#media-position-grid');grid.replaceChildren();
  [3,4,5].forEach((index,column)=>{const button=document.createElement('button');button.className='position-column position-column-'+column;button.setAttribute('aria-label',['Слева','По центру','Справа'][column]);button.setAttribute('aria-pressed',String(index===pendingMediaPosition));button.dataset.position=index;for(let row=0;row<3;row++){const marker=document.createElement('i');marker.className='position-mark';button.append(marker);}button.onclick=()=>{pendingMediaPosition=index;renderPositionGrid();paintMediaSurface($('.media-preview-visual'),$('#media-preview-image'),$('#media-preview-style'),{...draft.media,position:mediaPositions[index][0]},'preview');};grid.append(button);});
}
$('#media-position').onclick=()=>{closeSettingsMenus();const index=mediaPositions.findIndex(([label])=>label===draft.media.position);pendingMediaPosition=3+(index<0?1:index%3);renderPositionGrid();positionMenu.hidden=false;placeMediaPopup(positionMenu,$('#media-position'),{left:-16,top:-12,height:165,width:250});};
$('#media-position-apply').onclick=()=>{patchMedia({position:mediaPositions[pendingMediaPosition][0]});positionMenu.hidden=true;};
$('#media-position-cancel').onclick=()=>{positionMenu.hidden=true;renderMediaSettings();};
$('#media-style').onclick=()=>{
  const video=draft.media.type==='video';
  closeSettingsMenus();const menu=$('#media-options-menu');menu.className='media-options-menu media-style-menu'+(video?' media-video-style-menu':'');menu.replaceChildren();
  const labels=video?['Оригинал\nвидео','','','Затемнение\nвидео','Осветление\nвидео']:['Оригинал\nкартинки','Горизонтальный\nградиент','Вертикальный\nградиент','Затемнение\nкартинки','Осветление\nкартинки'];
  const indices=video?[0,3,4]:[0,1,2,3,4];
  indices.forEach(index=>{const label=labels[index],button=document.createElement('button');button.className='media-style-option';button.classList.toggle('contrast-caption',index===0||index===3);button.setAttribute('aria-label',label.replace('\n',' '));button.setAttribute('aria-pressed',String(draft.media.style===index));const picture=document.createElement('div');picture.className='media-style-picture';const image=document.createElement('img');image.src=video?'assets/video-poster.png':'assets/photo.png';image.alt='';applyPhotoCrop(image,draft.media);const overlay=document.createElement('div');overlay.className='media-style-overlay';overlay.style.background=mediaOverlay({...draft.media,style:index,strength:50,styleColor:undefined,styleAlpha:100});picture.append(image,overlay);const caption=document.createElement('span');caption.textContent=label;button.append(picture,caption);button.onclick=()=>{const patch={style:index,strength:50};if(index===1||index===2){patch.styleColor=undefined;patch.styleAlpha=100;}patchMedia(patch);menu.hidden=true;};menu.append(button);});
  menu.append(menuCloseButton(()=>menu.hidden=true));menu.hidden=false;placeMediaPopup(menu,$('#media-style'),{left:-20,top:video?-53:0,height:indices.length*130+(indices.length-1)*6+(video?16:24),width:250});
};
$('#media-style-color').onclick=()=>openMediaColorDialog();
$('#media-style-color-reset').onclick=()=>patchMedia({styleColor:undefined,styleAlpha:100});
renderMediaScreen(activeScreen);
