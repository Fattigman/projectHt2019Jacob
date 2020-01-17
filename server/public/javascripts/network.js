
const form = document.getElementById('module')

var gene = document.getElementById('gene')

var search = document.getElementById("search")

var checkbox = document.getElementById("checkbox");

var checkbox2 = document.getElementById("checkbox2");

var reset = document.getElementById("reset1");

var cy;

// Fetch genes belonging to an annotation term
async function term2gene(type, terms) {
    const response = await fetch("https://franklin.upsc.se:5432/athaliana/term-to-gene", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body  : JSON.stringify({
          target:[{
            name: type,
            terms: terms
          }]
        })
    });
    const json = await response.json();
    // console.log(response.headers.raw())
    return json;
}

// Fetch annotations for one (or several) genes
async function gene2term(type, genes) {
    const response = await fetch("https://franklin.upsc.se:5432/athaliana/gene-to-term", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            target: type,
            genes: genes
        })
    });
    const json = await response.json();
    return json;
}
// gene2term("go", ["AT2G07714"]).then(json => console.log(json)).catch((error) => {console.error('Error:', error);});
term2gene("go",['GO:0008150']).then(json => console.log(json))


//Selects node thats in the search field
search.addEventListener('submit',function(e){
  e.preventDefault();
  var gName = search.elements['search_input'].value
  if(cy.nodes(`node[name= "${gName}"]`).select().size() != 0){
    cy.nodes(`node[name= "${gName}"]`).select()
  }else{
    alert("Gene cannot be found in currently displayed graph")
  }
});

form.addEventListener('submit',function(e){
  e.preventDefault();
  cy.destroy()
})

gene.addEventListener('submit',function(e){
  e.preventDefault();
  cy.destroy()
})

form.addEventListener('submit',function(e){
  e.preventDefault();
  var formVal = form.elements['module_input'].value
  getApi('/api/module/'+formVal).then((json)=>{
    iniCy(json);})
})

gene.addEventListener('submit',function(e){
  e.preventDefault();
  var gene_query = gene.elements['gene_input'].value
  getApi('/api/gene?name='+gene_query).then((json)=>{
    iniCy(json);
  })
})

checkbox.addEventListener( 'change', function() {
  if(this.checked) {
    cy.style().selector('edge[?directionality]').style({'display': 'none',}).update() // indicate the end of your new stylesheet so that it can be updated on elements
    ;} else {
      cy.style().selector('edge[?directionality]').style({'display': 'element',})
      .update() // indicate the end of your new stylesheet so that it can be updated on elements
      ;}
  });

checkbox2.addEventListener( 'change', function() {
  if(this.checked) {
    cy.style().selector('edge[!directionality]').style({'display': 'none',})
    .update() // indicate the end of your new stylesheet so that it can be updated on elements
    ;} else {
      cy.style().selector('edge[!directionality]').style({'display': 'element',})
      .update() // indicate the end of your new stylesheet so that it can be updated on elements
      ;}
  });

reset.addEventListener('click', function(){
    cy.fit();
})



async function getApi(idOrName){
  if(idOrName && (!(idOrName == '/api/module/'))){
    const response = await fetch(idOrName);
    const json = await response.json();
    return json
  }else{
    const response = await fetch(`/api/`);
    const json = await response.json();
    return json
  }
}

function iniCy(json){
  var h = function(tag, attrs, children){
      var el = document.createElement(tag);

      Object.keys(attrs).forEach(function(key){
        var val = attrs[key];

        el.setAttribute(key, val);
      });

      children.forEach(function(child){
        el.appendChild(child);
      });

      return el;
    };
    var t = function(text){
      var el = document.createTextNode(text);

      return el;
    };
  // console.log(json);//debuggin reasons
  cy = cytoscape({
  container: document.getElementById('cy'), // container to render in
    elements: json,
    style: [ // the stylesheet for the graph
      {
        selector: 'node',
        style:{
          'background-color': '#666',
          'label':'data(name)',
          'font-size':4,
          'color': '#fff',
          'text-outline-color': '#888',
          'text-outline-width': 1,
          "text-valign": "center",
          "text-halign": "center",
          'height': '24',
          'width': '24'
        }
      },{
        "selector": 'edge',
        "style": {
          'width': 1,
          'curve-style': 'unbundled-bezier',
          'control-point-distance': '35px',
          'control-point-weight': '0.5',
          'edge-distances':"node-position",
          "control-point-step-size":"10px",
          "opacity": "0.4",
          "line-color": "#88A7CA",
          "overlay-padding": "3px"

        }
      },
      {
      selector: 'edge[?directionality]',
      style : {
        'target-arrow-color': '#88A7CA',
        'target-arrow-shape': 'vee'
      }
    },
    {
      selector: 'node:selected',
      style: {
        'font-size':10,
        'text-outline-width': 3,
        "text-valign": "top",
      },
    },
    {
      selector: "edge.selected",
      style: {
        'background-color': '#fff',

      },
    },
    {
      selector:"node[module]",
      style:{
        'background-color':'#FFF'
      }
    }
    ],

    layout: {
      name: 'cose-bilkent',
      animate : 'end',
      nodeDimensionsIncludeLabels: false,
      // nodeRepulsion: 45000*1.5,
      avoidOverlap: true,
      // idealEdgeLength: 140,

    },
  });
  cy.nodes().forEach(function(ele){
    // console.table(ele.degree())
    if(ele.degree()<20){
      cy.style().selector(`node[[degree=${ele.degree()}]]`).style({'height': ele.degree()+4,'width': ele.degree()+4,'label':'data(name)',}).update()
    }
  })
  // Created popup elements when selecting nodes with links inside
  var makeTippy = function(node, html){
     return tippy( node.popperRef(), {
       html: html,
       trigger: 'manual',
       arrow: true,
       placement: 'bottom',
       hideOnClick: false,
       interactive: true
     } ).tooltips[0];
   };
   var hideTippy = function(node){
      var tippy = node.data('tippy');

      if(tippy != null){
        tippy.hide();
      }
    };
   var hideAllTippies = function(){
      cy.nodes().forEach(hideTippy);
    };

    cy.on('tap', function(e){
      if(e.target === cy){
        hideAllTippies();
      }
    });

    cy.on('tap', 'edge', function(e){
      hideAllTippies();
    });

    cy.on('zoom pan', function(e){
      hideAllTippies();
    });
    cy.nodes().forEach(function(n){
        var g = n.data('name');
        var $links = [
          {
          name: 'Arabidopsis.org',
          url: 'https://www.arabidopsis.org/servlets/TairObject?name='+g+'&type=locus'
        },{
          name: "Uniprot search",
          url : 'https://www.uniprot.org/uniprot/?query='+g+'&sort=score'
        },
        ].map(function( link ){
        return h('a', { target: '_blank', href: link.url, 'class': 'tip-link' }, [ t(link.name) ]);
    });
    var tippy = makeTippy(n, h('div', {}, $links));

      n.data('tippy', tippy);

      n.on('click', function(e){
        tippy.show();

        cy.nodes().not(n).forEach(hideTippy);
      });
  });

}
