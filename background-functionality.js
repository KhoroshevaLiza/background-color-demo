// Available tools are independent of the selected example and window layout.
const backgroundFeatures={photo:true,video:true,texture:true,effects:true};
function availableMediaType(){return backgroundFeatures.photo&&backgroundFeatures.video?'both':backgroundFeatures.photo?'photo':'video';}
function availableMediaLabel(){return backgroundFeatures.photo&&backgroundFeatures.video?'Картинка или видео':backgroundFeatures.photo?'Картинка':'Видео';}
const composeFeatureNavigation=syncBackgroundNavigation;
syncBackgroundNavigation=function(){
 composeFeatureNavigation();
 const media=activeScreen==='media'&&draft.media;
 for(const button of document.querySelectorAll('[data-navigation=media]')){button.textContent=availableMediaLabel();button.hidden=!backgroundFeatures.photo&&!backgroundFeatures.video;}
 textureAction.hidden=media||!backgroundFeatures.texture;
 if(!media&&activeScreen==='palette'&&backgroundFeatures.effects&&!draft.blurEnabled){
  const button=document.createElement('button');button.dataset.navigation='color-effects';button.textContent='Размытие';
  button.onclick=()=>{$('#choose-blur').click();};paletteActions.append(button);
 }
 systemPanel.querySelector('[data-system-state=photo]').hidden=!backgroundFeatures.photo;
 systemPanel.querySelector('[data-system-state=video]').hidden=!backgroundFeatures.video;
};
const openFeatureLoadMenu=openLoadMenu;
openLoadMenu=function(type,anchor){
 if(!backgroundFeatures.photo&&!backgroundFeatures.video)return;
 openFeatureLoadMenu(type==='both'?availableMediaType():type,anchor);
 // The chip remains a floating upload menu even when only one file type is allowed.
 const menu=$('#media-load-menu');
 if(menu.classList.contains('media-load-popup'))uploadTitle.lastChild.textContent=backgroundFeatures.photo&&backgroundFeatures.video?'Загрузить картинку или видео':backgroundFeatures.photo?'Загрузить картинку':'Загрузить видео';
};
function resetDisabledFeature(feature){
 closeMediaOverlays();closeBackgroundMore();
 if(feature==='photo'||feature==='video'){
  windowMediaSelections.delete(feature);if(lastWindowMediaType===feature)lastWindowMediaType=null;
  for(const value of [draft,applied,snapshot,systemColorDraft])if(value?.media?.type===feature){delete value.media;if(value.mode==='media')value.mode='color';}
  if(activeScreen==='media'&&!draft.media)setScreen('palette');
 }else{
  for(const value of [draft,applied,snapshot,systemColorDraft])if(value){
   if(feature==='texture')delete value.texture;
   else{value.blur=0;value.blurEnabled=false;}
  }
  if(feature==='texture'&&activeScreen==='texture')setScreen('palette');
 }
 update();
}
for(const checkbox of systemPanel.querySelectorAll('[data-background-feature]'))checkbox.onchange=()=>{
 const feature=checkbox.dataset.backgroundFeature;backgroundFeatures[feature]=checkbox.checked;
 if(!checkbox.checked)resetDisabledFeature(feature);
 renderMediaScreen(activeScreen);renderEffects();syncBackgroundNavigation();
};
syncBackgroundNavigation();
