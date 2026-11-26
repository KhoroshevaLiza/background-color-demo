// Compare the proposed layouts with the original picture-only component.
let implementationMode='improved';
function isCurrentImplementation(){return implementationMode==='current';}
const currentHeaderTabs=document.createElement('div');currentHeaderTabs.id='current-header-tabs';currentHeaderTabs.hidden=true;currentHeaderTabs.setAttribute('role','group');currentHeaderTabs.setAttribute('aria-label','Тип фона');
currentHeaderTabs.innerHTML='<button data-current-type="color" aria-pressed="true">Цвет</button><button data-current-type="photo" aria-pressed="false">Картинка</button>';
$('#drag>.title').after(currentHeaderTabs);
function showCurrentPicture(anchor){
 retainWindowMedia();const selected=windowMediaSelections.get('photo')||(draft.media?.type==='photo'?draft.media:null);
 if(selected){closeMediaOverlays();draft.media=structuredClone(selected);draft.mode='media';setScreen('media');}
 else openLoadMenu('both',anchor);
}
currentHeaderTabs.querySelector('[data-current-type=color]').onclick=()=>{retainWindowMedia();closeMediaOverlays();showColorSettings();};
currentHeaderTabs.querySelector('[data-current-type=photo]').onclick=event=>showCurrentPicture(event.currentTarget);
function renderCurrentImplementation(){
 const dialog=$('#dialog'),media=activeScreen==='media'&&draft.media;
 closeBackgroundMore();dialog.classList.remove('main-appearance');dialog.classList.add('current-implementation');dialog.dataset.layout='current';dialog.dataset.mediaNavigation='tabs';
 variantThreeTabs.hidden=true;variantFourTabs.hidden=true;variantFourPipette.hidden=true;hiddenPaletteActions.append(variantFourPipette);
 currentHeaderTabs.hidden=false;
 for(const button of currentHeaderTabs.querySelectorAll('button'))button.setAttribute('aria-pressed',String((button.dataset.currentType==='photo')===!!media));
 gradientAction.hidden=false;textureAction.hidden=false;
 $('#palette-screen').append(paletteActions);paletteActions.hidden=activeScreen!=='palette';paletteActions.replaceChildren(otherColorButton,gradientAction,textureAction);
 variantThreeMediaActions.replaceChildren();variantThreeMediaActions.hidden=true;
 const effects=$('#media-effects');$('#media-screen').append(effects);
 if(media)effects.hidden=false;
}
function syncImplementationMode(){
 const current=isCurrentImplementation(),type=systemPanel.querySelector('[data-system-type][aria-checked=true]').dataset.systemType;
 document.body.classList.toggle('implementation-current',current);
 systemPanel.querySelector('.system-configuration').hidden=true;
 systemPanel.querySelector('.system-implementation').hidden=type==='trigger';
 systemPanel.querySelector('.system-appearance').hidden=type!=='background'||current;
 systemPanel.querySelectorAll('[data-implementation]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.implementation===implementationMode)));
 systemPanel.querySelector('[data-system-state=video]').hidden=current;mediaVideoAllowed=!current;
 currentHeaderTabs.hidden=!current;
 if(!current)$('#dialog').classList.remove('current-implementation');
 const footer=mediaColorDialog.querySelector('.color-dialog-footer');
 mediaColorDialog.classList.toggle('modern-color-dialog',!current);
 if(footer&&colorDialogOptions){
  if(current)$('#media-color-palette-card').append(footer);else mediaColorDialog.querySelector('.content').append(footer);
 }
}
const openImplementationLoadMenu=openLoadMenu;
openLoadMenu=function(type,anchor){
 if(!isCurrentImplementation()){openImplementationLoadMenu(type,anchor);return;}
 openImplementationLoadMenu('both',anchor||currentHeaderTabs.querySelector('[data-current-type=photo]'));
 const menu=$('#media-load-menu');menu.classList.add('media-load-popup');menu.setAttribute('aria-label','Загрузить картинку');uploadTitle.lastChild.textContent='Загрузить';
 $('[data-file=photo]').hidden=false;$('[data-file=video]').hidden=true;
 $('[data-upload-item=documents]').hidden=false;$('[data-upload-item=collection]').hidden=false;$('.media-collection').hidden=false;
 menu.style.left=(($('#dialog').clientWidth-menu.offsetWidth)/2)+'px';menu.style.top='4px';
};
for(const button of systemPanel.querySelectorAll('[data-implementation]'))button.onclick=()=>{
 if(button.dataset.implementation===implementationMode)return;
 const colorWasOpen=!mediaColorDialog.hidden&&!!colorDialogOptions?.standalone;
 retainWindowMedia();closeMediaOverlays();closeBackgroundMore();hideTooltip();$('#mine-menu').hidden=true;
 implementationMode=button.dataset.implementation;
 syncImplementationMode();
 if(isCurrentImplementation()&&draft.mode==='media'&&draft.media?.type==='video'){
  const photo=windowMediaSelections.get('photo');
  if(photo){draft.media=structuredClone(photo);draft.mode='media';setScreen('media');}
  else showColorSettings();
 }else{renderMediaScreen(activeScreen);}
 update();if(colorWasOpen)mediaColorDialog.hidden=false;if(!mediaColorDialog.hidden)positionColorDialog();
};
syncImplementationMode();

// Reveal the editor controls only after all layouts have been composed.
document.documentElement.removeAttribute('data-demo-initializing');
