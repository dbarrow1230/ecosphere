export const MORSE_CODES={
 A:".-",B:"-...",C:"-.-.",D:"-..",E:".",F:"..-.",G:"--.",H:"....",I:"..",J:".---",K:"-.-",L:".-..",M:"--",N:"-.",O:"---",P:".--.",Q:"--.-",R:".-.",S:"...",T:"-",U:"..-",V:"...-",W:".--",X:"-..-",Y:"-.--",Z:"--..",
 "0":"-----","1":".----","2":"..---","3":"...--","4":"....-","5":".....","6":"-....","7":"--...","8":"---..","9":"----.",
 ".":".-.-.-",",":"--..--","?":"..--..","/":"-..-.","=":"-...-",
 AR:".-.-.",SK:"...-.-",BT:"-...-",DN:"-..-."
};

export const playMorseText=(value,{wpm=5,frequency=600}={})=>{
 const AudioContextClass=window.AudioContext||window.webkitAudioContext;
 if(!AudioContextClass)throw new Error("Morse audio is not supported by this browser.");

 const context=new AudioContextClass();
 const dotSeconds=1.2/Math.max(1,Number(wpm)||5);
 const oscillators=[];
 let cursor=context.currentTime+.08;

 const normalizedValue=String(value||"").toUpperCase();
 const characters=MORSE_CODES[normalizedValue]?[normalizedValue]:[...normalizedValue];
 for(const character of characters){
  if(character===" "){
   cursor+=dotSeconds*4;
   continue;
  }

  const code=MORSE_CODES[character];
  if(!code)continue;

  for(const symbol of code){
   const duration=dotSeconds*(symbol==="-"?3:1);
   const oscillator=context.createOscillator();
   const gain=context.createGain();
   oscillator.type="sine";
   oscillator.frequency.value=frequency;
   gain.gain.setValueAtTime(0,cursor);
   gain.gain.linearRampToValueAtTime(.24,cursor+.004);
   gain.gain.setValueAtTime(.24,cursor+Math.max(.004,duration-.004));
   gain.gain.linearRampToValueAtTime(0,cursor+duration);
   oscillator.connect(gain);
   gain.connect(context.destination);
   oscillator.start(cursor);
   oscillator.stop(cursor+duration+.01);
   oscillators.push(oscillator);
   cursor+=duration+dotSeconds;
  }

  cursor+=dotSeconds*2;
 }

 let timeoutId;
 let stopped=false;
 const finished=new Promise(resolve=>{
  timeoutId=window.setTimeout(async()=>{
   if(stopped)return;
   stopped=true;
   await context.close().catch(()=>{});
   resolve();
  },Math.max(0,(cursor-context.currentTime)*1000));
 });

 return{
  finished,
  stop:async()=>{
   if(stopped)return;
   stopped=true;
   window.clearTimeout(timeoutId);
   oscillators.forEach(oscillator=>{try{oscillator.stop();}catch{void 0;}});
   await context.close().catch(()=>{});
  }
 };
};

export const createMorseKeyer=({frequency=600,volume=.24}={})=>{
 const AudioContextClass=window.AudioContext||window.webkitAudioContext;
 if(!AudioContextClass)throw new Error("Morse audio is not supported by this browser.");

 const context=new AudioContextClass();
 const oscillator=context.createOscillator();
 const gain=context.createGain();
 oscillator.type="sine";
 oscillator.frequency.value=frequency;
 gain.gain.value=0;
 oscillator.connect(gain);
 gain.connect(context.destination);
 oscillator.start();
 let closed=false;

 return{
  keyDown:()=>{
   if(closed)return;
   void context.resume();
   const now=context.currentTime;
   gain.gain.cancelScheduledValues(now);
   gain.gain.setValueAtTime(gain.gain.value,now);
   gain.gain.linearRampToValueAtTime(volume,now+.004);
  },
  keyUp:()=>{
   if(closed)return;
   const now=context.currentTime;
   gain.gain.cancelScheduledValues(now);
   gain.gain.setValueAtTime(gain.gain.value,now);
   gain.gain.linearRampToValueAtTime(0,now+.006);
  },
  close:async()=>{
   if(closed)return;
   closed=true;
   try{oscillator.stop();}catch{void 0;}
   await context.close().catch(()=>{});
  }
 };
};
