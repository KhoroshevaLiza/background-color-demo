const $=s=>document.querySelector(s);
const colors=[null,'#999999','#E0564C','#E59545','#E5CB45','#009918','#29B5CF','#326194','#4C3294','#943288','#943253','#EDEDED','#FFE5E3','#FFF1E3','#FFFBE3','#E3FFE8','#E3FAFF','#E3F1FF','#EAE3FF','#FFE3FA','#FFE3EC'];
const photoOnlyColors=[null,'#CCCCCC','#FF7067','#FFB266','#FFE566','#99BF9F','#70C0CF','#618BB8','#8B77C0','#BF82B8'];
let applied={color:'#FFFBE3',alpha:100},draft={...applied},snapshot={...applied};
let gradientStop=1,gradientPicker=false;
let activeScreen='palette',pickerHSV={h:51,s:0,v:1};
const savedColors=[];
const historyColors=[];
const seededHistoryFixtures=new Set();
const pickerHistoryPinned=new Set();
// Scenario fixtures seed a collection on its first edit, preserving session data.
const collectionDisplay={savedFallback:[],historyFallback:[],hiddenSaved:new Set(),hiddenHistory:new Set(),savedEdited:false,historyEdited:false};
const getSavedColors=()=>((savedColors.length||collectionDisplay.savedEdited)?savedColors:collectionDisplay.savedFallback).filter(value=>!collectionDisplay.hiddenSaved.has(colorKey(value)));
const getHistoryColors=()=>((historyColors.length||collectionDisplay.historyEdited)?historyColors:collectionDisplay.historyFallback).filter(value=>!collectionDisplay.hiddenHistory.has(colorKey(value)));
let menuSavedRows=[],menuHistoryRows=[];
let mineContext=null;
const colorKey=value=>`${value.color}:${value.alpha}:${value.texture||0}:${value.blur||0}:${JSON.stringify(value.gradient||null)}`;
const isSaved=value=>getSavedColors().some(item=>colorKey(item)===colorKey(value));
const colorLabel=value=>value.gradient?value.gradient.colors.map((color,index)=>`${color}${value.gradient.alphas[index]<100?", "+value.gradient.alphas[index]/100:""}`).join(" → "):`${value.color}${value.alpha<100?', '+Number((value.alpha/100).toFixed(2)):''}`;
let tooltipValue=null,tooltipAnchor=null,tooltipShowTimer,tooltipHideTimer;
function hideTooltip(){
  clearTimeout(tooltipShowTimer);clearTimeout(tooltipHideTimer);
  $('#color-tooltip').hidden=true;
  if(tooltipAnchor)tooltipAnchor.removeAttribute('aria-describedby');
  tooltipAnchor=null;tooltipValue=null;
}
function syncTooltip(){
  if(!tooltipValue)return;
  const pinned=isSaved(tooltipValue),empty=tooltipValue.color===null;
  $('#tooltip-value').textContent=empty?'Без цвета':colorLabel(tooltipValue);
  if(tooltipValue.gradient){
    const label=$('#tooltip-value');label.replaceChildren();
    tooltipValue.gradient.colors.forEach((color,index)=>{
      if(index){const arrow=document.createElement('span');arrow.className='gradient-transition';const icon=document.createElement('img');icon.src='assets/gradient-transition.png';icon.alt='→';arrow.append(icon);label.append(arrow);}
      const text=document.createElement('span'),alpha=tooltipValue.gradient.alphas[index];
      text.textContent=color+(alpha<100?', '+Number((alpha/100).toFixed(2)):'');label.append(text);
    });
  }
  $('#tooltip-pin').hidden=empty;
  $('#tooltip-pin').setAttribute('aria-label',pinned?'Удалить из Моих цветов':'Добавить в Мои цвета');
  $('#tooltip-pin').title=pinned?'Удалить из Моих цветов':'Добавить в Мои цвета';
  $('#tooltip-pin').setAttribute('aria-pressed',String(pinned));
  $('#tooltip-pin-icon').src=pinned?'assets/unpin.svg':'assets/pin.svg';
}
function showTooltip(anchor,value){
  clearTimeout(tooltipShowTimer);clearTimeout(tooltipHideTimer);
  if(tooltipAnchor&&tooltipAnchor!==anchor)tooltipAnchor.removeAttribute('aria-describedby');
  tooltipAnchor=anchor;tooltipValue={...value};syncTooltip();
  anchor.setAttribute('aria-describedby','color-tooltip');
  const popup=$('#color-tooltip');popup.hidden=false;
  const rect=anchor.getBoundingClientRect(),width=popup.offsetWidth,height=popup.offsetHeight;
  const left=Math.max(8,Math.min(window.innerWidth-width-8,rect.left+rect.width/2-width/2));
  const below=rect.top<height+18;
  popup.classList.toggle('tooltip-below',below);
  popup.style.left=left+'px';popup.style.top=(below?rect.bottom+12:rect.top-height-12)+'px';
  popup.style.setProperty('--nose-x',Math.max(14,Math.min(width-14,rect.left+rect.width/2-left))+'px');
}
function scheduleTooltipHide(){clearTimeout(tooltipShowTimer);clearTimeout(tooltipHideTimer);tooltipHideTimer=setTimeout(hideTooltip,180);}
function attachTooltip(button,value){
  button.title='';button.setAttribute('aria-label',value.color===null?'Без цвета':colorLabel(value));
  if(value.color===null){button.onpointerenter=hideTooltip;button.onfocus=hideTooltip;return;}
  button.onpointerenter=()=>{clearTimeout(tooltipHideTimer);clearTimeout(tooltipShowTimer);tooltipShowTimer=setTimeout(()=>showTooltip(button,value),250);};
  button.onpointerleave=scheduleTooltipHide;
  button.onfocus=()=>showTooltip(button,value);
  button.onblur=event=>{if(!$('#color-tooltip').contains(event.relatedTarget))scheduleTooltipHide();};
}
$('#color-tooltip').onpointerenter=()=>{clearTimeout(tooltipHideTimer);};
$('#color-tooltip').onpointerleave=scheduleTooltipHide;
$('#color-tooltip').onfocusin=()=>{clearTimeout(tooltipHideTimer);};
$('#color-tooltip').onfocusout=event=>{if(!$('#color-tooltip').contains(event.relatedTarget))scheduleTooltipHide();};
$('#tooltip-pin').onclick=event=>{event.stopPropagation();if(tooltipValue&&tooltipValue.color!==null){clearTimeout(tooltipHideTimer);toggleSaved({...tooltipValue});hideTooltip();}};
window.addEventListener('resize',hideTooltip);
window.addEventListener('scroll',hideTooltip,true);
function seedHistoryFallback(){
  const additions=collectionDisplay.historyFallback.filter(value=>!seededHistoryFixtures.has(colorKey(value))&&!historyColors.some(item=>colorKey(item)===colorKey(value)));
  collectionDisplay.historyFallback.forEach(value=>seededHistoryFixtures.add(colorKey(value)));
  historyColors.push(...structuredClone(additions));
}
function remember(value){
  if(value.color===null)return;
  if(!historyColors.length&&!collectionDisplay.historyEdited)seedHistoryFallback();
  collectionDisplay.historyEdited=true;collectionDisplay.hiddenHistory.delete(colorKey(value));
  const index=historyColors.findIndex(item=>colorKey(item)===colorKey(value));
  if(index>=0)historyColors.splice(index,1);
  historyColors.unshift({...value});historyColors.length=Math.min(historyColors.length,10);
  document.dispatchEvent(new Event('color-collection-change'));
}
function openMine(context=null){
  mineContext=context;
  const filter=context?.filter||(()=>true);
  (context?.host||$('#dialog')).append($('#mine-menu'));
  menuSavedRows=getSavedColors().filter(filter).map(value=>({...value}));
  menuHistoryRows=getHistoryColors().filter(value=>filter(value)&&!isSaved(value)).map(value=>({...value}));
  renderMenu();$('#mine-menu').hidden=false;
}
function toggleSaved(value){
  if(value.color===null)return;
  const pinned=isSaved(value);
  if(!pinned){
    if(activeScreen==='picker'&&!gradientPicker&&!$('#dialog').hidden&&getHistoryColors().some(item=>colorKey(item)===colorKey(value)))pickerHistoryPinned.add(colorKey(value));
    if(typeof retainColorDialogHistory==='function')retainColorDialogHistory(value);
  }
  if(!savedColors.length&&!collectionDisplay.savedEdited)savedColors.push(...structuredClone(getSavedColors()));
  collectionDisplay.savedEdited=true;collectionDisplay.hiddenSaved.delete(colorKey(value));
  const index=savedColors.findIndex(item=>colorKey(item)===colorKey(value));
  if(!pinned){
    if(index<0)savedColors.unshift({...value});
  }else{
    savedColors.splice(index,1);remember(value);
    menuSavedRows=menuSavedRows.filter(item=>colorKey(item)!==colorKey(value));
    if(!menuHistoryRows.some(item=>colorKey(item)===colorKey(value)))menuHistoryRows.unshift({...value});
  }
  renderSaved();syncPin();syncTooltip();
  if(activeScreen==='picker')renderPickerHistory();
  if(!$('#mine-menu').hidden)renderMenu();
  document.dispatchEvent(new Event('color-collection-change'));
}
function syncPin(){
  const pinned=isSaved(draft);
  $('.pin').setAttribute('aria-pressed',String(pinned));
  $('.pin').setAttribute('aria-label',pinned?'Удалить из Моих цветов':'Добавить в Мои цвета');
  $('.pin').title=pinned?'Удалить из Моих цветов':'Добавить в Мои цвета';
  $('.pin img').src=pinned?'assets/unpin.svg':'assets/pin.svg';
}
function savedSwatch(value,onSelect){
  const button=document.createElement('button');
  button.className='swatch saved-swatch';
  button.style.setProperty('--saved-color',value.gradient?gradientCSS(value):value.color);
  button.style.setProperty('--saved-solid',value.gradient?gradientCSS(value,true):value.color);
  button.classList.toggle('gradient-swatch',!!value.gradient);
  button.style.setProperty('--saved-alpha',value.gradient?1:value.alpha/100);
  const fill=document.createElement('span');fill.className='saved-swatch-fill';fill.style.filter=`blur(${(value.blur||0)/2}px)`;
  const pattern=document.createElement('span');pattern.className='texture-overlay';styleTexture(pattern,{...value,blur:0});fill.append(pattern);button.append(fill);
  if(value.swatchTextureSize){pattern.style.maskSize=value.swatchTextureSize;pattern.style.webkitMaskSize=value.swatchTextureSize;}
  attachTooltip(button,value);
  button.onclick=()=>{if(onSelect)onSelect(value);else{draft={...value};update();commit();}};
  return button;
}
function renderSaved(){
  const values=getSavedColors(),hasValues=values.length>0;
  $('#mine-block').hidden=!hasValues;
  $('#mine').replaceChildren();
  for(const value of values.slice(0,19))$('#mine').append(savedSwatch(value));
  if(hasValues){
    const more=document.createElement('button');more.className='mine-more';more.setAttribute('aria-label','Все мои цвета');more.title='Все мои цвета';
    more.onclick=()=>{if($('#mine-menu').hidden)openMine();else $('#mine-menu').hidden=true;};$('#mine').append(more);
  }else if(menuSavedRows.length===0&&menuHistoryRows.length===0)$('#mine-menu').hidden=true;
}
function moveSaved(value,direction){
  const index=menuSavedRows.findIndex(item=>colorKey(item)===colorKey(value));
  const target=index+direction;
  if(index<0||target<0||target>=menuSavedRows.length)return;
  if(!savedColors.length&&!collectionDisplay.savedEdited)savedColors.push(...getSavedColors().map(value=>({...value})));
  collectionDisplay.savedEdited=true;
  const from=savedColors.findIndex(item=>colorKey(item)===colorKey(value));
  const to=savedColors.findIndex(item=>colorKey(item)===colorKey(menuSavedRows[target]));
  if(from<0||to<0)return;
  [savedColors[from],savedColors[to]]=[savedColors[to],savedColors[from]];
  [menuSavedRows[index],menuSavedRows[target]]=[menuSavedRows[target],menuSavedRows[index]];
  renderSaved();renderMenu();
  document.dispatchEvent(new Event('color-collection-change'));
}
function renderMenu(){
  $('#mine-list').replaceChildren();
  const addRow=value=>{
    const row=document.createElement('div');row.className='mine-row';
    const name=document.createElement('button');name.className='mine-value';name.textContent=colorLabel(value);
    if(value.gradient){
      name.replaceChildren();
      value.gradient.colors.forEach((color,index)=>{
        if(index){const arrow=document.createElement('span');arrow.className='gradient-transition';const icon=document.createElement('img');icon.src='assets/gradient-transition.png';icon.alt='→';arrow.append(icon);name.append(arrow);}
        const text=document.createElement('span'),alpha=value.gradient.alphas[index];text.textContent=color+(alpha<100?', '+Number((alpha/100).toFixed(2)):'');name.append(text);
      });
    }
    const select=mineContext?.select;
    name.onclick=()=>{if(select)select(value);else{draft={...value};update();commit();}};
    const pinned=isSaved(value),action=pinned?'Удалить из Моих цветов':'Добавить в Мои цвета';
    const remove=document.createElement('button');remove.className='mine-remove';remove.setAttribute('aria-label',`${action} ${name.textContent}`);remove.setAttribute('aria-pressed',String(pinned));remove.title=action;
    const removeIcon=document.createElement('img');removeIcon.src=pinned?'assets/unpin.svg':'assets/pin.svg';removeIcon.alt='';remove.append(removeIcon);
    remove.onclick=()=>toggleSaved(value);
    const commands=document.createElement('div');commands.className='mine-row-commands';
    const savedIndex=menuSavedRows.findIndex(item=>colorKey(item)===colorKey(value));
    if(pinned&&savedIndex>=0){
      for(const [direction,label] of [[1,'Переместить вниз'],[-1,'Переместить вверх']]){
        if(savedIndex+direction<0||savedIndex+direction>=menuSavedRows.length)continue;
        const move=document.createElement('button');move.className='mine-move '+(direction===1?'move-down':'move-up');
        move.title=label;move.setAttribute('aria-label',`${label} ${colorLabel(value)}`);
        const arrow=document.createElement('img');arrow.src=direction===1?'assets/down.svg':'assets/up.svg';arrow.alt='';move.append(arrow);
        move.onclick=()=>moveSaved(value,direction);commands.append(move);
      }
    }
    commands.append(remove);
    row.append(savedSwatch(value,select),name,commands);$('#mine-list').append(row);
  };
  menuSavedRows.forEach(addRow);
  if(menuHistoryRows.length){
    const divider=document.createElement('div');divider.className='mine-history-divider';
    const caption=document.createElement('span');caption.textContent='Ранее использовались';divider.append(caption);$('#mine-list').append(divider);
    menuHistoryRows.forEach(addRow);
  }
}
$('.pin').onclick=()=>toggleSaved(draft);
$('#mine-close').onclick=()=>{$('#mine-menu').hidden=true;};
function update(preservePicker=false){
  const empty=draft.color===null;
  const editing=editingColor();
  $('#hex').value=empty?'':editing.color.slice(1);
  $('#alpha').value=editing.alpha;
  $('#preview').classList.toggle('no-color',empty);
  updatePreview();
  $('.pin').hidden=empty;
  syncPin();
  if(!preservePicker)syncPickerFromDraft();
}
function updatePreview(){
  if(typeof renderMediaScreen==='function'&&activeScreen==='media')renderMediaScreen(activeScreen);
  const empty=draft.color===null,preview=$('#preview');
  preview.style.setProperty('--preview-color',empty?'#FFFFFF':draft.gradient?gradientCSS(draft):draft.color);
  $('#gradient-summary').hidden=!draft.gradient||gradientPicker;
  $('.fields').hidden=!!draft.gradient&&!gradientPicker;
  if(draft.gradient){$('#gradient-summary').replaceChildren();draft.gradient.colors.forEach((color,index)=>{const button=document.createElement('button');button.textContent=color.slice(1);button.onclick=()=>openGradientPicker(index);$('#gradient-summary').append(button);if(index===0){const arrow=document.createElement('span');arrow.className='gradient-transition';const icon=document.createElement('img');icon.src='assets/gradient-transition.png';icon.alt='→';arrow.append(icon);$('#gradient-summary').append(arrow);}});}
  preview.style.setProperty('--preview-alpha',empty||draft.gradient?1:draft.alpha/100);
  preview.style.setProperty('--preview-blur',((draft.blur||0)/2)+'px');
  styleTexture($('#preview-texture'),draft);
  renderEffects();
  syncPin();
  renderPicker();
  if(activeScreen==='gradient')renderGradients();
  if(activeScreen==='gradient-editor')renderGradientEditor();
}
function renderApplied(){
  const baseColor=applied.gradient?.colors[0]||applied.color||'#F8F8F8';
  const channels=baseColor.slice(1).match(/../g)?.map(value=>parseInt(value,16))||[248,248,248];
  const lightness=(channels[0]*.2126+channels[1]*.7152+channels[2]*.0722)/255;
  $('.photo-only-header-content').style.setProperty('--header-skeleton',applied.mode==='media'||lightness<.8?'rgba(255,255,255,.35)':'rgba(51,51,51,.05)');
  if(typeof renderAppliedMedia==='function'&&renderAppliedMedia())return;
  const empty=applied.color===null,bg=$('#background');
  bg.style.display=empty?'none':'block';
  bg.style.background=empty?'transparent':applied.gradient?gradientCSS(applied):applied.color;
  bg.style.opacity=applied.gradient?1:applied.alpha/100;
  const texture=$('#background-texture');styleTexture(texture,applied);
  texture.style.opacity=applied.gradient?1:applied.alpha/100;
  texture.style.filter='none';
  $('#background-surface').style.filter=`blur(${(applied.blur||0)/2}px)`;
}
function commit(){
  hideTooltip();
  applied={...draft};
  if(applied.mode!=='media')remember(applied);renderSaved();
  renderApplied();
  $('#dialog').hidden=true;
  if(typeof closeMediaOverlays==='function')closeMediaOverlays();
  $('#mine-menu').hidden=true;
  $('#effects-menu').hidden=true;
}
function renderBackgroundPalette(values=colors){
  $('#palette').replaceChildren();
  for(const color of values){const b=document.createElement('button');b.className='swatch';b.style.background=color||'white';attachTooltip(b,{color,alpha:100});if(!color)b.classList.add('no-color');b.onclick=()=>{draft={color,alpha:100};commit();};$('#palette').append(b);}
}
renderBackgroundPalette();
$('#apply').onclick=commit;$('#close').onclick=()=>{draft={...snapshot};update();$('#dialog').hidden=true;};$('#reset').onclick=()=>{draft={...snapshot};if((activeScreen==='gradient-editor'&&!draft.gradient)||(activeScreen==='media'&&!draft.media))setScreen('palette');update();};$('#open').onclick=()=>{pickerHistoryPinned.clear();snapshot={...applied};draft={...applied};setScreen(applied.mode==='media'?'media':'palette');update();$('#dialog').hidden=false;};
$('#hex').onchange=e=>{const v=e.target.value.replace(/[^a-f0-9]/gi,'');if(v)setEditingColor('#'+v.repeat(6).slice(0,6).toUpperCase(),editingColor().alpha);update();};$('#alpha').oninput=e=>{setEditingColor(editingColor().color,Math.max(0,Math.min(100,Number(e.target.value))));updatePreview();};
$('#drag').onpointerdown=e=>{if(e.target.closest('button,input'))return;const d=$('#dialog'),r=d.getBoundingClientRect(),base=$('.editor').getBoundingClientRect(),dx=e.clientX-r.left,dy=e.clientY-r.top;d.style.right='auto';$('#drag').setPointerCapture(e.pointerId);$('#drag').onpointermove=m=>{d.style.left=Math.max(0,Math.min(658,m.clientX-base.left-dx))+'px';d.style.top=Math.max(0,Math.min(712,m.clientY-base.top-dy))+'px';};$('#drag').onpointerup=()=>{$('#drag').onpointermove=null;};};
function hexToHSV(hex){
  const [r,g,b]=[1,3,5].map(index=>parseInt(hex.slice(index,index+2),16)/255);
  const max=Math.max(r,g,b),min=Math.min(r,g,b),delta=max-min;
  let h=pickerHSV.h;
  if(delta){h=max===r?60*((g-b)/delta%6):max===g?60*((b-r)/delta+2):60*((r-g)/delta+4);h=(h+360)%360;}
  return{h,s:max?delta/max:0,v:max};
}
function hsvToHex({h,s,v}){
  const c=v*s,x=c*(1-Math.abs((h/60)%2-1)),m=v-c;
  const rgb=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];
  return '#'+rgb.map(channel=>Math.round((channel+m)*255).toString(16).padStart(2,'0')).join('').toUpperCase();
}
function syncPickerFromDraft(){
  if(draft.color)pickerHSV=hexToHSV(editingColor().color);
  renderPicker();
}
function renderPicker(){
  const editing=editingColor(),color=editing.color||'#FFFFFF';
  $('#sv-picker').style.setProperty('--hue-color',`hsl(${pickerHSV.h} 100% 50%)`);
  $('#sv-thumb').hidden=draft.color===null;
  $('#sv-thumb').style.left=(pickerHSV.s*100)+'%';
  $('#sv-thumb').style.top=((1-pickerHSV.v)*100)+'%';
  $('#sv-thumb').style.borderColor=pickerHSV.v>.6?'#222':'#fff';
  $('#sv-picker').setAttribute('aria-valuenow',String(Math.round(pickerHSV.s*100)));
  $('#sv-picker').setAttribute('aria-valuetext',`Насыщенность ${Math.round(pickerHSV.s*100)}%, яркость ${Math.round(pickerHSV.v*100)}%`);
  $('#hue-thumb').style.top=(pickerHSV.h/360*246)+'px';
  $('#hue-thumb').style.background=`hsl(${pickerHSV.h} 100% 50%)`;
  $('#hue-picker').setAttribute('aria-valuenow',String(Math.round(pickerHSV.h)));
  $('#opacity-picker').style.setProperty('--opacity-color',color);
  $('#opacity-thumb').style.top=((1-editing.alpha/100)*246)+'px';
  $('#opacity-thumb').style.background=color;
  $('#opacity-picker').setAttribute('aria-valuenow',String(editing.alpha));
}
function renderPickerHistory(){
  const entries=getHistoryColors().filter(value=>!value.gradient&&(!isSaved(value)||pickerHistoryPinned.has(colorKey(value))));
  $('#picker-history').hidden=gradientPicker||entries.length===0;
  $('#picker-history-colors').replaceChildren();
  for(const value of entries)$('#picker-history-colors').append(savedSwatch(value));
}
function setScreen(screen){
  hideTooltip();$('#mine-menu').hidden=true;activeScreen=screen;
  $('#palette-screen').hidden=screen!=='palette';
  $('#picker-screen').hidden=screen!=='picker';
  $('#texture-screen').hidden=screen!=='texture';
  $('#effects-menu').hidden=true;
  $('#gradient-screen').hidden=screen!=='gradient';
  $('#gradient-editor').hidden=screen!=='gradient-editor';
  $('#gradient-type-menu').hidden=true;
  if(screen!=='picker')gradientPicker=false;
  if(screen==='gradient')renderGradients();
  if(screen==='gradient-editor')renderGradientEditor();
  if(screen==='picker'){syncPickerFromDraft();renderPickerHistory();}
  if(screen==='texture')renderTextures();
  if(typeof renderMediaScreen==='function')renderMediaScreen(screen);
}
function applyPickerColor(){setEditingColor(hsvToHex(pickerHSV),editingColor().alpha);update(true);}
function bindPickerDrag(selector,change){
  const target=$(selector);let pointer=null;
  const move=event=>{
    const rect=target.getBoundingClientRect();
    const x=Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width));
    const inset=selector==='#sv-picker'?0:12;
    const y=Math.max(0,Math.min(1,(event.clientY-rect.top-inset)/(rect.height-inset*2)));
    change(x,y);event.preventDefault();
  };
  target.onpointerdown=event=>{if(event.button!==0)return;pointer=event.pointerId;target.setPointerCapture(pointer);target.focus();move(event);};
  target.onpointermove=event=>{if(event.pointerId===pointer)move(event);};
  target.onpointerup=target.onpointercancel=()=>{pointer=null;};
}
bindPickerDrag('#sv-picker',(x,y)=>{pickerHSV.s=x;pickerHSV.v=1-y;applyPickerColor();});
bindPickerDrag('#hue-picker',(_,y)=>{pickerHSV.h=y*359.99;applyPickerColor();});
bindPickerDrag('#opacity-picker',(_,y)=>{setEditingColor(editingColor().color,Math.round((1-y)*100));$('#alpha').value=editingColor().alpha;updatePreview();});
$('#sv-picker').onkeydown=event=>{
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
  event.preventDefault();const step=event.shiftKey ? .1 : .01;
  if(event.key==='ArrowLeft')pickerHSV.s=Math.max(0,pickerHSV.s-step);
  if(event.key==='ArrowRight')pickerHSV.s=Math.min(1,pickerHSV.s+step);
  if(event.key==='ArrowUp')pickerHSV.v=Math.min(1,pickerHSV.v+step);
  if(event.key==='ArrowDown')pickerHSV.v=Math.max(0,pickerHSV.v-step);
  applyPickerColor();
};
for(const selector of ['#hue-picker','#opacity-picker'])$(selector).onkeydown=event=>{
  if(!['ArrowUp','ArrowDown','Home','End'].includes(event.key))return;
  event.preventDefault();const step=event.shiftKey?10:1,up=event.key==='ArrowUp';
  if(selector==='#hue-picker'){
    pickerHSV.h=event.key==='Home'?0:event.key==='End'?359.99:Math.max(0,Math.min(359.99,pickerHSV.h+(up?-step:step)));applyPickerColor();
  }else{
    setEditingColor(editingColor().color,event.key==='Home'?100:event.key==='End'?0:Math.max(0,Math.min(100,editingColor().alpha+(up?step:-step))));$('#alpha').value=editingColor().alpha;updatePreview();
  }
};
$('#open-picker').onclick=()=>{gradientPicker=false;delete draft.gradient;update();setScreen('picker');};
$('#picker-back').onclick=()=>{setScreen(gradientPicker?'gradient-editor':'palette');update();};
$('#preview').onclick=()=>{if(draft.gradient){setScreen('gradient-editor');}else{gradientPicker=false;setScreen('picker');}};
const textureNames=['Без текстуры','Треугольники','Волны','Рельеф','Штрихи','Точки','Соты','Сетка'];
function textureInk(color){
  if(!color)return '#000000';
  const [r,g,b]=[1,3,5].map(index=>parseInt(color.slice(index,index+2),16));
  return r*.299+g*.587+b*.114<128?'#FFFFFF':'#000000';
}
function styleTexture(element,value){
  const index=value.texture||0;
  element.hidden=!index||value.color===null;
  element.style.setProperty('--texture-mask',index?`var(--texture-${index})`:'none');
  element.style.setProperty('--texture-ink',textureInk(value.color));
  element.style.filter=element===$('#preview-texture')?'none':`blur(${(value.blur||0)/2}px)`;
}
function renderTextures(){
  $('#texture-options').replaceChildren();
  textureNames.forEach((name,index)=>{
    const option=document.createElement('button');option.className='texture-option';option.style.background=draft.gradient?gradientCSS(draft,true):draft.color||'#fff';
    option.setAttribute('aria-label',name);option.setAttribute('aria-pressed',String((draft.texture||0)===index));
    const pattern=document.createElement('span');pattern.className='texture-overlay';styleTexture(pattern,{...draft,texture:index,blur:0});option.append(pattern);
    option.onclick=()=>{draft.texture=index;setScreen('palette');update();};$('#texture-options').append(option);
  });
}
function renderEffects(){
  syncReset();
  $('#blur-controls').hidden=!draft.blurEnabled;
  $('#blur-range').value=draft.blur||0;$('#blur-value').value=draft.blur||0;
  $('#blur-range').style.setProperty('--range-fill',((draft.blur||0)/5*100)+'%');
  $('#open-effects').textContent=draft.blurEnabled?'Текстура':'Эффекты';
}
function syncReset(){
  const changed=colorKey(draft)!==colorKey(snapshot)||!!draft.blurEnabled!==!!snapshot.blurEnabled||(draft.mode||'color')!==(snapshot.mode||'color')||JSON.stringify(draft.media||null)!==JSON.stringify(snapshot.media||null);
  $('#reset').disabled=!changed;
  $('#reset').classList.toggle('has-changes',changed);
}
$('#open-effects').onclick=()=>{
  if(draft.blurEnabled){setScreen('texture');return;}
  hideTooltip();$('#mine-menu').hidden=true;
  const menu=$('#effects-menu');
  if(!menu.hidden){menu.hidden=true;return;}
  const rect=$('#open-effects').getBoundingClientRect(),dialog=$('#dialog').getBoundingClientRect();
  menu.style.left=(rect.left-dialog.left-20)+'px';menu.style.top=(rect.top-dialog.top-8)+'px';menu.hidden=false;
};
$('#effects-close').onclick=()=>{$('#effects-menu').hidden=true;};
$('#choose-texture').onclick=()=>setScreen('texture');
$('#texture-back').onclick=()=>setScreen('palette');
$('#choose-blur').onclick=()=>{draft.blurEnabled=true;if(draft.blur===undefined)draft.blur=0;$('#effects-menu').hidden=true;renderEffects();};
function changeBlur(value){draft.blur=Math.max(0,Math.min(5,Number(value)||0));draft.blurEnabled=true;updatePreview();}
$('#blur-range').oninput=event=>changeBlur(event.target.value);
$('#blur-value').oninput=event=>changeBlur(event.target.value);
$('#blur-remove').onclick=()=>{draft.blur=0;draft.blurEnabled=false;updatePreview();};

function editingColor(){
  return gradientPicker&&draft.gradient?{color:draft.gradient.colors[gradientStop],alpha:draft.gradient.alphas[gradientStop]}:{color:draft.color,alpha:draft.alpha};
}
function setEditingColor(color,alpha){
  if(gradientPicker&&draft.gradient){changeGradientStop(gradientStop,{color,alpha});}
  else{draft.color=color;draft.alpha=alpha;}
}
function gradientCSS(value,opaque=false){
  const g=value.gradient;
  const rgba=(color,alpha)=>`rgba(${[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)).join(',')},${opaque?1:alpha/100})`;
  const stops=g.colors.map((color,index)=>`${rgba(color,g.alphas[index])} ${index===0?g.start:g.end}%`).join(',');
  return g.type==='radial'?`radial-gradient(ellipse ${g.radius||50}% ${g.radius||50}% at center,${stops})`:`linear-gradient(${g.angle}deg,${stops})`;
}
function defaultGradient(){
  const color=draft.color||'#FFFFFF',hsv=hexToHSV(color);
  const second=hsvToHex({...hsv,s:hsv.s>.01?Math.min(1,hsv.s*2.464):0,v:hsv.v>.65?Math.max(0,hsv.v-(hsv.s>.01?0:.15)):Math.min(1,hsv.v+.25)});
  return {type:'linear',angle:90,start:0,end:100,radius:50,colors:[color,second],alphas:[draft.alpha,draft.alpha]};
}
function ensureGradient(){if(!draft.gradient){draft.color=draft.color||'#FFFFFF';draft.gradient=defaultGradient();}}
function patchGradient(patch){draft.gradient={...draft.gradient,...patch};update();}
function changeGradientStop(index,patch){
  const g=draft.gradient,colors=[...g.colors],alphas=[...g.alphas];
  if(patch.color!==undefined)colors[index]=patch.color;
  if(patch.alpha!==undefined)alphas[index]=patch.alpha;
  draft.gradient={...g,colors,alphas};draft.color=colors[0];draft.alpha=alphas[0];
}
function renderGradients(){
  const base=draft.gradient||defaultGradient();
  const variants=[{type:'linear',angle:90},{type:'linear',angle:0},{type:'linear',angle:167.5085},{type:'linear',angle:10.8685},{type:'radial',radius:50,end:50.481},{type:'radial',radius:78.125}];
  const options=$('#gradient-options');options.replaceChildren();
  variants.forEach((variant,index)=>{
    const value={...draft,color:draft.color||'#FFFFFF',gradient:{...base,start:0,end:100,...variant}};
    const button=document.createElement('button');button.className='texture-option';button.style.background=gradientCSS(value,true);button.setAttribute('aria-label',`Градиент ${index+1}`);
    button.onclick=()=>{draft=value;setScreen('palette');update();};options.append(button);
  });
  const custom=document.createElement('button');custom.className='texture-option custom-gradient';custom.textContent='Свой градиент';
  const arrow=document.createElement('span');arrow.className='custom-gradient-arrow';arrow.setAttribute('aria-hidden','true');
  const icon=document.createElement('img');icon.src='assets/gradient-open.svg';icon.alt='';arrow.append(icon);custom.append(arrow);
  custom.onclick=()=>{ensureGradient();setScreen('gradient-editor');update();};options.append(custom);
  renderGradientHistory();
}
function renderGradientHistory(){
  const entries=getHistoryColors().filter(value=>value.gradient);
  $('#gradient-history').hidden=entries.length===0;
  $('#gradient-history-colors').replaceChildren(...entries.map(savedSwatch));
  $('#gradient-editor-history').hidden=entries.length===0;
  $('#gradient-editor-history-colors').replaceChildren(...entries.map(savedSwatch));
}
function renderGradientEditor(){
  if(!draft.gradient)return;
  renderGradientHistory();
  const g=draft.gradient;
  $('#gradient-type').firstChild.textContent=g.type==='linear'?'Линейный':'Радиальный';
  document.querySelectorAll('#gradient-type-menu button').forEach(button=>{
    const selected=button.dataset.type===g.type;
    button.setAttribute('role','menuitemradio');
    button.setAttribute('aria-checked',String(selected));
    let icon=button.querySelector('img');
    if(!icon){icon=document.createElement('img');icon.alt='';button.prepend(icon);}
    icon.src=selected?'assets/menu-radio-selected.svg':'assets/menu-radio-empty.svg';
  });
  $('#gradient-angle-field').hidden=g.type!=='linear';$('#gradient-rotate').hidden=g.type!=='linear';
  $('#gradient-angle').value=Math.round(g.angle)%360;
  $('.gradient-track-fill').style.background=`${gradientCSS({...draft,gradient:{...g,type:'linear',angle:90}})},url('assets/checkerboard.png') left top/10px 10px,#fff`;
  document.querySelectorAll('.gradient-stop').forEach((button,index)=>{
    const position=index===0?g.start:g.end;
    button.style.left=`calc(${position}% - ${position/100*28}px)`;
    styleGradientColorCircle(button,g.colors[index],g.alphas[index]);
    button.classList.toggle('active',gradientStop===index);
    button.setAttribute('aria-valuenow',String(position));
  });
  const position=gradientStop===0?g.start:g.end;
  $('#gradient-active-pointer').style.left=`calc(${position}% + ${10-position*.28}px)`;
  const rows=$('#gradient-rows');
  // Keep inputs mounted while typing; update values only when they are not focused.
  if(!rows.children.length){
    for(let index=0;index<2;index++){
      const row=document.createElement('div');row.className='gradient-color-row';row.dataset.stop=index;
      row.innerHTML=`<button class="swatch" aria-label="Изменить цвет ${index+1}"></button><span class="format">HEX<img src="assets/arrow.svg" alt=""></span><span class="hex-field"><span>#</span><input class="gradient-hex" maxlength="6" aria-label="Цвет ${index+1}"></span><label><input class="gradient-alpha" type="number" min="0" max="100" aria-label="Непрозрачность цвета ${index+1}">%</label>`;
      row.onpointerdown=()=>{gradientStop=index;renderGradientEditor();};
      row.querySelector('button').onclick=()=>openGradientPicker(index);
      const open=document.createElement('button');open.className='gradient-row-open';open.setAttribute('aria-label',`Открыть выбор цвета ${index+1}`);
      const arrow=document.createElement('img');arrow.src='assets/gradient-open.svg';arrow.alt='';open.append(arrow);
      open.onclick=()=>openGradientPicker(index);row.append(open);
      row.querySelector('.gradient-hex').onchange=event=>{
        const hex=event.target.value.replace(/[^a-f0-9]/gi,'');
        if(hex)changeGradientStop(index,{color:'#'+hex.repeat(6).slice(0,6).toUpperCase()});update();
      };
      row.querySelector('.gradient-alpha').oninput=event=>{changeGradientStop(index,{alpha:Math.max(0,Math.min(100,Number(event.target.value)||0))});updatePreview();};
      rows.append(row);
    }
  }
  [...rows.children].forEach((row,index)=>{
    row.classList.toggle('active',gradientStop===index);
    styleGradientColorCircle(row.querySelector('.swatch'),g.colors[index],g.alphas[index]);
    const hex=row.querySelector('.gradient-hex'),alpha=row.querySelector('.gradient-alpha');
    if(document.activeElement!==hex)hex.value=g.colors[index].slice(1);
    if(document.activeElement!==alpha)alpha.value=g.alphas[index];
  });
}
function styleGradientColorCircle(element,color,alpha){
  const translucent=color+Math.round(alpha/100*255).toString(16).padStart(2,'0');
  element.style.background=`linear-gradient(to right,${color} 50%,transparent 50%),linear-gradient(${translucent},${translucent}),url('assets/checkerboard.png') left top/10px 10px,#fff`;
}
function openGradientPicker(index){
  ensureGradient();gradientStop=index;renderGradientEditor();
  const anchor=$(`#gradient-rows [data-stop="${index}"] .swatch`)||$(`.gradient-stop[data-stop="${index}"]`);
  openGradientColorDialog(index,anchor);
}
$('#open-gradient').onclick=()=>{gradientPicker=false;setScreen('gradient');update();};
$('#gradient-back').onclick=()=>{setScreen('palette');update();};
$('#gradient-editor-back').onclick=$('#gradient-breadcrumb').onclick=()=>{setScreen('gradient');update();};
$('#gradient-home').onclick=()=>{setScreen('palette');update();};
$('#gradient-type').onclick=()=>{const menu=$('#gradient-type-menu');menu.hidden=!menu.hidden;$('#gradient-type').setAttribute('aria-expanded',String(!menu.hidden));};
document.querySelectorAll('#gradient-type-menu button').forEach(button=>button.onclick=()=>{patchGradient({type:button.dataset.type});$('#gradient-type-menu').hidden=true;$('#gradient-type').setAttribute('aria-expanded','false');});
$('#gradient-angle').onchange=event=>patchGradient({angle:((Math.round(Number(event.target.value)||0)%360)+360)%360});
$('#gradient-rotate').onclick=()=>patchGradient({angle:(draft.gradient.angle+90)%360});
$('#gradient-swap').onclick=()=>{const g=draft.gradient;draft.gradient={...g,colors:[...g.colors].reverse(),alphas:[...g.alphas].reverse()};draft.color=draft.gradient.colors[0];draft.alpha=draft.gradient.alphas[0];update();};
document.querySelectorAll('.gradient-stop').forEach((button,index)=>{
  let pointer=null,startX=0,startY=0,dragged=false;
  const move=event=>{
    const rect=$('#gradient-track').getBoundingClientRect(),g=draft.gradient;
    let position=Math.max(0,Math.min(100,(event.clientX-rect.left-14)/(rect.width-28)*100));
    position=Math.round(index===0?Math.min(position,g.end):Math.max(position,g.start));
    patchGradient(index===0?{start:position}:{end:position});
  };
  button.onpointerdown=event=>{if(event.button!==0)return;gradientStop=index;pointer=event.pointerId;startX=event.clientX;startY=event.clientY;dragged=false;button.setPointerCapture(pointer);button.focus();renderGradientEditor();event.preventDefault();};
  button.onpointermove=event=>{if(pointer===event.pointerId){if(Math.hypot(event.clientX-startX,event.clientY-startY)>3)dragged=true;if(dragged)move(event);}};
  button.onpointerup=()=>{if(pointer!==null&&!dragged)openGradientColorDialog(index,button);pointer=null;};
  button.onpointercancel=()=>{pointer=null;};
  button.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();openGradientColorDialog(index,button);}});
  button.onkeydown=event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();gradientStop=index;const g=draft.gradient,current=index===0?g.start:g.end,step=event.shiftKey?10:1;let position=event.key==='Home'?0:event.key==='End'?100:current+(event.key==='ArrowLeft'?-step:step);position=Math.max(index===0?0:g.start,Math.min(index===0?g.end:100,position));patchGradient(index===0?{start:position}:{end:position});};
});
renderApplied();update();

