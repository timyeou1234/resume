import React from 'react';
import {AbsoluteFill, CanvasImage, Interactive, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import capture from './capture.json';
export type FilmProps={language:'zh'|'en'};
type SceneProps=FilmProps & {step:number};
const copy=[
  {zh:['先設定語言','在管理者私訊中傳送「設定語言」，開啟語言選單。','管理者私訊'],en:['Choose your languages','Send 設定語言 in the administrator’s private chat.','Administrator DM']},
  {zh:['選兩種語言','先選中文，再選印尼文。每一步都在聊天裡完成。','管理者私訊'],en:['Select a language pair','Choose Chinese, then Indonesian — directly in the chat.','Administrator DM']},
  {zh:['切換後，直接聊','設定會套用至所有已啟用的聊天室。','管理者私訊'],en:['Ready for the next message','The selected pair applies to every enabled chat.','Administrator DM']},
  {zh:['交代兩件家務','中文訊息送出後，Bot 在同一個群組回覆印尼文。','家庭群組'],en:['Two tasks, one message','A Chinese message receives an Indonesian translation in the same group.','Family group']},
  {zh:['回覆也看得懂','家人用印尼文回覆，Bot 接著提供繁體中文。','家庭群組'],en:['Understand the reply','An Indonesian reply receives a Traditional Chinese translation.','Family group']},
];
function Bubble({text,fromBot,at=0}:{text:string;fromBot?:boolean;at?:number}){
 const frame=useCurrentFrame();
 return <div style={{display:'flex',gap:18,justifyContent:fromBot?'flex-start':'flex-end',opacity:interpolate(frame,[at,at+14],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'}),translate:interpolate(frame,[at,at+14],['0px 16px','0px 0px'],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}}>
 {fromBot?<CanvasImage src={staticFile('avatar-v9.png')} width={70} height={70} style={{borderRadius:35,flexShrink:0,alignSelf:'flex-start',width:70,height:70}}/>:null}
 <div style={{maxWidth:790,padding:'25px 30px',borderRadius:fromBot?'8px 28px 28px 28px':'28px 8px 28px 28px',background:fromBot?'#fff':'#9fea7a',fontSize:43,lineHeight:1.5,whiteSpace:'pre-line',color:'#152820',boxShadow:'0 3px 0 #233c2910'}}>{text}</div>
 </div>;
}
export const ProductScene:React.FC<SceneProps>=({language,step})=>{
 const frame=useCurrentFrame(); const {width}=useVideoConfig(); const portrait=width===1080;
 const item=capture.steps[step], strings=copy[step][language], choices=item.output.quickReply?.items;
 const base=step===4?capture.steps[3].input:null;
 return <AbsoluteFill style={{background:'#101d1a',fontFamily:'"PingFang TC", "Arial", sans-serif',color:'#f4f7f1'}}>
  <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 0% 100%, #284b38 0%, transparent 65%)'}}/>
  <Interactive.Div name="Chapter number" style={{position:'absolute',left:portrait?64:90,top:portrait?54:82,fontSize:30,letterSpacing:4,color:'#b9d5b7'}}>LINE BOT <span style={{color:'#87e3a2',marginLeft:24}}>0{step+1} / 05</span></Interactive.Div>
  <Interactive.Div name="Chapter title" style={{position:'absolute',left:portrait?64:90,top:portrait?113:225,width:portrait?950:600,fontSize:portrait?(language==='en'?59:69):(language==='en'?76:85),fontWeight:600,lineHeight:1.19,letterSpacing:-2}}>{strings[0]}</Interactive.Div>
  <Interactive.Div name="Explanation" style={{position:'absolute',left:portrait?64:90,top:portrait?242:550,width:portrait?945:570,fontSize:portrait?32:42,lineHeight:1.55,color:'#c9d9d0'}}>{strings[1]}</Interactive.Div>
  {!portrait?<><CanvasImage name="Original product avatar" src={staticFile('avatar-v9.png')} width={100} height={100} style={{position:'absolute',left:90,top:745,borderRadius:25}}/><div style={{position:'absolute',left:215,top:758,fontSize:30,lineHeight:1.45}}>家庭 LINE 翻譯 Bot<br/><span style={{fontSize:25,color:'#b9d5b7'}}>Chinese ↔ Indonesian</span></div></>:null}
  <div style={{position:'absolute',left:portrait?48:780,top:portrait?350:68,width:1000,height:970,scale:portrait?'0.984':'1',transformOrigin:'top left',background:'#e4ebf4',borderRadius:32,overflow:'hidden',boxShadow:'0 22px 90px #0005'}}>
   <div style={{height:110,background:'#fff',display:'flex',alignItems:'center',padding:'0 32px',gap:22,color:'#162620',borderBottom:'2px solid #d7e1df'}}><span style={{fontSize:55}}>‹</span><strong style={{fontSize:40}}>{step<3?'家庭 LINE 翻譯 Bot':'家庭群組'}</strong><span style={{marginLeft:'auto',fontSize:31,color:'#52645c'}}>{step<3?'1:1':'群組'}</span></div>
   <div style={{textAlign:'center',fontSize:25,padding:20,color:'#576d65'}}>{strings[2]} · {language==='zh'?'測試對話':'Test conversation'}</div>
   <div style={{padding:'12px 30px',display:'flex',flexDirection:'column',gap:30}}>
    {base?<div style={{fontSize:29,lineHeight:1.45,padding:'13px 26px',borderRadius:18,background:'#d5dfe9',color:'#52665d',whiteSpace:'pre-line'}}>{base}</div>:null}
    <Bubble text={item.input} at={12}/>
    <Bubble text={item.output.text} fromBot at={56}/>
   </div>
   {choices?<div style={{position:'absolute',bottom:115,left:30,right:30,display:'flex',gap:16,justifyContent:'center',opacity:interpolate(frame,[76,90],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}}>
    {choices.map((choice,i)=><div key={choice.action.label} style={{position:'relative',padding:'18px 30px',fontSize:38,border:'2px solid #579874',borderRadius:45,background:step<2&&i===0&&frame>165?'#06a645':'#fff',color:step<2&&i===0&&frame>165?'#fff':'#205e3b'}}>{choice.action.label}
    {step<2&&i===0?<div style={{position:'absolute',width:70,height:70,border:'5px solid #16683a',borderRadius:50,left:'35%',top:14,opacity:interpolate(frame,[155,164,175,190],[0,0.8,0.65,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'}),scale:interpolate(frame,[155,190],[0.7,1.4],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}}/>:null}</div>)}
   </div>:null}
   <div style={{position:'absolute',bottom:0,left:0,right:0,height:88,display:'flex',alignItems:'center',gap:24,padding:'0 30px',background:'#fafcfb',color:'#6c7e75',fontSize:35}}><span>＋</span><div style={{background:'#ecf0ef',borderRadius:28,height:51,flex:1}}/><span style={{fontSize:33}}>↑</span></div>
  </div>
  <div style={{position:'absolute',left:portrait?64:90,bottom:portrait?58:75,fontSize:portrait?24:26,lineHeight:1.45,color:'#b9cdbf',width:portrait?950:600}}>{language==='zh'?'依實際 Bot 回覆製作 · 非 LINE 聊天錄影':'Actual Bot responses · Recreated interface'}<br/>{language==='zh'?'介面示意與測試對話 · 非 LINE 官方產品':'Test conversations · Not an official LINE product'}</div>
  <div style={{position:'absolute',bottom:0,height:5,left:0,background:'#89d5a2',width:`${(step*20)+(frame/(step<2?210:step===2?180:240))*20}%`}}/>
 </AbsoluteFill>;
};
export const OpenSettings:React.FC<FilmProps>=(props)=><ProductScene {...props} step={0}/>;
export const ChoosePair:React.FC<FilmProps>=(props)=><ProductScene {...props} step={1}/>;
export const ConfirmPair:React.FC<FilmProps>=(props)=><ProductScene {...props} step={2}/>;
export const SendMessage:React.FC<FilmProps>=(props)=><ProductScene {...props} step={3}/>;
export const ReceiveReply:React.FC<FilmProps>=(props)=><ProductScene {...props} step={4}/>;
