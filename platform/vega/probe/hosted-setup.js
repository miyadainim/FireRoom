(() => {
 // Use the current public entry action; never synthesize exercise success.
 const origin=document.querySelector('#phoneOrigin');if(origin)origin.value=location.origin;
 const connect=document.querySelector('[data-training="connect"]');
 if(connect&&!connect.hidden){connect.click();return;}
 // Retained for earlier manual UI builds only.
 if(document.querySelector('#pairQr')?.hidden)document.querySelector('#pairStart')?.click();
})();
