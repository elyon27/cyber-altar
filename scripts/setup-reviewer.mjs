// Run locally from the Cyber-Altar repository. Never upload the resulting credential file.
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'node:crypto';
import { readFileSync, existsSync, writeFileSync } from 'node:fs';

for (const filename of ['.env.local', '.env']) {
  if (!existsSync(filename)) continue;
  for (const line of readFileSync(filename, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match || process.env[match[1]]) continue;
    let value = match[2];
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    process.env[match[1]] = value;
  }
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const site = process.env.CYBER_ALTAR_SITE_URL || 'https://cyber-altar.netlify.app';
const credentialPath = 'reviewer-access.txt';
const testOnly = process.argv.includes('--test');
const makeClient = key => createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const check = (condition, message) => { if (!condition) throw new Error(message); };
const must = (result, label) => { if (result.error) throw new Error(`${label}: ${result.error.message}`); return result.data; };
let client;
try {
  check(url && anonKey, 'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your local .env.local.');
  check(new URL(url).hostname === 'eicsjuoxacviwgsxkhif.supabase.co', 'This script is restricted to the Cyber-Altar project. Check your local Supabase URL.');
  let account;
  if (testOnly) {
    check(existsSync(credentialPath), 'Run setup first. Keep the credential file private.');
    account = JSON.parse(readFileSync(credentialPath, 'utf8'));
  } else {
    check(!existsSync(credentialPath), 'A credential file already exists. Use node scripts/setup-reviewer.mjs --test. Setup will not overwrite an existing account or password.');
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    check(serviceKey, 'Set SUPABASE_SERVICE_ROLE_KEY in your local .env.local. Never paste it into chat or commit it.');
    const admin = makeClient(serviceKey);
    const email = (process.env.CYBER_ALTAR_REVIEWER_EMAIL || 'play-reviewer@crownmind.net').trim().toLowerCase();
    check(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), 'Set a valid reviewer email on a domain you control.');
    const enrolled = must(await admin.rpc('cyber_altar_onboarding', { p_email: email, p_action: 'lookup' }), 'Check enrollment');
    check(!enrolled?.exists, 'This email is already enrolled. Use a new dedicated reviewer email; this script does not repurpose existing pilgrim accounts.');
    account = { email, password: randomBytes(24).toString('base64url'), name: 'Google Play Reviewer', altar: 'al001', samplePrayerIds: [] };
    // Save before provisioning so credentials can be recovered even if a later step fails.
    writeFileSync(credentialPath, JSON.stringify(account, null, 2) + '\n', { mode: 0o600, flag: 'wx' });
    const created = must(await admin.auth.admin.createUser({ email, password: account.password, email_confirm: true,
      user_metadata: { pilgrim_name: account.name } }), 'Create dedicated reviewer account');
    account.userId = created.user.id;
    writeFileSync(credentialPath, JSON.stringify(account, null, 2) + '\n', { mode: 0o600 });
    must(await admin.rpc('cyber_altar_onboarding', { p_email: email, p_action: 'register', p_name: account.name }), 'Enroll reviewer');
    console.log('Dedicated confirmed account created. No verification email was sent.');
  }
  client = makeClient(anonKey);
  const auth = must(await client.auth.signInWithPassword({ email: account.email, password: account.password }), 'Password sign-in');
  check(auth.user?.email_confirmed_at && auth.session, 'The account must be email-confirmed.');
  console.log('PASS: password sign-in produced a confirmed user session without an emailed code.');
  if (!testOnly) {
    const profile = must(await client.from('altar_profiles').insert({ username: account.name, email: account.email,
      altar_slug: account.altar, candle_count: 0 }).select('id').single(), 'Create reviewer altar');
    const prayers = must(await client.from('altar_prayers').insert([
      { profile_id: profile.id, username: account.name, altar_slug: account.altar, prayer_text: 'Reviewer sample prayer: Lord, guide us in peace, wisdom, and kindness.', is_public: false },
      { profile_id: profile.id, username: account.name, altar_slug: account.altar, prayer_text: 'Reviewer sample prayer: With gratitude for hope, family, and community.', is_public: false },
    ]).select('id'), 'Create private sample prayers');
    account.profileId = profile.id;
    account.samplePrayerIds = prayers.map(prayer => prayer.id);
    writeFileSync(credentialPath, JSON.stringify(account, null, 2) + '\n', { mode: 0o600 });
    const candle = must(await client.rpc('light_prayer_candle', { p_prayer_id: prayers[0].id }), 'Light sample candle');
    check(candle?.prayer?.candle_count >= 1, 'Sample candle was not recorded.');
    console.log('PASS: created two private sample prayers and lit a candle using normal account permissions.');
  }
  check(account.samplePrayerIds?.length === 2, 'Setup is incomplete. Check the last setup error; do not overwrite or reset another account.');
  const own = must(await client.from('altar_prayers').select('id,is_public').in('id', account.samplePrayerIds), 'Read own sample prayers');
  check(own.length === 2, 'Reviewer could not access both sample prayers.');
  const visitor = makeClient(anonKey);
  const publicView = must(await visitor.from('altar_prayers').select('id').in('id', account.samplePrayerIds), 'Verify private prayer protection');
  check(publicView.length === 0, 'Private sample prayers are exposed to signed-out visitors. Fix RLS before submission.');
  console.log('PASS: owner can read sample prayers; signed-out visitors cannot.');
  const unauthorized = await fetch(`${site}/api/pilgrim/session`);
  check(unauthorized.status === 401, 'The new sign-in endpoint is not deployed or does not reject unsigned requests.');
  const identityResponse = await fetch(`${site}/api/pilgrim/session`, { headers: { Authorization: `Bearer ${auth.session.access_token}` } });
  check(identityResponse.ok, 'Verified account identity endpoint failed. Check the deployed site and backend configuration.');
  const identity = await identityResponse.json();
  check(identity.email === account.email && identity.name === account.name, 'Verified identity did not match the reviewer.');
  const directoryResponse = await fetch(`${site}/api/pilgrims`);
  check(directoryResponse.ok, 'Pilgrims directory endpoint failed.');
  const directory = await directoryResponse.json();
  check(directory.pilgrims?.includes(account.name), 'Reviewer is missing from the Pilgrims directory.');
  console.log('PASS: deployed sign-in endpoint enforces authentication and resolves the correct pilgrim; directory includes reviewer.');
  console.log(`Credentials are in ${credentialPath}. Keep it private and copy only the reviewer email/password into Play Console.`);
  console.log('Next: test the APK UI from a fresh app session using Sign In With Password; select AL001, open Holy Place, and check the features described in REVIEWER-ACCESS.md.');
} catch (error) {
  console.error(`STOP: ${error.message}`);
  if (existsSync(credentialPath)) console.error('Keep reviewer-access.txt: provisioning may have partially succeeded. Do not delete or overwrite it before resolving the error.');
  process.exitCode = 1;
} finally {
  if (client) await client.auth.signOut({ scope: 'local' }).catch(() => {});
}
