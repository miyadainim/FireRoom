(() => {
 const send=data=>window.ReactNativeWebView?.postMessage(JSON.stringify(data));
 const fetchOriginal=window.fetch.bind(window);let received=0;
 window.fetch=async(...args)=>{try{const response=await fetchOriginal(...args);const path=String(args[0]);if(path.startsWith('/api/frame')&&(!args[1]||!args[1].method||args[1].method==='GET')){response.clone().json().then(frame=>{if(frame){received++;if(received===1||received%30===0)send({vegaReceivedFrame:true,count:received,sequence:frame.sequence,tracking:frame.tracking,landmarks:frame.landmarks?.length,worldLandmarks:frame.worldLandmarks?.length,imageSize:frame.imageSize});}}).catch(()=>{});}if(!response.ok)send({networkError:path.split('?')[0],status:response.status});return response;}catch(e){send({networkError:String(args[0]).split('?')[0],error:String(e)});throw e;}};
 window.addEventListener('error',e=>send({hostedError:e.message}));
 let last='';setInterval(()=>{const snapshot={connection:document.querySelector('#connection')?.textContent,feedback:document.querySelector('#feedback')?.textContent,lesson:document.querySelector('[data-prescribed="status"]')?.textContent,assessment:document.querySelector('[data-prescribed="feedback"]')?.textContent};const text=JSON.stringify(snapshot);if(text!==last){last=text;send({hostedState:snapshot});}},1000);
})();
