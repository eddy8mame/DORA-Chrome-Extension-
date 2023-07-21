let brand = document.getElementById('brand');
let name = document.getElementById('name');
let currency = document.getElementById('currency'); 
let price = document.getElementById('price');
let desc = document.getElementById('desc');
let siteUrl = document.getElementById('web');
let imgUrl = document.getElementById('product_image'); 


const product = {
  'brand.name': true,
  'description': true, 
  'image': [], 
  'name': true,
  'url':true, 
  'offers.price': true,
  'offers.priceCurrency': true,
  'contentUrl': true, 
}

const Sephora = {
  brand: true, 
  image: true, 
  name: true, 
  image: [], 
  'offer.priceCurrency': true, 
  'offer.price': true, 
  'offer.seller.name' : true, 
}


// matches for JSON schema from schema.org
// takes objects as argument
const readMessage = (obj) => {
  // declare stack - if passed-in obj contains nested obj nested obj will be pushed to stack
  const stack = []; 
  // push passed in obj
  stack.push({ obj: obj, path: '' });


  while (stack.length > 0) {
    // destruct object in stack, get obj and path
    const { obj, path } = stack.pop();
    console.log('Obj', obj)

    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        const newPath = path.length > 0 ? `${path}.${key}` : key; 

        // if value is an array, and ele in array are not objects, and key is image or images
        // can be adapted for both images and offers
        // if values is array and typeof value[0] !== 'object'
        // if key is image 
        // if key is offers 
        if (Array.isArray(value) && typeof value[0] !== 'object' && (key === 'image' || key === 'images')) {
          console.log(`Array at ${newPath}:`, value); 
          product['image'].push(...value); 

          // if value is and object and value is not null
        } else if (typeof value === 'object' && value !== null) {
          // push nested objects to the stack for further processing
          stack.push({ obj: value, path: newPath }); 
         
        } else {
          console.log(`Value at ${newPath}:`, value);
          if (product[`${newPath}`]) {
            product[`${newPath}`] = value; 
          }
          
        }
      }
    }
  }
  
  brand.textContent = product['brand.name'] ? product['brand.name'] : ""; 
  name.textContent = product['name'] ? product['name'] : ""; 
  // desc.textContent = product['description'] ? product['description'] : ""; 
  price.textContent = product['offers.price'] ? product['offers.price'] : ""; 
  currency.textContent = product['offers.priceCurrency'] ? product['offers.priceCurrency'] : ""; 
  imgUrl.src = (product['image'] && Array.isArray(product['image'])) ? product['image'][0] : product['image'];
  console.log(product)

}






// receives message from sendMessage, message is an array 
const getMessage = (msge) => {

  console.log('Message',msge)



  // helper function for getting content out of message
  // const readMessage = (msge) => {

    // if (msge['@type'] === 'Product' || msge['@context'] === 'https://schema.org') {
  

  //   if (Array.isArray(msge)) {

  //     for (let i = 0; i < msge.length; i++) {
  
  //       if (Array.isArray(msge[i])) {
  //         return readmsge(msge[i]);
  //       }
  
  //       // if JSON follows schema.org conventions
  //       if (msge[i]['@type'] === 'Product' || msge[i]['@context'] === 'https://schema.org') {
        
  //         console.log("'Type' or 'Content' match")
  
  //         msge[i]['name'] ? name = (msge[i]['name']) : name = "";
  
  //         msge[i]['brand'] && typeof msge[i]['brand'] !== 'object'
  //           ? brand = msge[i]['brand']
  //           : msge[i]['brand']
  //             ? ({ name: brand } = (msge[i]['brand']))
  //             : brand = "";
      
  //         if (msge[i]['offers']) {
  
  //           if (Array.isArray(msge[i]['offers'])) {
  //             console.log('Yes is array')
  //             msge[i]['offers'].forEach((o) => {
  //               if (o['price']) {
  //                 price = o['price'];
  //               }
  //               if (o['priceCurrency']) {
  //                 console.log('Yes, priceCurrency');
  //                 currency = o['priceCurrency'];
  //               }
  
  //             })
  //           } else {
  
  //             msge[i]['offers']['price'] ? { price } = msge[i]['offers'] : price = '';
  //             msge[i]['offers']['priceCurrency'] ? { priceCurrency: currency } = msge[i]['offers'] : priceCurrency = '';
  
  //           }
         
  //         }
        
  //         if (msge[i]['image']) {
  
  //           console.log('Yes, image exists')
  
  //           if (Array.isArray(msge[i]['image'])) {
  //             console.log('Yes, image is array')
  //             msge[i]['image'].forEach(e => {
  //               prod_image = e;
  //               console.log(prod_image)
  //             })
  //           } else {
  //             console.log('This seems straightforward enough')
  //             msge[i]['image'] ? prod_image = msge[i]['image'] : prod_image = '';
  //             console.log(prod_image)
  //           }
  
  //         }
            
  //       }

  //     }
  //   //} 



  msge.forEach(el => {
    if (typeof el === 'string') {
      try {
        const psdJ = JSON.parse(el);
        readMessage(psdJ);
      } catch (error) {
        console.log(error)
      }
    } else {
      readMessage(el);
    }
  });
  
} 

chrome.runtime.onMessage.addListener(function (message) {

  if (message.type === 'PAGE_CONTENT') {
    getMessage(message.content);
  } 

}); 

// get current page's tab
getCurrentTab = async () => {
  let queryOptions = { active: true };
  let [tab] = await chrome.tabs.query(queryOptions);

  const { url } = tab;

  siteUrl.textContent = new URL(url).hostname; 


  return tab;
}

// passes resolved promise getCurrentTab returns to injectContnentScript fn 
getCurrentTab().then((tab)=>{
  injectContentScript(tab)
})

// injects content script, takes tab arg, destructs id and url, executes script in current active tab 
injectContentScript = (tab) => {
  const { id, url } = tab;
  
  const hostname = new URL(url).hostname; 

  chrome.scripting.executeScript(
    {
      target: {tabId: id, allFrames: true},
      files: ['content.js']
    }
  )

}


// BOBBY's Edits

// THE CULPRITS

var domTree = document.getElementById("dom-tree");
var page = document.querySelector("body");
var highlight = document.getElementById("highlight");



// THE CREATION OF THE DOM TREE LOGIC

function createDomTree() {
  domTree.innerHTML = "";

  function walkElement(element, indent = 0) {
    domTree.appendChild(document.createTextNode("  ".repeat(indent)));

    var span = document.createElement("span");
    span.textContent = "<" + element.tagName.toLowerCase() + ">";
    span.attachedElement = element;
    element.attachedDomTreeElement = span;
    span.className = "dom-element";
    domTree.appendChild(span);

    domTree.appendChild(document.createTextNode("\n"));

    for (let child of element.children) {
      walkElement(child, indent + 1);
    }
  }

  walkElement(page);
}

let currentlyHighlightedItem = null;

function highlightElement(element, domTreeElement) {
  if (currentlyHighlightedItem == element)
    return;

  let rect = element.getBoundingClientRect();

  highlight.style.left = rect.x + "px";
  highlight.style.top = rect.y + "px";
  highlight.style.width = rect.width + "px";
  highlight.style.height = rect.height + "px";

  page.appendChild(highlight);
  
  let selectedDomTreeElement = document.querySelector(".dom-element.selected");
  if(selectedDomTreeElement) {
   selectedDomTreeElement.classList.remove("selected");
  }
  domTreeElement.classList.add("selected");

  currentlyHighlightedItem = element;
}

const myValues = {}

page.addEventListener("click", function(e) {
  let target = e.target;
  myValues[target.id] = target.textContent
 console.log(myValues)
});

page.addEventListener("mouseleave", function(e) {
  highlight.remove();
  currentlyHighlightedItem = null;
  let selectedDomTreeElement = document.querySelector(".dom-element.selected");
  if(selectedDomTreeElement) {
   selectedDomTreeElement.classList.remove("selected");
  }
});

// BOOTSTRAP

createDomTree();





/*

HTML 

<div id="content">
  <pre id="dom-tree"></pre>
  <div id="page">
    <h1>This is a <u>header</u></h1>
    <h2>Sub <i>header</i></h2>
    <p>some plain <span>old text</span>. Some of it is <b>bold</b>, some is <u>underlined</u> and others are <s>striked out</s>.</p>
    <p>This is a pragraph that contains a <a href="https://google.com">link to google.</a></p>
    <p>To do list:</p>
    <ul>
      <li>Add attributes to dom-tree</li>
      <li>Use some syntax highlighting</li>
      <li>Enjoy</li>
    </ul>
  </div>
  <div id="highlight"></div>
</div>

*/


// JavaScript

// Create var domTree, assign to the DOM (? unsure the specific element here, could be the document itself, but also the html tag
//   const domTree = document.querySelector('html') -> html element 
//   const page = document.querySelector('body') ->  body element 
//   const highlight = document.querySelector('#highlight') -> inject element with id 'highlight' into page


//   // Create Dom Tree Logic -> NOT NEEDED 

//   function createDomTree () {     // -> creates DomTree, DomTree is a copy of the page DOM
//     domTree.innerHTML = "";   // -> makes DomTree an empty string 
  
//     function walkElement(element, indent = 0) {           // -> add element tag to DomTree
//       domTree.appendChild(document.createTextNode(" ".repeat(indent)))      // -> used to create correct indentation on DomTree copy

//       const span = document.createElement('span');              // -> declare var span, assign 'hollow' span element 
//       span.textContent = '<' + element.tagName.toLowerCase() + '>';  // -> assign textContent of span element to the tagName
//       span.attachedElement = element; 
//       elemet.attchedDomTreeElement = span; 
//       span.className = 'dom-element'; 
//       domTree.appendChild(span);

//       domTree.appendChild(document.createTextNode('\n\));

//       for (let child of element.children) {
//         walkElement(child, indent + 1); 
//       }
//     }

//     walkElement(page);
//   }


//   // Highlighting Logic 

//   let currentlyHighlightedItem = null; 

//   function highlightElement(element, domTreeElement) {
//     if (currentlyHighlightedItem == element)
//       return; 

//     let rect = element.getBoundingClientRect(); 

//     highlight.style.left = rect.x + 'px'; 
//     highlight.style.top = rect.y + 'px'; 
//     highlight.style.width = rect.width + 'px'; 
//     highlight.style.height = rect.height + 'px'; 

//     page.appendChild(highlight);

//     let selectedDomTreeElement = document.querySelector('.dom-element.selected'); 
//     if (selectedDomTreeElement) {
//       selectedDomTreeElement.classList.remove('selected'); 
//     }
//     domTreeElement.classList.add('selected'); 

//     currentlyHighlightedItem = element; 
//   }

//   // EVENTS 
//   // on the dom tree elements 

//   domTree.addEventListener('mousemove', function (e) {
  
//     let target = e.target; 
    
//     if (target.classList.contains('dom-element')) {
//       highlightElement(target.attachedElement, target); 
//     }
//   }, true); 

//   domTree.addEventListener('mouseleave', function(e) {
  
//     highlight.remove(); 
//     currentlyHighlightedItem = null;    
//     let selectedDomTreeElement = document.querySelector('.dom-element.selected')

//     if (selectedDomTreeElement) {
//       selectedDomTreeElement.classList.remove('selected');
//     }
//   }); 

//   // on page itself

//   page.addEventListener('mousemove', function(e) {
    
//     let target = e.target; 

//     if (target.attachedDomTreeElement) {
//       highlightElement(target, target.attachedDomTreeElement); 
//     }
//   }, true); 

//   const myValues = {
 
//   }
  
//   page.addEventListener("click", function(e) {
//     let target = e.target;
//     myValues[target.id] = target.textContent
//    console.log(myValues)
//   });

//   page.addEventListener('mouseleave', function(e) {
  
//     highlight.remove(); 
//     currentlyHighlightedItem = null; 

//     let selectedDomTreeElement = document.querySelector('.dom-element.selected'); 

//     if (selectedDomTreeElement) {
//       selectedDomTreeElement.classList.remove('selected'); 
//     }
//   }); 

//   createDomTree(); 

// } 
/*

CSS

#content {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  padding: 5px;
}

#dom-tree {
  flex: 30%;
  margin: 0;
  border: 1px solid black;
}

#page {
  flex: 70%;
  margin-left: 5px;
  border: 1px solid black;
}

#highlight {
  position: absolute;
  background-color: blue;
  opacity: 0.4;
  text-align: center;
  border: 1px solid red;
  box-sizing: border-box;
  pointer-events: none;
}

.dom-element.selected {
  background-color: yellow;
}

*/

// let currentlyHighlightedItem = null; 

// function highlightElement(element, domTreeElement) {
//   if (currentlyHighlightedItem == element)
//     return; 
  
//   let rect = element.getBoundClientRect(); 

//   highlight.style.left = rect.x + 'px'; 
//   highlight.style.top = rect.y + 'px'; 
//   highlight.style.width = rect.width + 'px'; 
//   highlight.style.height = rect.height + 'px'; 

//   page.appendChild(highlight); 

//   let selectedDomTreeElement = document.querySelector('.dom-element.selected'); 

//   if (selectedDomTreeElement) {
//     selectedDomTreeElement.classList.remove('selected'); 
//   }
  
//   domTreeElement.classList.add('selected');

//   currentlyHighlightedItem = element; 





//   /*

//   // THE CULPRITS

// var domTree = document.getElementById("dom-tree");
// var page = document.getElementById("page");
// var highlight = document.getElementById("highlight");



// // THE CREATION OF THE DOM TREE LOGIC

// function createDomTree() {
//   domTree.innerHTML = "";

//   function walkElement(element, indent = 0) {
//     domTree.appendChild(document.createTextNode("  ".repeat(indent)));

//     var span = document.createElement("span");
//     span.textContent = "<" + element.tagName.toLowerCase() + ">";
//     span.attachedElement = element;
//     element.attachedDomTreeElement = span;
//     span.className = "dom-element";
//     domTree.appendChild(span);

//     domTree.appendChild(document.createTextNode("\n"));

//     for (let child of element.children) {
//       walkElement(child, indent + 1);
//     }
//   }

//   walkElement(page);
// }



// // THE HIGHLIGHTING LOGIC

// let currentlyHighlightedItem = null;

// function highlightElement(element, domTreeElement) {
//   if (currentlyHighlightedItem == element)
//     return;

//   let rect = element.getBoundingClientRect();

//   highlight.style.left = rect.x + "px";
//   highlight.style.top = rect.y + "px";
//   highlight.style.width = rect.width + "px";
//   highlight.style.height = rect.height + "px";

//   page.appendChild(highlight);

//   let selectedDomTreeElement = document.querySelector(".dom-element.selected");
//   if (selectedDomTreeElement) {
//     selectedDomTreeElement.classList.remove("selected");
//   }
//   domTreeElement.classList.add("selected");

//   currentlyHighlightedItem = element;
// }



// // EVENTS

// // on the dom tree elements

// domTree.addEventListener("mousemove", function(e) {
//   let target = e.target;
//   if (target.classList.contains("dom-element")) {
//     highlightElement(target.attachedElement, target);
//   }
// }, true);

// domTree.addEventListener("mouseleave", function(e) {
//   highlight.remove();
//   currentlyHighlightedItem = null;
//   let selectedDomTreeElement = document.querySelector(".dom-element.selected");
//   if (selectedDomTreeElement) {
//     selectedDomTreeElement.classList.remove("selected");
//   }
// });

// // on the page itself

// page.addEventListener("mousemove", function(e) {
//   let target = e.target;
//   if (target.attachedDomTreeElement) {
//     highlightElement(target, target.attachedDomTreeElement);
//   }
// }, true);

// page.addEventListener("mouseleave", function(e) {
//   highlight.remove();
//   currentlyHighlightedItem = null;
//   let selectedDomTreeElement = document.querySelector(".dom-element.selected");
//   if (selectedDomTreeElement) {
//     selectedDomTreeElement.classList.remove("selected");
//   }
// });

// // BOOTSTRAP

// createDomTree();


//   */
  



