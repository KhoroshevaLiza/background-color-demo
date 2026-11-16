const systemPanel=document.createElement('aside');systemPanel.className='system-panel';systemPanel.setAttribute('aria-label','Системная область');
systemPanel.innerHTML=`
 <div class="system-device"><span class="system-device-icon"><img src="assets/system-monitor.svg" alt=""></span><span class="system-device-caption">1024х768 рх монитор</span></div>
 <div class="system-box"><div class="system-white" role="radiogroup" aria-label="Тип окна">
  <button class="system-radio" role="radio" data-system-type="background" aria-checked="true">Фон</button><button class="system-radio" role="radio" data-system-type="color" aria-checked="false">Цвет</button><button class="system-radio" role="radio" data-system-type="trigger" aria-checked="false">Вызывающий элемент</button>
 </div></div>
 <div class="system-box" data-system-section="background">
  <div class="system-mode" aria-label="Доступные медиа"><button data-media-mode="video" aria-pressed="true">с видео</button><button data-media-mode="photo" aria-pressed="false">только картинка</button></div>
  <div class="system-white" role="radiogroup" aria-label="Состояние фона">
   <button class="system-radio" role="radio" data-system-state="first" aria-checked="true">Первый вход</button>
   <button class="system-radio" role="radio" data-system-state="typical" aria-checked="false">Типовое</button>
   <button class="system-radio nested" role="radio" data-system-state="history" aria-checked="false">Есть история. Нет своих</button>
   <button class="system-radio nested" role="radio" data-system-state="saved" aria-checked="false">Есть история. Есть свои</button>
   <button class="system-radio" role="radio" data-system-state="max" aria-checked="false">Максимальное</button>
  </div>
  <div class="system-caption">Сценарии</div>
  <div class="system-white" role="radiogroup" aria-label="Сценарий фона">
   <button class="system-radio" role="radio" data-system-state="color" aria-checked="false">Настройка цвета</button>
   <button class="system-radio" role="radio" data-system-state="photo" aria-checked="false">Настройка картинки</button>
   <button class="system-radio" role="radio" data-system-state="video" aria-checked="false">Настройка видео</button>
  </div>
 </div>
 <div class="system-box system-color-options" data-system-section="color" aria-label="Настройки цвета" hidden>
  <h2 class="system-heading">Произвольный цвет с выбором из готовых</h2>
  <div class="system-white"><button class="system-radio" role="radio" data-color-state="first" aria-checked="true">Первый вход</button><button class="system-radio" role="radio" data-color-state="typical" aria-checked="false">Типовое</button></div>
  <div class="system-caption">Настройки</div><div class="system-white"><button class="system-radio" role="radio" data-color-state="none" data-color-none aria-checked="false">С элементом "Без цвета"</button></div>
  <h2 class="system-heading">Настройка цвета в палитре</h2><div class="system-white"><button class="system-radio" role="radio" data-color-state="primary" aria-checked="false">Основной цвет</button><button class="system-radio" role="radio" data-color-state="other" aria-checked="false">Другой цвет</button></div>
  <h2 class="system-heading">Произвольный цвет в абсолюте</h2><div class="system-white"><button class="system-radio" role="radio" data-color-state="absolute" aria-checked="false">Типовое</button></div>
 </div>
 <div class="system-box system-contacts">
  <div class="system-contact"><img src="assets/system-designer.svg" alt=""><div class="system-contact-details"><span>Хорошева Елизавета</span><span class="system-link" aria-disabled="true">Согласование макета</span><div class="system-links"><span class="system-link" aria-disabled="true">Описание</span><img src="assets/system-api.svg" alt=""><span class="system-link" aria-disabled="true">API</span><span class="system-link" aria-disabled="true">WI</span></div></div></div>
  <div class="system-contact"><img src="assets/system-web.svg" alt=""><span>Бегунов Андрей</span></div>
 </div>`;
const demoLayout=document.createElement('div');demoLayout.className='demo-layout';$('.editor').before(demoLayout);demoLayout.append($('.editor'),systemPanel);
let mediaVideoAllowed=true,systemState='first',systemColorDraft=null;
const fixtureColor=(color,extra={})=>({color,alpha:100,...extra});
const fixtureGradient=(first,second,extra={})=>fixtureColor(first,{gradient:{type:'linear',angle:124,start:0,end:100,radius:50,colors:[first,second],alphas:[100,100],...extra}});
// Values and order from the typical/maximum frames in Figma.
const systemSavedFixtures=[
 fixtureColor('#FFFBE3'),fixtureGradient('#47B4CD','#47B4CD',{angle:123.69006843,start:35.647,end:83.824,alphas:[15,100]}),fixtureColor('#FFF8EB',{texture:3,swatchTextureSize:'193.5px 28px'}),fixtureColor('#03A2FE'),
 fixtureColor('#E59545'),fixtureColor('#D8B575'),fixtureColor('#F9F4EF'),fixtureColor('#47382F'),fixtureColor('#EDEAFA'),fixtureColor('#B3A5FB'),fixtureColor('#512EBB'),
 fixtureGradient('#47382F','#F9F4EF',{angle:123.69006843,start:35.647,end:83.824}),fixtureGradient('#66BACC','#FF00C7',{angle:180,start:40.104}),fixtureGradient('#B8C5C5','#AF04FF',{angle:180,alphas:[100,0]}),
 fixtureColor('#74675F'),fixtureColor('#000000',{alpha:50}),fixtureColor('#E0C491'),fixtureColor('#FD9A71'),fixtureColor('#FFFFFF')
];
const systemGreenGradient=fixtureGradient('#4DD66B','#00639C',{angle:52.43140938,start:37.169,end:61.936});
const systemWarmGradient=fixtureGradient('#CC3D00','#FACB5A',{type:'radial',radius:48.24});
const systemHistoryFixtures=[
 fixtureColor('#FFFFFF'),fixtureColor('#D8B575'),fixtureColor('#47382F'),systemGreenGradient,fixtureColor('#F9F4EF'),fixtureColor('#EEEBFF',{texture:6,swatchTextureSize:'193.5px 28px'}),systemWarmGradient
];
const systemMaximumHistoryFixtures=[
 systemGreenGradient,fixtureColor('#5191DC'),fixtureColor('#BBD3F6'),fixtureColor('#FF1756',{alpha:55}),fixtureColor('#EEEBFF',{texture:6,swatchTextureSize:'193.5px 28px'}),systemWarmGradient,
 fixtureColor('#1DA11D'),fixtureColor('#6AD77D'),fixtureColor('#B3A5FB',{alpha:50}),fixtureColor('#3563E9'),fixtureColor('#21856B'),fixtureColor('#9454C4')
];
function refreshSystemCollections(){renderSaved();syncPin();if(activeScreen==='picker')renderPickerHistory();document.dispatchEvent(new Event('color-collection-change'));}
function selectSystemState(state){
 if(state==='video'&&!mediaVideoAllowed)return;
 if(activeScreen!=='media'&&draft.mode!=='media')systemColorDraft=structuredClone(draft);
 closeColorDialog();closeMediaOverlays();hideTooltip();stopPreviewVideo();
 collectionDisplay.hiddenSaved.clear();collectionDisplay.hiddenHistory.clear();
 if(['first','history','typical','saved','max'].includes(state)){
  collectionDisplay.savedFallback=state==='max'?systemSavedFixtures:state==='typical'||state==='saved'?systemSavedFixtures.slice(0,4):[];
  collectionDisplay.historyFallback=state==='first'?[]:state==='max'?systemMaximumHistoryFixtures:systemHistoryFixtures;
  if(state==='first'||state==='history')collectionDisplay.hiddenSaved=new Set(savedColors.map(colorKey));
  if(state==='first')collectionDisplay.hiddenHistory=new Set(historyColors.map(colorKey));
 }
 snapshot=structuredClone(applied);
 if(state==='photo'||state==='video'){
  draft={...applied,mode:'media',media:defaultMedia(state)};setScreen('media');renderMediaScreen('media');
 }else{
  draft=structuredClone(systemColorDraft||((applied.mode!=='media')?applied:{color:'#FFFBE3',alpha:100}));
  draft.mode='color';setScreen('palette');update();
 }
 systemState=state;$('#dialog').hidden=false;
 systemPanel.querySelectorAll('[data-system-state]').forEach(button=>button.setAttribute('aria-checked',String(button.dataset.systemState===state)));
 refreshSystemCollections();
}
function setSystemMediaMode(allowVideo){
 mediaVideoAllowed=allowVideo;
 systemPanel.querySelectorAll('[data-media-mode]').forEach(button=>button.setAttribute('aria-pressed',String((button.dataset.mediaMode==='video')===allowVideo)));
 systemPanel.querySelector('[data-system-state="video"]').hidden=!allowVideo;
 $('#tab-media').textContent=allowVideo?'Медиа':'Картинка';
 const title=allowVideo?'Загрузить картинку или видео':'Загрузить';
 $('#media-load-menu .media-load-heading').firstChild.textContent=title;
 $('#media-load-menu').setAttribute('aria-label',title);
 $('[data-file="video"]').hidden=!allowVideo;
 if(!allowVideo&&finderSelection==='video'){finderSelection=null;$('#finder-open').disabled=true;$('[data-file="video"]').classList.remove('selected');}
 if(!allowVideo&&draft.media?.type==='video')selectSystemState('photo');
}
systemPanel.querySelectorAll('[data-system-state]').forEach(button=>button.onclick=()=>selectSystemState(button.dataset.systemState));
systemPanel.querySelectorAll('[data-media-mode]').forEach(button=>button.onclick=()=>setSystemMediaMode(button.dataset.mediaMode==='video'));
function selectSystemType(type){
 const returningFromTrigger=type==='background'&&$('.editor').classList.contains('trigger-mode');
 if(typeof renderTriggerDemo==='function')renderTriggerDemo(type==='trigger');
 if(typeof renderColorDemo==='function')renderColorDemo(type==='color');
 if(returningFromTrigger)setSystemMediaMode(true);
 systemPanel.querySelectorAll('[data-system-type]').forEach(button=>button.setAttribute('aria-checked',String(button.dataset.systemType===type)));
 systemPanel.querySelectorAll('[data-system-section]').forEach(section=>section.hidden=section.dataset.systemSection!==type);
 systemPanel.querySelector('.system-contacts').hidden=type==='trigger';
}
systemPanel.querySelectorAll('[data-system-type]').forEach(button=>button.onclick=()=>selectSystemType(button.dataset.systemType));
selectSystemType('background');
setSystemMediaMode(true);selectSystemState('first');
