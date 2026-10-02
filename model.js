(function(root){
  'use strict';
  const bits=(n,width=4)=>n.toString(2).padStart(width,'0');
  const validWord=(w,n)=>new RegExp(`^[01]{${n}}$`).test(w);
  function encode(data){
    if(!validWord(data,4))throw new Error('Vier Datenbits erforderlich.');
    const b=[0,0,+data[0],0,+data[1],+data[2],+data[3]];
    for(const [p,g] of [[1,[3,5,7]],[2,[3,6,7]],[4,[5,6,7]]]) b[p-1]=g.reduce((s,i)=>s^b[i-1],0);
    return b.join('');
  }
  const groups={1:[1,3,5,7],2:[2,3,6,7],4:[4,5,6,7]};
  function check(word){
    if(!validWord(word,7))throw new Error('Sieben Bits erforderlich.');
    const syndrome={};
    for(const [p,g] of Object.entries(groups))syndrome[p]=g.reduce((s,i)=>s^(+word[i-1]),0);
    const position=syndrome[1]+2*syndrome[2]+4*syndrome[4];
    const corrected=word.split('');if(position)corrected[position-1]=String(1-(+corrected[position-1]));
    return {syndrome,position,corrected:corrected.join(''),data:[3,5,6,7].map(i=>corrected[i-1]).join('')};
  }
  const gray=n=>n^(n>>1);
  function transition(n,step=0){
    const next=(n+1)%16,a=bits(n),b=bits(next),ga=bits(gray(n)),gb=bits(gray(next));
    const changed=[0,1,2,3].filter(i=>a[i]!==b[i]);
    const intermediate=a.split('');changed.slice(0,step).forEach(i=>intermediate[i]=b[i]);
    return {next,changed,old:a,target:b,binary:intermediate.join(''),gray:step===0?ga:gb,oldGray:ga,targetGray:gb};
  }
  function bcd(n,width=2){return String(n).padStart(width,'0').split('').map(x=>bits(+x));}
  function add(a,b,width=2){
    const ad=String(a).padStart(width,'0').split('').reverse().map(Number),bd=String(b).padStart(width,'0').split('').reverse().map(Number);
    let carry=0;const steps=[],digits=[];
    for(let i=0;i<width;i++){
      const incoming=carry,raw=ad[i]+bd[i]+incoming,correction=raw>9?6:0,after=raw+correction;
      carry=raw>9?1:0;const digit=after&15;
      digits.unshift(digit);steps.push({place:i,a:ad[i],b:bd[i],incoming,raw,correction,after,digit,carry});
    }
    if(carry)digits.unshift(carry);
    return {steps,result:a+b,digits,code:digits.map(x=>bits(x))};
  }
  function subtract(a,b,width=2){
    const base=10**width,nine=base-1-b,ten=b===0?0:base-b,addition=add(a,ten,width);
    return {nine,ten,addition,negative:a<b,remaining:(a+ten)%base,magnitude:Math.abs(a-b),result:a-b,zero:b===0};
  }
  const api={bits,validWord,encode,groups,check,gray,transition,bcd,add,subtract};
  root.Codes=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
