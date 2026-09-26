// @ts-check
import React, {useRef, useState} from 'react';
import {View, Text, TextInput, Image, Pressable, ScrollView, ActivityIndicator, StyleSheet, useWindowDimensions} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {api} from './api';

const product = require('../assets/sample-persian-product.png');
const cinema = require('../assets/sample-persepolis-video.png');
const modes = /** @type {const} */ ([
  ['auto','sparkles-outline','خودکار','Auto'],
  ['text','chatbubble-outline','متن','Text'],
  ['image','image-outline','تصویر','Image'],
  ['code','code-slash-outline','کد','Code'],
  ['video','videocam-outline','طرح ویدئو','Storyboard'],
]);

export default function AssistantStudio({lang, demo, subscription, onSubscription, onCopy}) {
  const {width} = useWindowDimensions();
  const imageStyle = [s.image, {height:Math.max(140,(Math.min(width,600)-64)*.75)}];
  const fa = lang === 'fa', tr = (a,b) => fa ? a : b;
  const [mode,setMode] = useState('auto');
  const [tab,setTab] = useState('chat');
  const [draft,setDraft] = useState('');
  const [messages,setMessages] = useState([]);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const pending = useRef(false);
  /** @type {import('react-native').TextStyle} */
  const align = {textAlign:fa?'right':'left',writingDirection:fa?'rtl':'ltr'};
  /** @type {import('react-native').ViewStyle} */
  const row = {flexDirection:fa?'row-reverse':'row'};
  const samples = [
    {mode:'image',image:product,title:tr('تصویر تبلیغاتی محصول','Product campaign'),caption:tr('نمونه تصویر تولیدشده؛ فنجان ایرانی با نور گرم','Generated sample: Persian cup with warm lighting'),prompt:tr('یک عکس تبلیغاتی از فنجان فیروزه‌ای ایرانی روی میز چوبی بساز','Create a commercial photo of a turquoise Persian cup on a wooden table.')},
    {mode:'video',image:cinema,title:tr('داستانی از تخت‌جمشید','A Persepolis story'),caption:tr('فریم مفهومی ثابت؛ ویدئوی قابل پخش نیست','Still concept frame; not a playable video'),prompt:tr('استوری‌بورد یک تیزر شش‌ثانیه‌ای از تخت‌جمشید با نور غروب بنویس','Write a six-second Persepolis promo storyboard in golden evening light.')},
    {mode:'code',title:tr('از ایده تا کد','From idea to code'),caption:tr('نمونه کوتاه کد؛ کد تولیدشده را پیش از انتشار آزمایش کن','Code example; test generated code before release'),text:'const total = items.reduce(\n  (sum, item) => sum + item.price, 0\n);',prompt:tr('یک فرم ثبت سفارش React با اعتبارسنجی ورودی بساز','Create a React order form with input validation.')},
    {mode:'text',title:tr('کلماتی برای برند تو','Words for your brand'),caption:tr('نمونه متن تبلیغاتی','Sample campaign copy'),text:tr('یک جرعه آرامش، با نقش و رنگ ایران. لحظه‌های کوچک، خاطره‌های ماندگار.','A quiet moment, shaped by Persian color and craft. Small moments, lasting memories.'),prompt:tr('برای یک کافه ایرانی سه کپشن کوتاه و متفاوت بنویس','Write three distinctive short captions for a Persian café.')},
  ];
  const chosenMode = mode !== 'auto' ? mode : /عکس|تصویر|پوستر|image|photo|logo/i.test(draft) ? 'image' : /ویدئو|ویدیو|کلیپ|video|film/i.test(draft) ? 'video' : /کد|برنامه|پایتون|ری‌اکت|code|python|react/i.test(draft) ? 'code' : 'text';
  const cost = chosenMode === 'image' ? 5 : 1;
  const credits = subscription ? Math.max(0,subscription.quota-subscription.used) : null;
  const unavailable = !demo && subscription?.paid_enabled === false;
  async function send() {
    const text = draft.trim();
    if (pending.current || text.length < 2 || unavailable) return;
    pending.current = true; setBusy(true); setError('');
    const id = String(Date.now());
    const userMessage = {id:id+'u',role:'user',text};
    setMessages(previous=>[...previous,userMessage]); setDraft('');
    try {
      let result;
      if (demo) {
        const sample = samples.find(item=>item.mode===chosenMode) || samples[3];
        result = {
          kind:chosenMode,localImage:sample.image,
          text:tr('این یک نمونه آماده برای پیش‌نمایش است؛ درخواست شما هنوز به سرویس تولید ارسال نشده است.','This is a prepared preview sample. Your request has not been sent to a generation service.')+'\n\n'+(sample.text||sample.caption),
        };
      } else {
        const history = messages.filter(item=>item.text && item.kind!=='image').slice(-6).map(item=>({role:item.role,content:item.text.slice(0,2000)}));
        result = await api.assistant(text,mode,lang,history);
        if (result.subscription) onSubscription(result.subscription);
      }
      setMessages(previous=>[...previous,{...result,id:id+'a',role:'assistant'}]);
    } catch (e) {
      setError(tr('درخواست انجام نشد. ', 'Request failed. ')+(e?.name==='AbortError'?tr('پاسخ دیر رسید؛ پیش از ارسال دوباره وضعیت را بررسی کن.','The response timed out; check before sending again.'):String(e?.message||'')));
      setDraft(text);
      setMessages(previous=>previous.filter(item=>item.id!==userMessage.id));
    } finally { pending.current=false;setBusy(false); }
  }
  return <View style={{gap:16}}>
    <View style={s.hero}>
      <View style={[s.heading,row]}><View style={s.emblem}><Ionicons name="sparkles" size={26} color="#efbd69"/></View><View style={{flex:1}}><Text style={[s.kicker,align]}>PARS AI / STUDIO</Text><Text style={[s.title,align]}>{tr('چه چیزی خلق کنیم؟','What shall we create?')}</Text></View></View>
      <Text style={[s.body,align]}>{tr('گفت‌وگو، تصویر، کدنویسی و طرح ویدئو؛ خروجی همین‌جا در دست تو.','Chat, images, code and storyboards. Your results, right here.')}</Text>
      <View style={[s.status,row]}><Ionicons name={demo?'eye-outline':'wallet-outline'} size={16} color="#efbd69"/><Text style={[s.note,align]}>{demo?tr('پیش‌نمایش رایگان • نمونه‌های آماده','Free preview • Prepared examples'):credits!==null?tr(credits+' اعتبار باقی‌مانده',credits+' credits remaining'):tr('اتصال به سرویس','Connected service')}</Text></View>
    </View>
    <View style={[s.tabs,row]}>{[['chat',tr('دستیار','Assistant')],['samples',tr('نمونه‌کارها','Showcase')]].map(([value,title])=><Pressable key={value} accessibilityRole="tab" accessibilityState={{selected:tab===value}} onPress={()=>setTab(value)} style={[s.tab,tab===value&&s.active]}><Text style={[s.tabText,tab===value&&{color:'#041923'}]}>{title}</Text></Pressable>)}</View>
    {tab==='samples'?<>{samples.map((item,index)=><View style={s.card} key={item.mode}>
      {item.image?<Image source={item.image} accessibilityLabel={item.title} style={imageStyle} resizeMode="cover"/>:<View style={s.preview}><Ionicons name={item.mode==='code'?'code-slash-outline':'create-outline'} color="#efbd69" size={28}/><Text selectable style={[s.body,item.mode==='code'?{fontFamily:'monospace',textAlign:'left'}:align]}>{item.text}</Text></View>}
      <Text style={[s.cardTitle,align]}>{item.title}</Text><Text style={[s.note,align]}>{item.caption}</Text>
      <Pressable accessibilityRole="button" style={s.button} onPress={()=>{setMode(item.mode);setDraft(item.prompt);setTab('chat')}}><Text style={s.buttonText}>{tr('با این ایده شروع کن','Start with this idea')}</Text><Ionicons name="arrow-forward" size={18} color="#041923"/></Pressable>
    </View>)}</>:<>
      {messages.length===0&&<View style={s.empty}><Text style={[s.cardTitle,align]}>{tr('ایده‌ات را بگو؛ با هم بسازیم.','Tell me your idea. Let’s build it.')}</Text><Text style={[s.body,align]}>{tr('از نمونه‌کارها شروع کن یا درخواست خودت را بنویس. برای ویدئو فعلاً سناریو و استوری‌بورد آماده می‌شود.','Start with a showcase or write your own request. Video currently produces a script and storyboard.')}</Text></View>}
      {messages.map(item=><View key={item.id} style={[s.card,item.role==='user'&&s.userBubble]}>
        <Text style={[s.kicker,align]}>{item.role==='user'?tr('شما','YOU'):demo?'PARS AI / PREVIEW':'PARS AI'}</Text>
        {item.localImage||item.image?<Image accessibilityLabel={tr('خروجی تصویر','Image output')} source={item.localImage||{uri:item.image_kind==='b64'?'data:image/png;base64,'+item.image:item.image}} style={imageStyle} resizeMode="contain"/>:null}
        <Text selectable style={[s.body,align]}>{item.text}</Text>
        {item.role==='assistant'&&<View style={[s.heading,row]}><Text style={[s.note,{flex:1}]}>{item.model||tr('نمونه نمایشی','Preview sample')}</Text><Pressable accessibilityRole="button" accessibilityLabel={tr('کپی متن','Copy text')} onPress={()=>onCopy(item.text)} style={s.copy}><Ionicons name="copy-outline" size={20} color="#efbd69"/></Pressable></View>}
      </View>)}
      {busy&&<View style={[s.heading,row]}><ActivityIndicator color="#efbd69"/><Text style={s.note}>{tr('در حال آماده‌سازی…','Creating…')}</Text></View>}
      <View style={s.composer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[{gap:8},row]}>{modes.map(([value,icon,persian,english])=><Pressable accessibilityRole="button" accessibilityState={{selected:mode===value}} key={value} style={[s.chip,mode===value&&s.chipActive]} onPress={()=>setMode(value)}><Ionicons name={icon} size={15} color={mode===value?'#041923':'#efbd69'}/><Text style={[s.note,mode===value&&{color:'#041923'}]}>{fa?persian:english}</Text></Pressable>)}</ScrollView>
        <TextInput accessibilityLabel={tr('درخواست شما','Your request')} style={[s.input,align]} placeholder={tr('ایده‌ات را اینجا بنویس…','Describe your idea…')} placeholderTextColor="#8da8b1" multiline maxLength={8000} value={draft} onChangeText={setDraft} editable={!busy}/>
        <Text style={[s.note,align]}>{demo?tr('ارسال در حالت نمایشی هزینه‌ای ندارد.','Preview requests have no API charge.'):tr('هزینه این درخواست: '+cost+' اعتبار • تصویر اقتصادی','This request: '+cost+' credits • Economy images')}</Text>
        {unavailable&&<Text style={[s.warning,align]}>{tr('تولید آنلاین هنوز فعال نشده؛ نمونه‌کارها آماده مشاهده‌اند.','Online generation is not enabled yet. Explore the showcase.')}</Text>}
        {error?<Text accessibilityRole="alert" style={[s.warning,align]}>{error}</Text>:null}
        <Pressable accessibilityRole="button" disabled={busy||draft.trim().length<2||unavailable} onPress={send} style={[s.button,(busy||draft.trim().length<2||unavailable)&&{opacity:.45}]}><Text style={s.buttonText}>{demo?tr('مشاهده نمونه','Show preview'):tr('بساز','Create')}</Text><Ionicons name="arrow-up" size={20} color="#041923"/></Pressable>
      </View>
    </>}
  </View>;
}

const s=StyleSheet.create({
  hero:{padding:20,borderRadius:24,backgroundColor:'#102e3a',borderWidth:1,borderColor:'#735c38',gap:14},
  heading:{alignItems:'center',gap:12},emblem:{width:52,height:52,borderRadius:17,backgroundColor:'#233d42',alignItems:'center',justifyContent:'center'},
  kicker:{fontFamily:'Vazirmatn_700Bold',fontSize:10,color:'#efbd69',letterSpacing:1},
  title:{fontFamily:'Vazirmatn_900Black',fontSize:23,color:'#fff4db',marginTop:5},
  body:{fontFamily:'Vazirmatn_400Regular',fontSize:14,lineHeight:26,color:'#d2dfe1'},
  note:{fontFamily:'Vazirmatn_400Regular',fontSize:11,lineHeight:21,color:'#a5bcc2'},
  status:{alignItems:'center',gap:8,borderTopWidth:1,borderColor:'#31505a',paddingTop:12},
  tabs:{backgroundColor:'#0a232e',borderRadius:15,padding:5,gap:5},
  tab:{flex:1,padding:12,borderRadius:11,alignItems:'center'},active:{backgroundColor:'#efbd69'},
  tabText:{fontFamily:'Vazirmatn_700Bold',fontSize:13,color:'#9cb2ba'},
  card:{backgroundColor:'#0c2733',borderWidth:1,borderColor:'#294854',borderRadius:20,padding:15,gap:10},
  cardTitle:{fontFamily:'Vazirmatn_700Bold',fontSize:17,color:'#fff0d6'},
  image:{width:'100%',borderRadius:13,backgroundColor:'#051b25'},
  preview:{backgroundColor:'#051b25',padding:20,borderRadius:13,gap:15},
  button:{backgroundColor:'#efbd69',borderRadius:13,padding:14,minHeight:49,flexDirection:'row',gap:10,alignItems:'center',justifyContent:'center'},
  buttonText:{fontFamily:'Vazirmatn_700Bold',fontSize:13,color:'#041923'},
  empty:{paddingVertical:20,gap:10},userBubble:{backgroundColor:'#153847',marginStart:26,borderColor:'#356071'},
  copy:{padding:10,minWidth:44,minHeight:44,alignItems:'center',justifyContent:'center'},
  composer:{backgroundColor:'#102b36',padding:14,borderRadius:20,borderWidth:1,borderColor:'#405761',gap:13},
  chip:{flexDirection:'row',alignItems:'center',gap:5,borderRadius:20,paddingVertical:9,paddingHorizontal:12,backgroundColor:'#071e29'},
  chipActive:{backgroundColor:'#efbd69'},input:{minHeight:110,maxHeight:220,color:'#f5f0e5',fontFamily:'Vazirmatn_400Regular',fontSize:14,textAlignVertical:'top',padding:12},
  warning:{fontFamily:'Vazirmatn_400Regular',fontSize:12,lineHeight:22,color:'#f1bb95'},
});
