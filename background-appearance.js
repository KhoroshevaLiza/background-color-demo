// Presentation variants reuse the existing buttons and their handlers.
const backgroundAppearance={view:'main',other:'link',footer:'links'};
const otherColorButton=$('#open-picker'),paletteActions=$('#palette-screen>footer');
const gradientAction=$('#open-gradient'),textureAction=$('#open-effects');
paletteActions.classList.add('main-palette-actions');
const otherColorIcon=document.createElement('span');otherColorIcon.className='other-color-icon';otherColorIcon.setAttribute('aria-hidden','true');
otherColorIcon.innerHTML='<img src="assets/other-color-spectrum.png" alt="" width="28" height="28"><img src="assets/other-color-highlight.svg" alt="">';
const otherColorText=document.createElement('span');otherColorText.textContent='Другой цвет';otherColorButton.replaceChildren(otherColorIcon,otherColorText);
function applyBackgroundAppearance(){
 const main=backgroundAppearance.view==='main',dialog=$('#dialog'),media=activeScreen==='media'&&draft.media;
 dialog.classList.toggle('main-appearance',main);dialog.dataset.otherView=backgroundAppearance.other;dialog.dataset.footerView=backgroundAppearance.footer;
 gradientAction.hidden=false;textureAction.hidden=false;
 paletteActions.hidden=false;
 if(main&&backgroundAppearance.footer==='chips'){
  $('#dialog>.content').append(paletteActions);paletteActions.hidden=media||activeScreen!=='palette';
 }else $('#palette-screen').append(paletteActions);
 const settings=systemPanel.querySelector('.system-appearance');
 for(const element of [...settings.children].slice(2))element.hidden=!main;
 if(main){
  $('#palette').append(otherColorButton);
  if(!media){
   const blur=backgroundNavigation.querySelector('[data-navigation=blur]');if(blur)blur.textContent='Эффект';
   const mediaButtons=[...backgroundNavigation.children].filter(button=>button!==blur);
   paletteActions.replaceChildren(gradientAction,textureAction,...blur?[blur]:[],...mediaButtons);
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
}
const syncAppearanceNavigation=syncBackgroundNavigation;
syncBackgroundNavigation=function(){
 // Move commands out before rebuilding the navigation's generated buttons.
 paletteActions.append(gradientAction,textureAction);
 syncAppearanceNavigation();applyBackgroundAppearance();
};
const renderAppearancePalette=renderBackgroundPalette;
renderBackgroundPalette=function(...args){renderAppearancePalette(...args);applyBackgroundAppearance();};
systemPanel.querySelectorAll('.system-appearance .system-mode').forEach(group=>{
 group.querySelectorAll('button').forEach(button=>button.onclick=()=>{
  group.querySelectorAll('button').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  if(button.dataset.backgroundView)backgroundAppearance.view=button.dataset.backgroundView;
  if(button.dataset.otherColorView)backgroundAppearance.other=button.dataset.otherColorView;
  if(button.dataset.footerView)backgroundAppearance.footer=button.dataset.footerView;
  syncBackgroundNavigation();
 });
});
syncBackgroundNavigation();
