const colorDemo=document.createElement('section');colorDemo.id='color-demo';colorDemo.hidden=true;colorDemo.setAttribute('aria-label','Демонстрация настройки цвета');
colorDemo.innerHTML='<img class="color-demo-environment" alt="Окружение настройки цвета"><div class="color-palette-mask"></div><button class="color-demo-reopen" aria-label="Открыть настройку цвета"></button><button class="color-variable-row primary" aria-label="Изменить Основной цвет"><i class="color-variable-dot"></i><span>Основной</span><span class="color-variable-code"></span></button><button class="color-variable-row other" aria-label="Изменить Другой цвет"><i class="color-variable-dot"></i><span>Текст</span><span class="color-variable-code"></span></button>';
$('.editor').append(colorDemo);
colorDemo.querySelector('.color-demo-environment').src='assets/color-palette-environment.png';
const colorDemoPalette=['#F6733C','#313E78','#12A12C','#ECB956','#DC2219','#6757B7','#000000','#999999','#2562AA','#8991A9','#FFF8F5','#F5FAFF','#F5FFF7','#FFFCF5','#FFF5F5','#F7F5FF','#FFFFFF'];
const standaloneColors={boundaries:{color:'#F6733C',alpha:100},background:{color:'#F6733C',alpha:100},primary:{color:'#F6733C',alpha:100},other:{color:'#CC3D00',alpha:100},accent:{color:'#F6733C',alpha:100}};
let standaloneState='first',colorDemoActive=false,backgroundCollectionView=null;
const standaloneSavedFixtures=['#47382F','#E0C491','#F9F4EF'].map(color=>({color,alpha:100}));
const standaloneHistoryFixtures=['#74675F','#D8B575','#FFFFFF'].map(color=>({color,alpha:100}));
const usage=document.createElement('div');usage.className='color-usage';usage.hidden=true;$('#media-color-picker').append(usage);
function renderColorUsage(options){
 usage.hidden=!options.variable;
 if(!options.variable)return;
 usage.innerHTML='<div class="color-usage-title">Где используется</div><div class="color-usage-grid">'+['Фон','Текст','Граница'].map(label=>`<span class="color-usage-item"><img src="assets/color-usage-${options.variable==='primary_text-color'&&label==='Текст'?'checked':'empty'}.svg" alt="">${label}</span>`).join('')+'</div>';
}
function paintStandaloneValue(element,value){
 element.style.setProperty('--color-demo-value',value.color||'#fff');element.style.setProperty('--color-demo-alpha',value.alpha/100);element.classList.toggle('empty',value.color===null);
}
function standaloneKey(){return standaloneState==='primary'?'primary':standaloneState==='other'?'other':standaloneState==='absolute'?'accent':standaloneState==='none'?'background':'boundaries';}
function renderStandaloneEnvironment(){
 const variable=standaloneState==='primary'||standaloneState==='other',absolute=standaloneState==='absolute',none=standaloneState==='none';
 colorDemo.querySelector('.color-demo-environment').src=`assets/color-${variable?'variables':absolute?'absolute':none?'none':'palette'}-environment.png`;
 colorDemo.querySelector('.color-palette-mask').hidden=variable||absolute||none;
 const reopen=colorDemo.querySelector('.color-demo-reopen');reopen.hidden=variable;reopen.classList.toggle('absolute',absolute);paintStandaloneValue(reopen,standaloneColors[standaloneKey()]);
 for(const key of ['primary','other']){const button=colorDemo.querySelector('.color-variable-row.'+key),value=standaloneColors[key];button.hidden=!variable;paintStandaloneValue(button,value);button.querySelector('.color-variable-code').textContent=value.color+Math.round(value.alpha/100*255).toString(16).padStart(2,'0').toUpperCase();}
}
function configureStandaloneCollections(){
 collectionDisplay.hiddenSaved.clear();collectionDisplay.hiddenHistory.clear();
 collectionDisplay.savedFallback=standaloneState==='typical'?standaloneSavedFixtures:[];
 collectionDisplay.historyFallback=standaloneState==='typical'?standaloneHistoryFixtures:[];
 if(standaloneState==='first'||standaloneState==='none'){
  collectionDisplay.hiddenSaved=new Set(savedColors.map(colorKey));collectionDisplay.hiddenHistory=new Set(historyColors.map(colorKey));
 }
}
function openStandaloneColor(){
 if(!colorDemoActive)return;
 const key=standaloneKey(),variable=key==='primary'||key==='other',absolute=key==='accent',none=key==='background';
 const title=variable?(key==='primary'?'Основной':'Текст'):absolute?'Акцентный':none?'Фон':'Границы';
 const position=variable?{left:616,top:key==='primary'?38:80}:absolute?{left:530,top:55}:none?{left:145,top:239}:{left:192,top:196};
 const anchor=variable?colorDemo.querySelector('.color-variable-row.'+key):colorDemo.querySelector('.color-demo-reopen');
 openColorDialog({value:standaloneColors[key],title,host:colorDemo,anchor,standalone:true,position,palette:colorDemoPalette,allowNone:none,pickerOnly:variable||absolute,hideCollections:variable||absolute,variable:variable?(key==='primary'?'primary_color':'primary_text-color'):'',onConfirm:value=>{standaloneColors[key]={...value};renderStandaloneEnvironment();}});
}
function selectStandaloneState(state){
 standaloneState=state;closeColorDialog();configureStandaloneCollections();renderStandaloneEnvironment();
 systemPanel.querySelectorAll('[data-color-state]').forEach(button=>button.setAttribute('aria-checked',String(button.dataset.colorState===state)));
 openStandaloneColor();
}
function renderColorDemo(show){
 if(show===colorDemoActive)return;
 closeColorDialog();hideTooltip();
 if(show){
  backgroundCollectionView={savedFallback:collectionDisplay.savedFallback,historyFallback:collectionDisplay.historyFallback,hiddenSaved:new Set(collectionDisplay.hiddenSaved),hiddenHistory:new Set(collectionDisplay.hiddenHistory)};
  colorDemoActive=true;colorDemo.hidden=false;$('.editor').classList.add('color-demo-mode');stopPreviewVideo();
  selectStandaloneState(standaloneState);
 }else{
  colorDemoActive=false;colorDemo.hidden=true;$('.editor').classList.remove('color-demo-mode');
  if(backgroundCollectionView)Object.assign(collectionDisplay,backgroundCollectionView);
  $('#dialog').append(mediaColorDialog);renderSaved();syncPin();
 }
}
colorDemo.querySelector('.color-demo-reopen').onclick=openStandaloneColor;
for(const key of ['primary','other'])colorDemo.querySelector('.color-variable-row.'+key).onclick=()=>selectStandaloneState(key);
systemPanel.querySelectorAll('[data-color-state]').forEach(button=>button.onclick=()=>selectStandaloneState(button.dataset.colorState));
