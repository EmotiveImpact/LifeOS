/* v20 money: board-only editorial hierarchy for money, tools, documents and plan routes. */
(function registerV20MoneyPass(){
  'use strict';

  var KEYS=[
    'mission','draft','ttk','cashplan','taxcheck','money','subs','income','rentbuy',
    'blood','protect','growth','bedrooms','buffer','unlock','decisions','area','history',
    'doitforme','missions','newgoal','areahome','areahealth','areawork','tools',
    'healthstack','txn','bill','budget','networth','connectbank','vault','docdetail','renewal'
  ];
  var KEYSET=new Set(KEYS);
  var CALCULATORS=new Set(['cashplan','taxcheck','income','rentbuy','blood','protect','growth','bedrooms','buffer','decisions','healthstack']);
  var SHEETS=new Set(['draft','bedrooms','buffer','unlock','doitforme','newgoal']);
  var DOCUMENTS=new Set(['vault','docdetail','renewal']);
  var LIST_HEAVY=new Set(['mission','subs','protect','area','history','doitforme','missions','areahome','areahealth','areawork','tools','healthstack','vault']);

  function all(root,selector){return Array.prototype.slice.call(root.querySelectorAll(selector));}
  function first(root,selector){return root.querySelector(selector);}
  function last(items){return items.length?items[items.length-1]:null;}
  function add(node){
    if(!node)return;
    for(var i=1;i<arguments.length;i++)if(arguments[i])node.classList.add(arguments[i]);
  }
  function directChildren(node,selector){
    if(!node)return [];
    return Array.prototype.filter.call(node.children,function(child){return !selector||child.matches(selector);});
  }
  function contentPads(scr){
    return all(scr,'.scroll > .pad.col, :scope > .pad.col').filter(function(node){return !node.classList.contains('v20-structural-group');});
  }
  function mainContent(scr){
    var pads=contentPads(scr);
    return last(pads)||first(scr,'.sheet')||scr;
  }
  function makeGroup(nodes,className){
    nodes=nodes.filter(Boolean);
    if(!nodes.length||nodes[0].parentElement===null)return null;
    var parent=nodes[0].parentElement;
    if(nodes.some(function(node){return node.parentElement!==parent;}))return null;
    var section=document.createElement('section');
    section.className='v20-structural-group '+className;
    parent.insertBefore(section,nodes[0]);
    nodes.forEach(function(node){section.appendChild(node);});
    return section;
  }
  function wrapConsecutiveCards(container,className){
    if(!container)return false;
    var cards=directChildren(container,'.card');
    if(cards.length<2)return false;
    var group=makeGroup(cards,className||'v20-card-stack');
    return !!group;
  }
  function markRows(scr){
    all(scr,'.li').forEach(function(row){
      add(row,'v20-money-row');
      var copy=first(row,'.lt, .col[style*="flex:1"]');
      var amount=last(all(row,'.tnum, .t-title3'));
      var status=first(row,'.tag, .cg, .ce');
      add(copy,'v20-row-copy');
      add(amount,'v20-row-amount');
      add(status,'v20-row-status');
    });
    all(scr,'.card').forEach(function(card){
      if(directChildren(card,'.li').length)add(card,'v20-list-card');
    });
  }
  function markTopAndHero(sc,scr){
    var top=first(scr,'.status + .pad.row.sb, .status + .pad.row, .scroll > .status + .pad.row.sb');
    add(top,'v20-topbar');
    var pads=contentPads(scr);
    pads.forEach(function(pad,index){add(pad,index===pads.length-1?'v20-main-content':'v20-intro-block');});
    var title=first(scr,'.t-title1');
    if(title){
      add(title,'v20-screen-title');
      var titleBlock=title.parentElement;
      if(titleBlock&&titleBlock!==scr)add(titleBlock,'v20-title-block');
    }
    var display=first(scr,'.t-display');
    add(display,'v20-financial-headline');
    if(CALCULATORS.has(sc.key))add(scr,'v20-money-calculator');
    if(SHEETS.has(sc.key))add(scr,'v20-money-sheet');
    if(DOCUMENTS.has(sc.key))add(scr,'v20-money-documents');
    if(LIST_HEAVY.has(sc.key))add(scr,'v20-money-list-heavy');
  }
  function groupLabelledSections(container){
    if(!container)return 0;
    var children=directChildren(container);
    var starts=[];
    children.forEach(function(node,index){
      if(node.matches('.t-callout.c2')&&index<children.length-1)starts.push(index);
    });
    if(!starts.length)return 0;
    var groups=[];
    starts.forEach(function(start,index){
      var end=index+1<starts.length?starts[index+1]:children.length;
      var chunk=children.slice(start,end).filter(function(node){return !node.matches('.segm');});
      if(chunk.length>1)groups.push(chunk);
    });
    var made=0;
    groups.forEach(function(chunk){if(makeGroup(chunk,'v20-named-group'))made++;});
    return made;
  }
  function groupHeroStart(container,stopSelector,className){
    if(!container)return false;
    var nodes=[];
    var children=directChildren(container);
    for(var i=0;i<children.length;i++){
      if(i>0&&children[i].matches(stopSelector))break;
      nodes.push(children[i]);
    }
    if(!nodes.length||nodes.length===children.length)return false;
    return !!makeGroup(nodes,className||'v20-finance-hero');
  }
  function promoteMoneyOverview(scr,changes){
    var balance=first(scr,'[data-bal]');
    if(balance){add(balance.parentElement,'v20-balance-hero');add(balance,'v20-financial-headline');}
    var container=all(scr,'.pad.col').find(function(node){return first(node,'.hrow')&&node.textContent.indexOf('Ledger')>=0;});
    if(!container)return false;
    var changed=false;
    var accounts=first(container,'.hrow');
    if(accounts&&makeGroup([accounts],'v20-account-group')){
      changed=true;
      changes.push('Separated the account strip from the transaction ledger.');
    }
    var ledger=directChildren(container,'.card').find(function(card){return card.textContent.indexOf('Ledger')>=0;});
    if(ledger){
      var heading=directChildren(ledger,'.row')[0];
      var section=document.createElement('section');
      section.className='v20-structural-group v20-ledger-group';
      container.insertBefore(section,ledger);
      if(heading)section.appendChild(heading);
      section.appendChild(ledger);
      add(ledger,'v20-list-card');
      changed=true;
      changes.push('Moved the existing Ledger heading above its readable transaction rows.');
    }
    return changed;
  }
  function promoteTransaction(scr,changes){
    var container=mainContent(scr);
    if(!container)return false;
    var card=directChildren(container,'.card')[0];
    var before=card?directChildren(container).slice(0,directChildren(container).indexOf(card)):[];
    var changed=false;
    if(before.length>=2&&makeGroup(before,'v20-finance-hero v20-payment-hero')){
      changed=true;
      changes.push('Grouped the existing merchant, source line and amount into a payment headline.');
    }
    if(card)add(card,'v20-facts-card');
    var action=directChildren(container,'button.btn')[0];
    add(action,'v20-secondary-action');
    return changed;
  }
  function promoteBill(scr,changes){
    var container=mainContent(scr);
    if(!container)return false;
    var amountRow=directChildren(container,'.row.sb')[0];
    var changed=false;
    if(amountRow&&makeGroup([amountRow],'v20-finance-hero v20-bill-hero')){
      changed=true;
      changes.push('Promoted the amount, payment source and due status into one bill headline.');
    }
    var cards=directChildren(container,'.card');
    if(cards[0])add(cards[0],'v20-opportunity-card');
    if(cards[1])add(cards[1],'v20-history-card');
    return changed;
  }
  function promoteSubscription(scr,changes){
    var container=mainContent(scr);
    if(!container)return false;
    var hero=directChildren(container,'.col')[0];
    var changed=false;
    if(hero&&makeGroup([hero],'v20-finance-hero v20-subscription-hero')){
      changed=true;
      changes.push('Separated the monthly subscription total from provider rows.');
    }
    var list=directChildren(container,'.card')[0];
    add(list,'v20-subscription-list');
    return changed;
  }
  function promoteNetWorth(scr,changes){
    var container=mainContent(scr);
    if(!container)return false;
    var children=directChildren(container);
    var chartIndex=children.findIndex(function(node){return node.querySelector&&node.querySelector('[data-chart], canvas')||node.matches('[data-chart], canvas');});
    var cardIndex=children.findIndex(function(node){return node.matches('.card');});
    var stop=chartIndex>0?chartIndex:cardIndex;
    if(stop<1)stop=Math.min(2,children.length-1);
    var heroNodes=children.slice(0,stop);
    if(heroNodes.length&&makeGroup(heroNodes,'v20-finance-hero v20-networth-hero')){
      changes.push('Grouped the net-worth total and yearly movement above the asset rows.');
      return true;
    }
    return false;
  }
  function promoteVault(scr,changes){
    var container=mainContent(scr);
    var card=container&&directChildren(container,'.card')[0];
    if(!card)return false;
    var rows=directChildren(card,'.li');
    if(rows.length<2)return false;
    var priority=rows.find(function(row){return !!first(row,'.tag.live');})||rows[0];
    var section=document.createElement('section');
    section.className='v20-structural-group v20-due-group';
    card.parentElement.insertBefore(section,card);
    section.appendChild(priority);
    add(priority,'v20-priority-row');
    add(card,'v20-sorted-documents');
    changes.push('Lifted the existing act-now renewal above the sorted document rows.');
    return true;
  }
  function promoteDocumentDetail(scr,changes){
    var container=mainContent(scr);
    if(!container)return false;
    var lead=directChildren(container)[0];
    if(lead&&makeGroup([lead],'v20-finance-hero v20-document-hero')){
      changes.push('Promoted the existing expiry or renewal date into a document headline.');
      return true;
    }
    return false;
  }
  function promoteBudget(scr,changes){
    var container=mainContent(scr);
    if(!container)return false;
    if(wrapConsecutiveCards(container,'v20-budget-stack')){
      changes.push('Grouped all existing category meters into one readable budget run.');
      return true;
    }
    return false;
  }
  function promoteMission(scr,changes){
    var container=mainContent(scr);
    if(!container)return false;
    var children=directChildren(container);
    var firstCard=children.findIndex(function(node){return node.matches('.card');});
    if(firstCard>0&&makeGroup(children.slice(0,firstCard),'v20-mission-hero')){
      changes.push('Separated the mission outcome and status from its steps and evidence.');
      return true;
    }
    return false;
  }
  function promoteCalculator(scr,changes){
    var container=mainContent(scr);
    if(!container)return false;
    var cards=directChildren(container,'.card');
    if(cards.length>1&&wrapConsecutiveCards(container,'v20-calculator-panels')){
      changes.push('Grouped the existing calculator inputs and result panels without changing their controls.');
      return true;
    }
    return false;
  }
  function promoteGenericDense(sc,scr,changes){
    var container=mainContent(scr);
    var made=groupLabelledSections(container);
    if(made){
      changes.push('Bound existing section labels to their related rows in '+made+' named group'+(made===1?'':'s')+'.');
      return true;
    }
    if(['decisions','doitforme','healthstack','connectbank'].indexOf(sc.key)>=0&&wrapConsecutiveCards(container,'v20-card-stack')){
      changes.push('Grouped the existing related panels into a clearer reading sequence.');
      return true;
    }
    return false;
  }

  window.__V20Passes=window.__V20Passes||[];
  window.__V20Passes.push({
    id:'money',
    keys:KEYS.slice(),
    apply:function(sc,scr){
      var changes=[];
      var structural=false;
      if(!sc||!scr||!KEYSET.has(sc.key))return {structural:false,changes:changes};
      if(scr.dataset.v20MoneyApplied==='true')return {structural:false,changes:['Money hierarchy already applied.']};

      add(scr,'v20-money','v20-money-key-'+sc.key,'v20-money-ch-'+sc.ch,'v20-money-type-'+String(sc.type||'screen').toLowerCase().replace(/[^a-z0-9]+/g,'-'));
      scr.dataset.v20MoneyApplied='true';
      markTopAndHero(sc,scr);
      markRows(scr);
      changes.push('Applied the 20pt gutter, token type scale, 4/8 spacing rhythm and amount-first hierarchy.');

      if(sc.key==='money')structural=promoteMoneyOverview(scr,changes)||structural;
      else if(sc.key==='txn')structural=promoteTransaction(scr,changes)||structural;
      else if(sc.key==='bill')structural=promoteBill(scr,changes)||structural;
      else if(sc.key==='subs')structural=promoteSubscription(scr,changes)||structural;
      else if(sc.key==='networth')structural=promoteNetWorth(scr,changes)||structural;
      else if(sc.key==='vault')structural=promoteVault(scr,changes)||structural;
      else if(sc.key==='docdetail'||sc.key==='renewal')structural=promoteDocumentDetail(scr,changes)||structural;
      else if(sc.key==='budget')structural=promoteBudget(scr,changes)||structural;
      else if(sc.key==='mission')structural=promoteMission(scr,changes)||structural;
      else if(CALCULATORS.has(sc.key)&&!SHEETS.has(sc.key))structural=promoteCalculator(scr,changes)||structural;
      else if(!SHEETS.has(sc.key))structural=promoteGenericDense(sc,scr,changes)||structural;

      if(SHEETS.has(sc.key))changes.push('Refined the existing sheet typography and action hierarchy without changing its geometry.');
      if(sc.key==='ttk')changes.push('Clarified the horizontal guide and learning list while retaining the Talk bar.');
      if(sc.key==='newgoal')changes.push('Clarified the goal field, suggestions and primary action without changing field data.');
      if(sc.key==='connectbank')changes.push('Kept bank sources and consent copy prominent beneath the connection headline.');

      return {structural:structural,changes:changes};
    }
  });
})();
