/* Shared bottom navigation for the background editor. */
// Keep blur in its own card below the palette actions.
$('#palette-screen').after($('#blur-controls'));
const backgroundNavigation=document.createElement('nav');
backgroundNavigation.id='background-navigation';backgroundNavigation.setAttribute('aria-label','Тип фона');
$('#dialog').append(backgroundNavigation);
let uploadMediaType='both',uploadAnchor=null,lastWindowMediaType=null;
const windowMediaSelections=new Map();
function retainWindowMedia(){if(draft.mode==='media'&&draft.media){lastWindowMediaType=draft.media.type;windowMediaSelections.set(draft.media.type,structuredClone(draft.media));}}
function syncBackgroundNavigation(){
  const media=activeScreen==='media'&&draft.media;
  backgroundNavigation.replaceChildren();
  const items=media?[['effects','Эффекты']]:[['media','Картинка или видео']];
  for(const [action,label] of items){
    const button=document.createElement('button');button.textContent=label;button.dataset.navigation=action;
    button.onclick=()=>{
      if(action==='media'){
        const selected=windowMediaSelections.get(lastWindowMediaType);
        if(selected){closeMediaOverlays();draft.media=structuredClone(selected);draft.mode='media';setScreen('media');}
        else openLoadMenu('both',button);
        return;
      }
      if(action==='photo'||action==='video'){
        retainWindowMedia();
        const selected=windowMediaSelections.get(action);
        if(selected){closeMediaOverlays();draft.media=structuredClone(selected);draft.mode='media';setScreen('media');}
        else openLoadMenu(action,button);
        return;
      }
      if(action==='color'){retainWindowMedia();$('#tab-color').click();return;}
      if(action==='blur'){$('#choose-blur').click();syncBackgroundNavigation();return;}
      draft.media.effectsEnabled=true;renderMediaScreen('media');
    };
    if(action==='effects')button.hidden=!!draft.media.effectsEnabled;
    backgroundNavigation.append(button);
  }
}
const renderNavigationMedia=renderMediaScreen;
renderMediaScreen=function(screen){
  renderNavigationMedia(screen);
  if(screen==='media'&&draft.media){
    retainWindowMedia();
    const effects=$('#media-effects');effects.hidden=!draft.media.effectsEnabled;
    if(!effects.querySelector('.media-effects-heading')){
      const heading=document.createElement('div');heading.className='media-effects-heading';heading.innerHTML='<span>Эффекты</span>';const remove=$('#blur-remove').cloneNode(true);remove.removeAttribute('id');remove.className='effects-remove';remove.setAttribute('aria-label','Удалить эффекты');heading.append(remove);
      heading.querySelector('button').onclick=()=>{const defaults=defaultMedia(draft.media.type);for(const key of ['alpha','blur','contrast','saturation','temperature'])draft.media[key]=defaults[key];draft.media.effectsEnabled=false;renderMediaScreen('media');};effects.prepend(heading);
    }
  }
  syncBackgroundNavigation();
};
const renderNavigationEffects=renderEffects;
renderEffects=function(){renderNavigationEffects();$('#open-effects').textContent='Текстура';syncBackgroundNavigation();};
$('#open-effects').onclick=()=>setScreen('texture');
const menuHeading=$('.media-load-heading');
menuHeading.firstChild.remove();
const uploadTitle=document.createElement('span');uploadTitle.className='upload-title';uploadTitle.innerHTML='<span class="media-glyph large">&#xE671;</span>Загрузить';menuHeading.prepend(uploadTitle);
const uploadItems=$('.media-load-items').children;
uploadItems[2].dataset.uploadItem='documents';uploadItems[3].dataset.uploadItem='collection';
openLoadMenu=function(type,anchor){
  if(type==='photo'||type==='video'||type==='both')uploadMediaType=type;
  else uploadMediaType=draft.media?.type||uploadMediaType;
  uploadAnchor=anchor instanceof HTMLElement?anchor:uploadAnchor;
  hideTooltip();$('#media-options-menu').hidden=true;
  const menu=$('#media-load-menu'),video=uploadMediaType==='video',both=uploadMediaType==='both',popup=uploadAnchor?.id==='media-replace'||uploadAnchor?.dataset.variantThree==='media'||uploadAnchor?.dataset.variantFour==='media'||(uploadAnchor?.dataset.navigation==='media'&&$('#dialog').dataset.mediaNavigation==='chip');
  menu.classList.toggle('media-load-popup',popup);
  uploadTitle.lastChild.textContent=popup?'Загрузить картинку или видео':'Загрузить';
  menu.dataset.type=uploadMediaType;menu.setAttribute('aria-label',both?'Картинка или видео':video?'Загрузить видео':'Загрузить картинку');
  $('[data-upload-item="documents"]').hidden=!video&&!both;
  $('[data-upload-item="collection"]').hidden=video;
  $('.media-collection').hidden=video;
  document.querySelectorAll('[data-file]').forEach(button=>button.hidden=!both&&button.dataset.file!==uploadMediaType);
  menu.hidden=false;$('#media-load-scroll').scrollTop=0;
  if((!both||popup)&&uploadAnchor?.isConnected){
    let left=-20,top=24;
    if(uploadMediaType==='video'&&uploadAnchor.dataset.navigation==='video'){
      const titleRange=document.createRange();titleRange.selectNodeContents(uploadTitle.lastChild);
      const buttonRange=document.createRange();buttonRange.selectNodeContents(uploadAnchor);
      left=buttonRange.getBoundingClientRect().left-uploadAnchor.getBoundingClientRect().left-(titleRange.getBoundingClientRect().left-menu.getBoundingClientRect().left);
      top=buttonRange.getBoundingClientRect().top-uploadAnchor.getBoundingClientRect().top-(titleRange.getBoundingClientRect().top-menu.getBoundingClientRect().top);
    }
    if(popup){
      left=uploadAnchor.offsetWidth-menu.offsetWidth+8;top=-8;
    }else if(uploadAnchor.id==='media-replace'){
      const source=uploadAnchor.querySelector('.media-glyph').getBoundingClientRect();
      const target=uploadTitle.querySelector('.media-glyph').getBoundingClientRect();
      const origin=menu.getBoundingClientRect(),anchorRect=uploadAnchor.getBoundingClientRect();
      left=source.left+source.width/2-anchorRect.left-(target.left+target.width/2-origin.left);
      top=source.top+source.height/2-anchorRect.top-(target.top+target.height/2-origin.top);
    }
    placeMediaPopup(menu,uploadAnchor,{left,top});
    if(uploadAnchor.dataset.variantFour==='media'||(uploadAnchor.dataset.navigation==='media'&&$('#dialog').dataset.mediaNavigation==='chip'))menu.style.left=(($('#dialog').clientWidth-menu.offsetWidth)/2)+'px';
    if(uploadAnchor.dataset.navigation==='media'&&$('#dialog').dataset.mediaNavigation==='chip')menu.style.top='4px';
  }
};
$('#media-replace').onclick=event=>openLoadMenu('both',event.currentTarget);
const chooseFilteredMedia=chooseMediaFile;
chooseMediaFile=function(){if(uploadMediaType!=='both'&&finderSelection!==uploadMediaType)return;chooseFilteredMedia();};
$('#finder-open').onclick=()=>chooseMediaFile();
$('#media-load-close').onclick=()=>{$('#media-load-menu').hidden=true;};
$('#tab-media').onclick=()=>openLoadMenu(draft.media?.type||'photo',backgroundNavigation.querySelector('button'));
$('#blur-remove').addEventListener('click',syncBackgroundNavigation);
$('.system-mode[aria-label="Доступные медиа"]').hidden=true;
renderEffects();renderMediaScreen(activeScreen);
// These selections belong to one open background window only.
const commitWindowMedia=commit;
commit=function(options){const result=commitWindowMedia(options);windowMediaSelections.clear();lastWindowMediaType=null;return result;};
$('#apply').onclick=commit;
for(const id of ['#close','#open','#reset'])$(id).addEventListener('click',()=>windowMediaSelections.clear());
new MutationObserver(()=>{if($('#dialog').hidden){windowMediaSelections.clear();lastWindowMediaType=null;}}).observe($('#dialog'),{attributes:true,attributeFilter:['hidden']});
// Loading is a drill-down inside the Background window.
const combinedUploadHeading=document.createElement('div');combinedUploadHeading.className='combined-upload-heading picker-heading';
combinedUploadHeading.innerHTML='<button class="back-round" aria-label="Назад из загрузки"><img src="assets/picker-back.svg" alt=""></button><span>Картинка или видео</span>';
menuHeading.append(combinedUploadHeading);
combinedUploadHeading.querySelector('button').onclick=()=>{$('#media-load-menu').hidden=true;};
const mediaHeading=document.createElement('div');mediaHeading.className='media-drill-heading picker-heading';
mediaHeading.innerHTML='<button class="back-round" aria-label="Назад к цвету"><img src="assets/picker-back.svg" alt=""></button><span>Картинка или видео</span>';
$('#media-screen>.media-card').prepend(mediaHeading);
mediaHeading.querySelector('button').onclick=()=>{retainWindowMedia();closeMediaOverlays();$('#tab-color').click();};
