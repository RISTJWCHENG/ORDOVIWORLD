import {currentPrincipal} from './auth.js';
import {readAppVotes,saveAppVote} from './icp-client.js';

export function initAppVotes(){
  const root=document.getElementById('app');
  if(!root)return;
  const selector='.grid > .card[data-project-id]';
  const records=new Map(),pending=new Set(),errors=new Map();
  let epoch=0,scheduled=false;
  const cards=()=>[...root.querySelectorAll(selector)].filter(card=>card.querySelector('.catalog-vote-panel'));
  function render(){
    for(const card of cards()){
      const id=card.dataset.projectId,record=records.get(id);
      for(const [key,value] of [['voteUpCount',record?.up],['voteDownCount',record?.down]]){
        if(value===undefined){if(key in card.dataset)delete card.dataset[key];}
        else if(card.dataset[key]!==String(value))card.dataset[key]=String(value);
      }
      for(const button of card.querySelectorAll('.catalog-vote-buttons button[data-vote]')){
        button.disabled=pending.has(id);
        button.setAttribute('aria-pressed',String(Number(record?.mine) === (button.dataset.vote==='up'?1:-1)));
      }
      const status=card.querySelector('.catalog-vote-feedback');
      const message=errors.get(id)||'';
      if(status&&status.textContent!==message)status.textContent=message;
    }
  }
  async function load(ids,principal,version){
    try{
      const result=await readAppVotes(ids,principal);
      if(version!==epoch)return;
      for(const entry of result)if(records.get(entry.id)===null)records.set(entry.id,entry);
    }catch{
      // Keep totals unavailable rather than showing a fictitious zero.
    }
    if(version===epoch)render();
  }
  function scan(){
    scheduled=false;
    const ids=[...new Set(cards().map(card=>card.dataset.projectId))].filter(id=>!records.has(id));
    const principal=currentPrincipal(),version=epoch;
    for(let offset=0;offset<ids.length;offset+=30){
      const batch=ids.slice(offset,offset+30);
      for(const id of batch)records.set(id,null);
      void load(batch,principal,version);
    }
    render();
  }
  function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(scan);}}
  new MutationObserver(entries=>{
    if(entries.some(e=>[...e.addedNodes].some(n=>n.nodeType===1&&(n.matches('.card,.catalog-vote-panel')||n.querySelector('.card,.catalog-vote-panel')))))schedule();
  }).observe(root,{childList:true,subtree:true});
  const reset=()=>{epoch++;records.clear();pending.clear();errors.clear();scan();};
  window.addEventListener('catalog:auth-changed',reset);
  window.addEventListener('catalog:user-data-deleted',reset);
  root.addEventListener('click',async event=>{
    const button=event.target.closest('.catalog-vote-buttons button[data-vote]');
    const card=button?.closest(selector),principal=currentPrincipal();
    if(!card||!principal)return;
    const id=card.dataset.projectId;
    if(pending.has(id))return;
    const vote=button.dataset.vote==='up'?1:-1;
    const next=Number(records.get(id)?.mine)===vote?0:vote;
    const version=epoch;
    pending.add(id);errors.delete(id);render();
    try{
      const result=await saveAppVote(id,next,principal);
      if(version===epoch)records.set(id,result);
    }catch{
      if(version===epoch)errors.set(id,'Could not save vote. Try again.');
    }finally{
      if(version===epoch){pending.delete(id);render();}
    }
  });
  schedule();
}
