(() => {
  const xpathToMatch = "//script[contains(@type, 'json')]";
  const xpathResult = document.evaluate(xpathToMatch, document, null, XPathResult.ANY_TYPE, null);

  const nodes = []; 
  let node; 

  while (node = xpathResult.iterateNext()) {
    nodes.push(node.textContent); 
  }

  // console.log(nodes); 
  const JSONObjs = []; 
  nodes.forEach((j) => JSONObjs.push(j))
  console.log("JSON Objects Arr", JSONObjs); 


  const parsedJSONObjs = JSONObjs.map((jO) => {
    try {
      const pJSON = JSON.parse(jO);
      return pJSON; 
    } catch (error) {
      console.log(error)
    }
  })

  // for (let i = 0; i < JSONObjs.length; i++) {
  //   try {
  //     const pJSON = JSON.parse(JSONObjs[i])
  //     console.log(pJSON); 
  //   } catch(error) {
  //     console.log(error)
  //   }
  // }


  console.log("Parsed JSON Objects Arr", parsedJSONObjs)

  if (parsedJSONObjs.length !== 0) {
    chrome.runtime.sendMessage({ type:'PAGE_CONTENT', content: parsedJSONObjs });
  } 

  console.log('message should be sent')
})(); 





