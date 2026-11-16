const triggerDemo=document.createElement('section');triggerDemo.id='trigger-demo';triggerDemo.hidden=true;triggerDemo.setAttribute('aria-label','Вызывающий элемент — примеры');
const triggerDot=kind=>`<span class="trigger-dot ${kind}">${kind==='photo'?'<img src="assets/trigger-photo.png" alt="">':''}</span>`;
const triggerClear='<span class="media-glyph trigger-clear" aria-hidden="true">&#xE66C;</span>';
const triggerLink='<span class="media-glyph trigger-link" aria-hidden="true">&#xE6D0;</span>';
const triggerBubble=(kind,text,{dot=kind,link=false,clear=false}={})=>`<span class="trigger-sample"><span class="trigger-bubble ${kind}">${triggerDot(dot)}<span>${text}</span>${link?triggerLink:''}</span>${clear?triggerClear:''}</span>`;
const triggerRows=[
 ['<img src="assets/trigger-empty.svg" alt="Без цвета">','Пустое представление','Первый вход в настройки или после сброса значения.'],
 [triggerBubble('blue','#A39C97')+triggerDot('blue'),'Выбрано значение','Возможен один из двух вариантов отображения: с выбранным значением или только круг.'],
 [triggerBubble('translucent','#A39C97, 0.2')+triggerDot('translucent'),'Цвет/фон с прозрачностью','Когда у цвета или фона непрозрачность меньше 100%, половина превью заливается цветом с непрозрачностью, а вторая половина уже с настроенным значением прозрачности.'],
 [triggerBubble('palette','Акцентный 2',{dot:'blue',link:true})+triggerBubble('danger','Опасность',{link:true,clear:true}),'Цвет из цветовой палитры','Значение выбрано из набора цветовой палитры.<br>Значение ссылается на переменную. Связь можно разорвать, цвет останется кодом.'],
 [triggerBubble('dominant','Доминантный'),'Доминантный цвет','Значение автоматически рассчитывается на основе изображения или чего-либо.<br>Обычно используется в градиентах, наложенных на картинку.'],
 [triggerBubble('accent','Акцентный')+triggerBubble('text','Текст'),'Цвета по их ролям','Значение может выбираться по-разному: из темы, кодом или автоматически.<br>Применяется, когда иначе не понятна область применения цвета или таких областей несколько.'],
 [triggerBubble('hex','#B39519',{dot:'hex'})+triggerBubble('blue','#A39C97',{clear:true}),'Код цвета','Значение выбирается из колор-пикера или из наборов, заданных прикладным разработчиком.<br>Код цвета пишется в HEX-модели.'],
 [triggerBubble('linear','Линейный')+triggerBubble('radial','Радиальный',{clear:true}),'Градиент','Значение устанавливается посредством компонента настройки фона.<br>В названии указывается тип градиента.'],
 [triggerBubble('photo','Картинка',{clear:true}),'Картинка','Значение устанавливается посредством компонента настройки фона.<br>В названии указывается тип фона - "Картинка".']
];
triggerRows.forEach(([samples,title,description],index)=>{
 if(index>1){const separator=document.createElement('div');separator.className='trigger-separator'+(index===3?' emphasized':'');triggerDemo.append(separator);}
 const row=document.createElement('div');row.className='trigger-row';row.innerHTML=`<div class="trigger-examples">${samples}</div><div class="trigger-description"><h2>${title}</h2><p>${description}</p></div>`;triggerDemo.append(row);
});
$('.editor').append(triggerDemo);
function renderTriggerDemo(show){
 $('.editor').classList.toggle('trigger-mode',show);triggerDemo.hidden=!show;
 if(show){hideTooltip();stopPreviewVideo();}
}
