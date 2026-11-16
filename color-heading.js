let colorHeading=null,colorHeadingOptions=null,colorHeadingEditing=false;
function configureColorHeading(options){
 if(!colorHeading){
  colorHeading=document.createElement('div');colorHeading.className='color-heading';
  const title=mediaColorDialog.querySelector('header .title'),variable=mediaColorDialog.querySelector('.color-variable-name');
  title.before(colorHeading);colorHeading.append(title,variable);
  const fields=document.createElement('div');fields.className='color-heading-fields';fields.hidden=true;
  const name=document.createElement('input');name.className='color-heading-name-input';name.setAttribute('aria-label','Название цвета');name.placeholder='Название';
  const divider=document.createElement('span');divider.className='color-heading-divider';divider.setAttribute('aria-hidden','true');
  const line=document.createElement('img');line.src='assets/color-heading-divider.svg';line.alt='';divider.append(line);
  const code=document.createElement('input');code.className='color-heading-variable-input';code.setAttribute('aria-label','Переменная цвета');
  fields.append(name,divider,code);colorHeading.append(fields);
  colorHeading.addEventListener('click',event=>{if(!colorHeadingEditing)startColorHeadingEdit(event.target===variable?'variable':'name');});
  colorHeading.addEventListener('keydown',event=>{if(!colorHeadingEditing&&(event.key==='Enter'||event.key===' ')){event.preventDefault();startColorHeadingEdit('name');}});
  colorHeading.addEventListener('pointerdown',event=>{if(colorHeadingOptions?.editableHeading)event.stopPropagation();});
  colorHeading.addEventListener('focusout',event=>{if(!colorHeading.contains(event.relatedTarget))finishColorHeadingEdit();});
  new ResizeObserver(balanceColorHeading).observe(colorHeading);
 }
 colorHeadingOptions=options;
 const enabled=!!options.editableHeading;
 colorHeading.classList.toggle('editable',enabled);colorHeading.classList.remove('editing','balanced');
 colorHeading.querySelector('.color-heading-fields').hidden=true;
 colorHeading.querySelector('.title').hidden=false;
 colorHeading.querySelector('.title').classList.remove('heading-empty');
 if(enabled)renderColorHeading();
 else{colorHeading.removeAttribute('role');colorHeading.removeAttribute('tabindex');colorHeading.removeAttribute('aria-label');}
}
function renderColorHeading(){
 const value=colorHeadingOptions?.editableHeading;if(!value)return;
 const title=colorHeading.querySelector('.title'),variable=colorHeading.querySelector('.color-variable-name');
 title.textContent=value.name||'Название';title.classList.toggle('heading-empty',!value.name);title.hidden=false;
 variable.textContent=value.variable;variable.hidden=!value.variable;
 mediaColorDialog.setAttribute('aria-label',value.name||'Название');
 colorHeading.setAttribute('role','button');colorHeading.tabIndex=0;colorHeading.setAttribute('aria-label','Редактировать название и переменную цвета');
 requestAnimationFrame(balanceColorHeading);
}
function balanceColorHeading(){
 if(!colorHeading||!colorHeadingOptions?.editableHeading||colorHeadingEditing||!colorHeading.clientWidth)return;
 colorHeading.classList.remove('balanced');
 const title=colorHeading.querySelector('.title'),variable=colorHeading.querySelector('.color-variable-name');
 if(!variable.hidden&&title.scrollWidth+variable.scrollWidth+8>colorHeading.clientWidth)colorHeading.classList.add('balanced');
}
function startColorHeadingEdit(field){
 const value=colorHeadingOptions?.editableHeading;if(!value)return;
 colorHeadingEditing=true;colorHeading.classList.add('editing');colorHeading.removeAttribute('role');
 colorHeading.querySelector('.title').hidden=true;colorHeading.querySelector('.color-variable-name').hidden=true;
 const name=colorHeading.querySelector('.color-heading-name-input'),variable=colorHeading.querySelector('.color-heading-variable-input');
 name.value=value.name;variable.value=value.variable;colorHeading.querySelector('.color-heading-fields').hidden=false;
 const input=field==='variable'?variable:name;input.focus();input.setSelectionRange(input.value.length,input.value.length);
}
function finishColorHeadingEdit(){
 if(!colorHeadingEditing)return;
 colorHeadingEditing=false;
 const value=colorHeadingOptions.editableHeading;
 value.name=colorHeading.querySelector('.color-heading-name-input').value;value.variable=colorHeading.querySelector('.color-heading-variable-input').value;
 colorHeading.classList.remove('editing');colorHeading.querySelector('.color-heading-fields').hidden=true;
 renderColorHeading();colorHeadingOptions.onHeadingChange?.();
}
