// Presentation variants reuse the existing buttons and their handlers.
const backgroundAppearance={view:'main',other:'chip',footer:'chips',layout:2};
let sharedMediaNavigation='chip';
const otherColorButton=$('#open-picker'),paletteActions=$('#palette-screen>footer');
const gradientAction=$('#open-gradient'),textureAction=$('#open-effects');
paletteActions.classList.add('main-palette-actions');
const otherColorIcon=document.createElement('span');otherColorIcon.className='other-color-icon';otherColorIcon.setAttribute('aria-hidden','true');
otherColorIcon.innerHTML='<img src="assets/other-color-spectrum.png" alt="" width="28" height="28"><img src="assets/other-color-highlight.svg" alt="">';
const otherColorText=document.createElement('span');otherColorText.textContent='Другой цвет';otherColorButton.replaceChildren(otherColorIcon,otherColorText);
const hiddenPaletteActions=document.createElement('div');hiddenPaletteActions.hidden=true;$('#dialog').append(hiddenPaletteActions);
const backgroundMoreButton=document.createElement('button');backgroundMoreButton.id='background-more';backgroundMoreButton.setAttribute('aria-label','Другие настройки фона');backgroundMoreButton.setAttribute('aria-haspopup','menu');backgroundMoreButton.setAttribute('aria-expanded','false');
backgroundMoreButton.innerHTML='<img src="assets/background-more.svg" alt="" width="17" height="4">';
const backgroundMoreMenu=document.createElement('div');backgroundMoreMenu.id='background-more-menu';backgroundMoreMenu.className='media-options-menu background-more-menu';backgroundMoreMenu.hidden=true;backgroundMoreMenu.setAttribute('role','menu');backgroundMoreMenu.setAttribute('aria-label','Другие настройки фона');
function closeBackgroundMore(){backgroundMoreMenu.hidden=true;backgroundMoreButton.setAttribute('aria-expanded','false');}
for(const [label,action] of [['Другой цвет',()=>otherColorButton.click()],['Картинка или видео',()=>paletteActions.querySelector('[data-navigation="media"]').click()],['Градиент',()=>gradientAction.click()],['Текстура',()=>textureAction.click()]]){
 const item=document.createElement('button');item.textContent=label;item.setAttribute('role','menuitem');item.onclick=()=>{closeBackgroundMore();action();};backgroundMoreMenu.append(item);
}
const backgroundMoreClose=document.createElement('button');backgroundMoreClose.className='media-menu-close';backgroundMoreClose.setAttribute('aria-label','Закрыть другие настройки');backgroundMoreClose.innerHTML='<img src="assets/close.svg" alt="">';backgroundMoreClose.onclick=closeBackgroundMore;backgroundMoreMenu.append(backgroundMoreClose);$('#dialog').append(backgroundMoreMenu);
backgroundMoreButton.onclick=()=>{
 if(!backgroundMoreMenu.hidden){closeBackgroundMore();return;}
 hideTooltip();$('#mine-menu').hidden=true;closeMediaOverlays();backgroundMoreMenu.hidden=false;backgroundMoreButton.setAttribute('aria-expanded','true');placeMediaPopup(backgroundMoreMenu,backgroundMoreButton,{left:-12,top:-8,width:200,height:170});backgroundMoreMenu.querySelector('[role=menuitem]').focus();
};
document.addEventListener('pointerdown',event=>{if(!backgroundMoreMenu.contains(event.target)&&!backgroundMoreButton.contains(event.target))closeBackgroundMore();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!backgroundMoreMenu.hidden){closeBackgroundMore();backgroundMoreButton.focus();}});
const variantThreeTabs=document.createElement('nav');variantThreeTabs.id='variant-three-tabs';variantThreeTabs.hidden=true;variantThreeTabs.setAttribute('aria-label','Тип фона');
variantThreeTabs.innerHTML='<button data-variant-three="color" aria-pressed="true">Цвет</button><button data-variant-three="media" aria-pressed="false">Картинка или видео</button>';
$('#dialog').append(variantThreeTabs);
const variantThreeMediaActions=document.createElement('div');variantThreeMediaActions.className='variant-three-media-actions';$('#media-screen>.media-card').append(variantThreeMediaActions);
variantThreeTabs.querySelector('[data-variant-three=color]').onclick=()=>{retainWindowMedia();closeMediaOverlays();showColorSettings();};
function activateWindowMedia(anchor){
 retainWindowMedia();const selected=windowMediaSelections.get(lastWindowMediaType);
 if(selected){closeMediaOverlays();draft.media=structuredClone(selected);draft.mode='media';setScreen('media');}
 else openLoadMenu('both',anchor);
}
variantThreeTabs.querySelector('[data-variant-three=media]').onclick=event=>activateWindowMedia(event.currentTarget);
const variantFourTabs=document.createElement('div');variantFourTabs.id='variant-four-tabs';variantFourTabs.hidden=true;variantFourTabs.setAttribute('role','group');variantFourTabs.setAttribute('aria-label','Тип фона');
variantFourTabs.innerHTML='<button data-variant-four="color" aria-pressed="true">Цвет</button><button data-variant-four="media" aria-pressed="false">Картинка или видео</button>';
$('#drag>.title').after(variantFourTabs);
variantFourTabs.querySelector('[data-variant-four=color]').onclick=()=>{retainWindowMedia();closeMediaOverlays();showColorSettings();};
variantFourTabs.querySelector('[data-variant-four=media]').onclick=event=>activateWindowMedia(event.currentTarget);
const variantFourPipette=document.createElement('button');variantFourPipette.id='variant-four-pipette';variantFourPipette.className='variant-four-pipette';variantFourPipette.hidden=true;variantFourPipette.setAttribute('aria-label','Пипетка');variantFourPipette.innerHTML='<img src="assets/eyedropper-small.svg" alt="">';
$('#dialog>.content>.value-card>.pin').after(variantFourPipette);
bindScreenEyedropper(variantFourPipette,color=>{if(draft.gradient)changeGradientStop(gradientStop,{color});else setEditingColor(color,editingColor().alpha);update();});
function applyBackgroundAppearance(){
 if(typeof isCurrentImplementation==='function'&&isCurrentImplementation()){renderCurrentImplementation();return;}
 const main=backgroundAppearance.view==='main',dialog=$('#dialog'),media=activeScreen==='media'&&draft.media;
 closeBackgroundMore();dialog.dataset.layout=backgroundAppearance.layout;dialog.dataset.mediaNavigation=[1,2].includes(backgroundAppearance.layout)?sharedMediaNavigation:'tabs';
 const third=backgroundAppearance.layout===3,fourth=backgroundAppearance.layout===4,internalActions=third||fourth;variantThreeTabs.hidden=!third;variantFourTabs.hidden=!fourth;variantFourPipette.hidden=!fourth;
 for(const button of variantFourTabs.querySelectorAll('button'))button.setAttribute('aria-pressed',String((button.dataset.variantFour==='media')===!!media));
 const effects=$('#media-effects'),mediaCard=$('#media-screen>.media-card');
 if(!internalActions){variantThreeMediaActions.replaceChildren();$('#media-screen').append(effects);}
 else{
  for(const button of variantThreeTabs.querySelectorAll('button'))button.setAttribute('aria-pressed',String((button.dataset.variantThree==='media')===!!media));
 }
 dialog.classList.toggle('main-appearance',main);dialog.dataset.otherView=backgroundAppearance.other;dialog.dataset.footerView=backgroundAppearance.footer;
 gradientAction.hidden=false;textureAction.hidden=false;
 paletteActions.hidden=false;
 if(main&&backgroundAppearance.footer==='chips'){
  $('#dialog>.content').append(paletteActions);paletteActions.hidden=media||activeScreen!=='palette';
 }else $('#palette-screen').append(paletteActions);
 const settings=systemPanel.querySelector('.system-appearance');
 for(const element of settings.querySelectorAll('[data-navigation-control]'))element.hidden=fourth;
 for(const button of settings.querySelectorAll('[data-window-navigation]'))button.setAttribute('aria-pressed',String(button.dataset.windowNavigation===sharedMediaNavigation));
 if(main){
  $('#palette').append(otherColorButton);
  if(!media){
   const blur=backgroundNavigation.querySelector('[data-navigation=blur]');if(blur)blur.textContent='Эффект';
   const mediaButtons=[...backgroundNavigation.children].filter(button=>button!==blur);
   paletteActions.replaceChildren(...mediaButtons,gradientAction,textureAction);
  }else{
   paletteActions.replaceChildren(gradientAction,textureAction);
   gradientAction.hidden=true;textureAction.hidden=true;
  }
 }else{
  gradientAction.hidden=false;textureAction.hidden=false;
  paletteActions.replaceChildren(otherColorButton,gradientAction,textureAction);
 }
 // Media navigation does not include gradient or texture; keep these in the palette.
 if(media){paletteActions.append(gradientAction,textureAction);}
 if(internalActions){
  if(media){
   const effectsButton=backgroundNavigation.querySelector('[data-navigation=effects]');
   variantThreeMediaActions.replaceChildren(...third&&effectsButton?[effectsButton]:[]);
   if(draft.media.effectsEnabled){if(third)mediaCard.append(effects);else $('#media-screen').append(effects);variantThreeMediaActions.hidden=true;}
   else{$('#media-screen').append(effects);variantThreeMediaActions.hidden=!third||draft.media.type==='video';mediaCard.append(variantThreeMediaActions);}
  }else{
   if(fourth)$('#dialog>.content').append(paletteActions);else $('#palette-screen').append(paletteActions);
   paletteActions.hidden=activeScreen!=='palette';
   paletteActions.replaceChildren(...fourth?[variantFourPipette]:[],otherColorButton,gradientAction,textureAction);
   variantThreeMediaActions.replaceChildren();
  }
 }

 if(media&&[1,2].includes(backgroundAppearance.layout)&&sharedMediaNavigation==='chip'){
  const colorAction=document.createElement('button');colorAction.dataset.navigation='color';colorAction.textContent='Цвет';
  colorAction.onclick=()=>{retainWindowMedia();closeMediaOverlays();showColorSettings();};
  backgroundNavigation.prepend(colorAction);
 }
 if(main&&!media&&backgroundAppearance.layout===2)paletteActions.prepend(otherColorButton);
 if(main&&!media&&backgroundAppearance.layout===1){
  const mediaAction=paletteActions.querySelector('[data-navigation=media]');
  paletteActions.replaceChildren(otherColorButton,...mediaAction?[mediaAction]:[],backgroundMoreButton);hiddenPaletteActions.append(gradientAction,textureAction);
 }
}
const syncAppearanceNavigation=syncBackgroundNavigation;
syncBackgroundNavigation=function(){
 // Move commands out before rebuilding the navigation's generated buttons.
 paletteActions.append(gradientAction,textureAction);
 syncAppearanceNavigation();applyBackgroundAppearance();
};
const renderAppearancePalette=renderBackgroundPalette;
renderBackgroundPalette=function(...args){renderAppearancePalette(...args);applyBackgroundAppearance();};
function refreshMediaNavigation(){
 const loadMenu=$('#media-load-menu'),wasOpen=!loadMenu.hidden,replacing=uploadAnchor?.id==='media-replace';
 if(wasOpen)loadMenu.hidden=true;
 syncBackgroundNavigation();
 if(wasOpen)openLoadMenu('both',replacing?$('#media-replace'):backgroundAppearance.layout===4?variantFourTabs.querySelector('[data-variant-four=media]'):paletteActions.querySelector('[data-navigation=media]'));
}
for(const button of systemPanel.querySelectorAll('[data-window-navigation]')){
 button.disabled=false;button.onclick=()=>{sharedMediaNavigation=button.dataset.windowNavigation;refreshMediaNavigation();};
}
for(const layout of [1,2,4]){
 const button=systemPanel.querySelector(`[data-window-layout="${layout}"]`);button.disabled=false;
 button.onclick=()=>{
  backgroundAppearance.view='main';backgroundAppearance.other='chip';backgroundAppearance.footer='chips';backgroundAppearance.layout=layout;
  systemPanel.querySelectorAll('[data-window-layout]').forEach(item=>item.setAttribute('aria-pressed',String(Number(item.dataset.windowLayout)===layout)));
  refreshMediaNavigation();
 };
}
syncBackgroundNavigation();
