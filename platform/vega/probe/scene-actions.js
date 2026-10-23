(() => {
 const send=data=>window.ReactNativeWebView?.postMessage(JSON.stringify(data));
 document.querySelector('#guidePanel')?.setAttribute('open','');
 document.querySelector('#guidePanel')?.scrollIntoView();
 const drill=document.querySelector('[data-prescribed="drill"]');
 const demo=document.querySelector('[data-prescribed="demo"]');
 if(!drill||!demo){send({testError:'Missing existing lesson controls'});return;}
 demo.focus();demo.click();send({testAction:'existing jab demo clicked'});
 setTimeout(()=>{drill.value='cross';drill.dispatchEvent(new Event('change',{bubbles:true}));send({testAction:'existing cross change dispatched'});},3000);
 setTimeout(()=>{drill.value='jab-cross';drill.dispatchEvent(new Event('change',{bubbles:true}));send({testAction:'existing jab-cross change dispatched'});},6000);
 setTimeout(()=>{const question=document.querySelector('#question');question.value='How do I keep my guard up?';document.querySelector('#ask')?.click();send({dialogueQuestion:question.value,dialogueReply:document.querySelector('#atlas')?.textContent});question.focus();},9000);
})();
