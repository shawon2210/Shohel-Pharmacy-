<<<<<<< HEAD
const http = require('http')
const https = require('https')
function get(url){
  return new Promise((res, rej)=>{
    const lib = url.startsWith('https')?https:http
    const req = lib.get(url, (r)=>{
      let data=''
      r.on('data', c=>data+=c)
      r.on('end', ()=>res({status: r.statusCode, body: data}))
    })
    req.on('error', (e)=>rej(e))
    req.setTimeout(5000, ()=>{ req.abort(); rej(new Error('timeout')) })
  })
}
;(async ()=>{
  try{
    const root = await get('http://localhost:3000/')
    console.log('--- FRONTEND ROOT (status', root.status, 'first 800 chars) ---')
    console.log(root.body.substring(0,800))
  }catch(e){ console.error('ROOT ERR', e && (e.stack || e.message || e)) }
  try{
    const api = await get('http://localhost:3000/api/health')
    console.log('\n--- PROXY /api/health (status', api.status, ') ---')
    console.log(api.body)
  }catch(e){ console.error('API ERR', e && (e.stack || e.message || e)) }
})()
=======
const http = require('http')
const https = require('https')
function get(url){
  return new Promise((res, rej)=>{
    const lib = url.startsWith('https')?https:http
    const req = lib.get(url, (r)=>{
      let data=''
      r.on('data', c=>data+=c)
      r.on('end', ()=>res({status: r.statusCode, body: data}))
    })
    req.on('error', (e)=>rej(e))
    req.setTimeout(5000, ()=>{ req.abort(); rej(new Error('timeout')) })
  })
}
;(async ()=>{
  try{
    const root = await get('http://localhost:3000/')
    console.log('--- FRONTEND ROOT (status', root.status, 'first 800 chars) ---')
    console.log(root.body.substring(0,800))
  }catch(e){ console.error('ROOT ERR', e && (e.stack || e.message || e)) }
  try{
    const api = await get('http://localhost:3000/api/health')
    console.log('\n--- PROXY /api/health (status', api.status, ') ---')
    console.log(api.body)
  }catch(e){ console.error('API ERR', e && (e.stack || e.message || e)) }
})()
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
