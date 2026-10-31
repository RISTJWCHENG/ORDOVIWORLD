const key='catalog:appearance:v1';
export function currentTheme(){return document.documentElement.dataset.theme==='dark'?'dark':'light';}
export function setTheme(value){
 const theme=value==='dark'?'dark':'light',changed=document.documentElement.dataset.theme!==theme;
 document.documentElement.dataset.theme=theme;
 document.querySelectorAll('[data-theme-choice]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.themeChoice===theme)));
 if(changed)try{localStorage.setItem(key,theme);}catch{}
}
const sun='<circle cx="12" cy="12" r="3.5"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>';
const moon='<path d="M20.4 14.5A8.8 8.8 0 0 1 9.5 3.6 8.8 8.8 0 1 0 20.4 14.5Z"/>';
export function appearanceControls(){return `<div class="account-appearance"><span>Theme</span><div class="theme-picker" role="group" aria-label="Background color">${[['light','Light',sun],['dark','Dark',moon]].map(([value,label,path])=>`<button type="button" data-theme-choice="${value}" aria-pressed="${currentTheme()===value}" aria-label="${label}"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg><span>${label}</span></button>`).join('')}</div></div>`;}
let installed=false;
export function initAppearance(){
 let theme='light';try{theme=localStorage.getItem(key)||'light';}catch{}setTheme(theme);
 if(installed)return;installed=true;
 const activate=event=>{const button=event.target.closest?.('[data-theme-choice]');if(button)setTheme(button.dataset.themeChoice);};
 document.addEventListener('pointerdown',event=>{if(event.isPrimary&&event.button===0)activate(event);},true);
 document.addEventListener('click',activate,true);
 addEventListener('storage',event=>{if(event.key===key)setTheme(event.newValue);});
}
