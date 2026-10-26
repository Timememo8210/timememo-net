const gallery=document.querySelector('#gallery');
const side=document.querySelector('#side'),stack=document.querySelector('#stack');
function layout(stacked){gallery.classList.toggle('stacked',stacked);side.setAttribute('aria-pressed',String(!stacked));stack.setAttribute('aria-pressed',String(stacked));}
side.addEventListener('click',()=>layout(false));stack.addEventListener('click',()=>layout(true));
const dialog=document.querySelector('#lightbox');
document.querySelectorAll('.image-open').forEach(button=>button.addEventListener('click',()=>{document.querySelector('#lightbox-img').src=button.dataset.image;document.querySelector('#lightbox-img').alt=button.dataset.title;document.querySelector('#lightbox-title').textContent=button.dataset.title;dialog.showModal();}));
dialog.querySelector('.close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
