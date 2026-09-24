import AsyncStorage from '@react-native-async-storage/async-storage';

const taskMap = {image:'text-to-image',video:'text-to-video',code:'text-generation',content:'text-generation',research:'sentence-similarity',audio:'text-to-speech'};
export async function discover(category = 'all', search = '', signal) {
  const key = `parsai:models:${category}:${search.trim().toLowerCase()}`;
  const query = new URLSearchParams({sort:'downloads',direction:'-1',limit:'20'});
  if (taskMap[category]) query.set('filter',taskMap[category]);
  if (search.trim()) query.set('search',search.trim());
  const controller = new AbortController();
  const cancel = () => controller.abort();
  signal?.addEventListener('abort',cancel);
  const timeout = setTimeout(cancel,15000);
  try {
    const response = await fetch(`https://huggingface.co/api/models?${query}`,{signal:controller.signal});
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('Invalid catalog response');
    const tools = data.filter(x => typeof x.id === 'string').map(x => ({
      id:`hf:${x.id}`,name:x.id,category:category === 'all' ? (Object.keys(taskMap).find(k => taskMap[k] === x.pipeline_tag) || 'content') : category,
      website:`https://huggingface.co/${x.id.split('/').map(encodeURIComponent).join('/')}`,
      description:{fa:`مدل عمومی • وظیفه: ${x.pipeline_tag || 'نامشخص'} • مجوز و هزینه اجرا را در صفحه مدل بررسی کن.`,en:`Public model • Task: ${x.pipeline_tag || 'unspecified'}. Check its license and inference costs on the model page.`},
      source:'huggingface',downloads:Number(x.downloads)||0,likes:Number(x.likes)||0,
    }));
    const result = {tools, updatedAt:Date.now(), cached:false};
    await AsyncStorage.setItem(key,JSON.stringify(result)).catch(()=>{});
    return result;
  } catch(error) {
    if (signal?.aborted) throw error;
    const cached = await AsyncStorage.getItem(key).catch(()=>null);
    if (cached) return {...JSON.parse(cached),cached:true};
    throw error;
  } finally { clearTimeout(timeout); signal?.removeEventListener('abort',cancel); }
}
