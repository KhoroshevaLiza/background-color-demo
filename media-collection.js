const mediaCollectionGroups=['Недавние','IT-технологии','Бизнес','Госорганы','Еда','Животные','Искусство','Красота','Обучение','Природа','Производство','Психология','Развитие','Спорт','Юмор'];
const individualCollectionImages={0:'collection-recent.png',1:'collection-it.png',2:'collection-business.png',4:'collection-food.png'};
mediaCollectionGroups.forEach((name,index)=>{
 const group=document.createElement('div');group.className='media-collection-group';
 const title=document.createElement('div');title.className='media-collection-title';title.textContent=name;
 const preview=document.createElement('div');preview.className='media-collection-preview';
 if(individualCollectionImages[index]){
  const img=document.createElement('img');img.src='assets/'+individualCollectionImages[index];img.alt=name;
  if(index===0)img.className='media-collection-recent';preview.append(img);
 }else{
  // Figma supplies the remaining thumbnails together as one original image asset.
  // An SVG viewport displays each original thumbnail without raster editing.
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox',`52 ${74+110*index} 300 68`);svg.setAttribute('preserveAspectRatio','xMidYMid slice');svg.setAttribute('role','img');svg.setAttribute('aria-label',name);
  const img=document.createElementNS('http://www.w3.org/2000/svg','image');img.setAttribute('href','assets/collection-groups.png');img.setAttribute('width','358');img.setAttribute('height','1700');svg.append(img);preview.append(svg);
 }
 group.append(title,preview);$('.media-collection').append(group);
});
