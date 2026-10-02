/* Klassische Skripte: auch direkt per Doppelklick auf index.html nutzbar. */
(()=>{
  'use strict';
  const M=Codes,$=id=>document.getElementById(id);
  const flip=(word,i)=>word.slice(0,i)+(word[i]==='0'?'1':'0')+word.slice(i+1);
  const difference=(a,b)=>[...a].reduce((s,x,i)=>s+(x!==b[i]),0);
  function showPanel(){
    const name=location.hash.slice(1),valid=['parity','hamming','gray','addition','subtraction'];
    const current=valid.includes(name)?name:'parity';
    document.querySelectorAll('.panel').forEach(el=>el.hidden=el.id!==current);
    document.querySelectorAll('nav a').forEach(a=>{if(a.dataset.panel===current)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  }
  addEventListener('hashchange',showPanel);showPanel();
  $('presentation').onclick=()=>{const on=document.body.classList.toggle('presentation');$('presentation').setAttribute('aria-pressed',String(on));$('presentation').textContent=on?'Standardansicht':'Beameransicht';};
  function bitRow(word,labels,handler,{original=null,parity=[],group=[]}={}){
    const container=document.createDocumentFragment();
    [...word].forEach((x,i)=>{
      const wrap=document.createElement('span');wrap.className='bit-wrap';
      const b=document.createElement(handler?'button':'span');b.className='bit';b.dataset.value=x;b.textContent=x;
      if(parity.includes(i))b.classList.add('parity');if(group.includes(i+1))b.classList.add('selected');if(original&&original[i]!==x)b.classList.add('changed');
      if(handler){b.type='button';b.setAttribute('aria-label',`${labels[i]}, Wert ${x}, umkehren`);b.onclick=()=>handler(i);}
      else b.setAttribute('aria-label',`${labels[i]}: ${x}`);
      const label=document.createElement('small');label.textContent=labels[i];wrap.append(b,label);container.append(wrap);
    });return container;
  }
  function status(id,text,kind=''){const el=$(id);el.className='status '+kind;el.textContent=text;}

  let sender='0111',received='',transmitted='';
  const senderWord=()=>sender+String([...sender].reduce((s,x)=>s^(+x),0));
  function transmit(){transmitted=senderWord();received=transmitted;renderParity();}
  function renderParity(){
    const word=senderWord();$('parity-send').replaceChildren(bitRow(word,['D₃','D₂','D₁','D₀','P'],i=>{if(i<4){sender=flip(sender,i);transmit();}},{parity:[4]}));
    $('parity-send').lastElementChild.querySelector('button').disabled=true;
    $('parity-send-info').textContent=`Daten ${sender} · Prüfbit ${word[4]} · ${[...word].filter(x=>x==='1').length} Einsen insgesamt.`;
    $('parity-receive').replaceChildren(bitRow(received,['D₃','D₂','D₁','D₀','P'],i=>{received=flip(received,i);renderParity();},{original:transmitted,parity:[4]}));
    const ones=[...received].filter(x=>x==='1').length,odd=ones%2,errors=difference(transmitted,received);
    status('parity-status',`${ones} Einsen → ${odd?'ungerade: Paritätsfehler erkannt.':'gerade: kein Paritätsfehler erkannt.'}`,odd?'bad':'good');
    $('parity-errors').textContent=`In der Simulation verändert: ${errors} Bit${errors===1?'':'s'}. ${errors&&!odd?'Der Fehler bleibt bei der Paritätsprüfung unentdeckt.':'Diese Information steht dem Empfänger nicht zur Verfügung.'}`;
  }
  $('parity-transmit').onclick=transmit;
  $('parity-single').onclick=()=>{received=flip(transmitted,0);renderParity();};
  $('parity-double').onclick=()=>{received=flip(flip(transmitted,0),1);renderParity();};transmit();

  let hOriginal=M.encode('0110'),hReceived=hOriginal,selectedGroup=0;
  function renderHamming(){
    const checked=M.check(hReceived),group=M.groups[selectedGroup]||[],labels=['1 · p₁','2 · p₂','3 · d₁','4 · p₄','5 · d₂','6 · d₃','7 · d₄'];
    $('hamming-original').textContent=`Gesendetes Wort: ${hOriginal}`;
    $('hamming-bits').replaceChildren(bitRow(hReceived,labels,i=>{hReceived=flip(hReceived,i);$('hamming-correction').textContent='';renderHamming();},{original:hOriginal,parity:[0,1,3],group}));
    const actual=difference(hOriginal,hReceived);$('hamming-ground').textContent=`Simulation: ${actual} Bit${actual===1?'':'s'} gegenüber dem Sendewort verändert.`;
    $('hamming-groups').replaceChildren();
    for(const p of [1,2,4]){
      const values=M.groups[p].map(i=>hReceived[i-1]),count=values.filter(x=>x==='1').length,b=document.createElement('button');
      b.className=`group ${checked.syndrome[p]?'bad':'good'} ${selectedGroup===p?'selected':''}`;b.setAttribute('aria-pressed',String(selectedGroup===p));
      b.textContent=`s${p}: Positionen ${M.groups[p].join(', ')} → ${values.join(' ')} → ${count} Einsen → s${p} = ${checked.syndrome[p]}`;
      b.onclick=()=>{selectedGroup=selectedGroup===p?0:p;renderHamming();};$('hamming-groups').append(b);
    }
    $('hamming-syndrome').innerHTML=`<small>Syndrom · s₄ s₂ s₁</small>${checked.syndrome[4]} ${checked.syndrome[2]} ${checked.syndrome[1]}`;
    $('hamming-position').textContent=`F = 4 · ${checked.syndrome[4]} + 2 · ${checked.syndrome[2]} + ${checked.syndrome[1]} = ${checked.position}. ${checked.position?'Bei einem einzelnen Fehler: Position '+checked.position+' umkehren.':'Kein Fehler erkannt.'}`;
  }
  function encodeInput(){const data=$('hamming-data').value;if(!M.validWord(data,4)){$('hamming-input-info').textContent='Bitte genau vier Bits eingeben, jeweils 0 oder 1.';return;}
    hOriginal=M.encode(data);hReceived=hOriginal;selectedGroup=0;$('hamming-input-info').textContent=`${data} → ${hOriginal}. Prüfbits bilden gerade Parität.`;$('hamming-correction').textContent='';renderHamming();
  }
  $('hamming-encode').onclick=encodeInput;$('hamming-data').onkeydown=e=>{if(e.key==='Enter')encodeInput();};
  $('hamming-reset').onclick=()=>{hReceived=hOriginal;$('hamming-correction').textContent='';renderHamming();};
  $('hamming-example').onclick=()=>{$('hamming-data').value='0110';encodeInput();hReceived='1100010';renderHamming();};
  $('hamming-correct').onclick=()=>{
    const checked=M.check(hReceived),actual=difference(hOriginal,hReceived);
    if(!checked.position){status('hamming-correction',actual?'Syndrom 000 trotz Fehlern: kein Fehler erkannt.':'Kein Bit wird umgekehrt; Syndrom 000.',actual?'warn':'good');return;}
    const text=`Position ${checked.position} umkehren → ${checked.corrected}; ausgelesene Daten ${checked.data}. `;
    status('hamming-correction',text+(actual===1?'Der einzelne Fehler ist korrigiert.':'Mehrere Fehler: Das Ergebnis ist keine sichere Korrektur und weicht vom Sendewort ab.'),actual===1?'good':'warn');
  };encodeInput();

  let grayStep=0;
  function renderGray(){
    const n=+$('gray-position').value,t=M.transition(n,grayStep),finished=grayStep>=t.changed.length;
    $('gray-value').value=n;$('gray-value').textContent=n;
    $('gray-binary-heading').textContent=`${n} → ${t.next} · ${t.changed.length} Bitwechsel`;
    $('gray-gray-heading').textContent=`${n} → ${t.next} · 1 Bitwechsel`;
    $('gray-binary').replaceChildren(bitRow(t.binary,['8','4','2','1'],null,{original:t.old}));
    $('gray-code').replaceChildren(bitRow(t.gray,['g₃','g₂','g₁','g₀'],null,{original:t.oldGray}));
    const value=parseInt(t.binary,2);$('gray-binary-value').textContent=`Momentaner Dualwert: ${value}. ${grayStep&&!finished?'Zwischenzustand!':'Stabiler Start- oder Zielwert.'}`;
    $('gray-binary-path').textContent=`Start ${t.old} → Ziel ${t.target}`;
    $('gray-code-value').textContent=`Momentane Gray-Position: ${grayStep===0?n:t.next}. ${t.gray} ist ein Codewort ohne feste Bitgewichte.`;
    $('gray-code-path').textContent=`Start ${t.oldGray} → Ziel ${t.targetGray}`;
    $('gray-step').disabled=finished;
    status('gray-status',grayStep===0?'Sagen Sie einen möglichen Dual-Zwischenwert voraus. Klicken Sie dann auf „Nächster Bitwechsel“.':finished?'Ziel erreicht: Beide Codes stellen jetzt Position '+t.next+' dar.':'Bitwechsel '+grayStep+' von '+t.changed.length+': Dual zeigt '+value+', Gray bereits den Nachbarwert '+t.next+'.',grayStep&&!finished?'warn':'');
    $('gray-table').innerHTML=Array.from({length:16},(_,i)=>`<tr class="${i===n?'current':''}"><td>${i}</td><td><code>${M.bits(i)}</code></td><td><code>${M.bits(M.gray(i))}</code></td><td>1 Bit</td></tr>`).join('');
  }
  $('gray-position').oninput=()=>{grayStep=0;renderGray();};$('gray-step').onclick=()=>{grayStep++;renderGray();};$('gray-reset').onclick=()=>{grayStep=0;renderGray();};renderGray();

  let addReveal=0,subReveal=0;
  function numbers(prefix){const a=$(prefix+'-a').value,b=$(prefix+'-b').value;if(a.trim()===''||b.trim()===''||!Number.isInteger(+a)||!Number.isInteger(+b)||+a<0||+a>99||+b<0||+b>99)return null;return [+a,+b];}
  const operand=(n)=>`<div class="operand"><strong>${String(n).padStart(2,'0')}</strong>${M.bcd(n).map((w,i)=>`<span class="digit"><code>${w}</code><small>Ziffer ${String(n).padStart(2,'0')[i]}</small></span>`).join('')}</div>`;
  function addStep(s){
    const name=s.place===0?'Einerstelle':'Zehnerstelle',reason=s.raw>15?'Übertrag aus dem Vierbit-Addierer':s.raw>9?'Pseudotetrade':'gültige BCD-Ziffer ohne Übertrag';
    const five=n=>M.bits(n,5).slice(0,1)+' '+M.bits(n,5).slice(1);
    return `<article class="step"><h3>${name}</h3><div class="formula">${M.bits(s.a)} + ${M.bits(s.b)} + ${s.incoming} = ${five(s.raw)}</div><p>${s.a} + ${s.b} + ${s.incoming} = ${s.raw}. ${reason}.</p><div class="formula ${s.correction?'correction':''}">${s.correction?five(s.raw)+' + 0 0110 = '+five(s.after):'Keine Korrekturaddition erforderlich.'}</div><p><strong>Ziffer ${s.digit}</strong> → ${M.bits(s.digit)} · Dezimalübertrag ${s.carry} an die nächste Stelle.</p></article>`;
  }
  function controls(prefix,reveal,max){$(prefix+'-prev').disabled=reveal===0;$(prefix+'-next').disabled=reveal>=max;$(prefix+'-progress').textContent=`${reveal} von ${max} Rechenschritten aufgedeckt.`;}
  function invalid(prefix){$(prefix+'-inputs').textContent='Bitte zwei ganze Zahlen von 0 bis 99 eingeben.';$(prefix+'-steps').replaceChildren();$(prefix+'-result').textContent='';$(prefix+'-progress').textContent='';for(const x of ['prev','next','all'])$(prefix+'-'+x).disabled=true;}
  function renderAdd(){
    const values=numbers('add');if(!values){invalid('add');return;}
    const [a,b]=values,r=M.add(a,b);$('add-all').disabled=false;
    $('add-inputs').innerHTML=operand(a)+'<span class="operand-symbol">+</span>'+operand(b);
    controls('add',addReveal,2);$('add-steps').innerHTML=addReveal?r.steps.slice(0,addReveal).map(addStep).join(''):'<div class="placeholder">Beginnen Sie rechts bei den Einern. Ist die Rohsumme größer als 9?</div>';
    $('add-result').innerHTML=addReveal===2?`${a} + ${b} = ${r.result}<code>BCD: ${r.code.join(' ')}</code>${r.digits.length===3?'<small>Der letzte Dezimalübertrag ergibt die Hunderterziffer 1.</small>':''}`:'';
  }
  function renderSub(){
    const values=numbers('sub');if(!values){invalid('sub');return;}
    const [a,b]=values,r=M.subtract(a,b);$('sub-all').disabled=false;
    $('sub-inputs').innerHTML=operand(a)+'<span class="operand-symbol">−</span>'+operand(b);controls('sub',subReveal,5);
    const sections=[
      `<article class="step"><h3>1 · Neunerkomplement</h3><div class="formula">99 − ${String(b).padStart(2,'0')} = ${String(r.nine).padStart(2,'0')}</div><p>Jede Dezimalziffer auf 9 ergänzen.</p></article>`,
      `<article class="step"><h3>2 · Zehnerkomplement</h3><div class="formula">${String(r.nine).padStart(2,'0')} + 1 = ${r.zero?'100 → zweistellig 00':String(r.ten).padStart(2,'0')}</div><p>${r.zero?'Sonderfall B = 0: modulo 100 ist das Zehnerkomplement 00.':'K₁₀(B) = 100 − B = '+r.ten+'.'}</p><div class="formula">BCD: ${M.bcd(r.ten).join(' ')}</div></article>`,
      addStep(r.addition.steps[0]),addStep(r.addition.steps[1]),
      `<article class="step"><h3>5 · Übertrag und Vorzeichen auswerten</h3><div class="formula">${a} + ${r.ten} = ${r.addition.result}</div><p>${r.zero?'B = 0: Keine Subtraktion nötig. Der Ergebniswert ist A.':r.negative?'Kein Hunderterübertrag: '+r.remaining+' ist das Zehnerkomplement einer negativen Differenz. Betrag: 100 − '+r.remaining+' = '+r.magnitude+'. Vorzeichen: minus.':'Hunderterübertrag 1 verwerfen. Die verbleibenden zwei Ziffern ergeben '+String(r.remaining).padStart(2,'0')+'.'}</p></article>`
    ];
    $('sub-steps').innerHTML=subReveal?sections.slice(0,subReveal).join(''):'<div class="placeholder">Ergänzen Sie zunächst die beiden Ziffern des Subtrahenden auf 9.</div>';
    $('sub-result').innerHTML=subReveal===5?`${a} − ${b} = ${r.result}<code>${r.negative?'Minuszeichen separat · Betrag in BCD: ':'BCD: '}${M.bcd(r.magnitude).join(' ')}</code><small>Probe: ${r.result} + ${b} = ${a}</small>`:'';
  }
  for(const prefix of ['add','sub']){
    const render=prefix==='add'?renderAdd:renderSub,max=prefix==='add'?2:5;
    for(const field of ['a','b'])$(prefix+'-'+field).oninput=()=>{if(prefix==='add')addReveal=0;else subReveal=0;render();};
    for(const action of ['prev','next','all','reset'])$(prefix+'-'+action).onclick=()=>{
      const value=prefix==='add'?addReveal:subReveal,next=action==='prev'?Math.max(0,value-1):action==='next'?Math.min(max,value+1):action==='all'?max:0;
      if(prefix==='add')addReveal=next;else subReveal=next;render();
    };
  }
  $('add-example').onclick=()=>{$('add-a').value=9;$('add-b').value=8;addReveal=0;renderAdd();};
  $('sub-example').onclick=()=>{$('sub-a').value=9;$('sub-b').value=11;subReveal=0;renderSub();};renderAdd();renderSub();

  const feedback={parity:'Passende Parität schließt eine gerade Anzahl von Bitfehlern nicht aus.',hamming:'F = 4 · 0 + 2 · 1 + 0 = 2. Das gilt unter der Annahme eines einzelnen Fehlers.',gray:'Gray 0100 → 1100: Nur g₃ wechselt. Dual 0111 → 1000 verändert vier Bits.',addition:'17 ist größer als 9. Trotz gültiger unterer Rohbits muss wegen des Übertrags 0110 addiert werden.',subtraction:'144 = 100 + (72 − 28). Ohne den Hunderterübertrag bleibt 44.'};
  document.querySelectorAll('[data-quiz]').forEach(button=>button.onclick=()=>{const id=button.dataset.quiz,good=button.dataset.correct==='true';const target=$('quiz-'+id);target.textContent=(good?'Richtig. ':'Noch einmal prüfen. ')+feedback[id];target.className=good?'reading':'correction';});
})();
