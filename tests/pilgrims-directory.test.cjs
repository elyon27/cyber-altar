const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
function route(fail=false){
 const db={auth:{admin:{listUsers:async()=>({data:{users:[{email:'active@example.test'},{email:'soft@example.test',deleted_at:'2026-11-08'}]},error:fail?new Error('offline'):null})}},from(table){return {select(){return this},order(){return this},async range(){return {data:table==='cyber_altar_pilgrims'?[{email:'active@example.test',pilgrim_name:'Current Name'},{email:'deleted@example.test',pilgrim_name:'Deleted Name'},{email:'soft@example.test',pilgrim_name:'Soft Deleted'}]:[{email:'active@example.test',username:'Old Name'},{email:null,username:'Orphan Name'}],error:null}}}}};
 const ctx={exports:{},require:n=>n==='next/server'?{NextResponse:{json:(body,options)=>new Response(JSON.stringify(body),options)}}:{createAdminSupabaseClient:()=>db}};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/app/api/pilgrims/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,ctx);
 return ctx.exports;
}
test('directory omits deleted accounts and legacy orphans, using current registry name',async()=>{
 const res=await route().GET();assert.equal(res.status,200);assert.deepEqual(await res.json(),{pilgrims:['Current Name']});
});
test('Auth lookup failure never falls back to stale legacy directory',async()=>{
 const res=await route(true).GET();assert.equal(res.status,503);
});
