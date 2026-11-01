# Cyber-Altar reviewer access

Password sign-in is a normal Supabase account sign-in, not an authentication bypass. The same verified-email checks, database permissions, privacy rules and Holy Place features apply to every account. The existing emailed-code option remains available.

## 1. Deploy and check sign-in

The entrance and verification screen now link to **Sign In With Password** at `/sign-in`. A successful sign-in resolves the enrolled identity on the server from the verified bearer token. No reviewer credentials are included in website source, Android binaries, or this document.

The Android app displays the live website, so these sign-in changes do not require an AAB rebuild.

## 2. Create the dedicated account locally

From the Cyber-Altar repository in PowerShell, ensure `.env.local` contains this project's existing `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`. Obtain them from your own Supabase project settings. Never share or commit the service-role key. Environment files are ignored by Git.

The script defaults to `play-reviewer@crownmind.net`. Use a dedicated address on a domain you control. It must not be an existing pilgrim's account. To select another address before running:

```powershell
$env:CYBER_ALTAR_REVIEWER_EMAIL = "your-dedicated-reviewer-email@your-domain.com"
```

Install dependencies if needed, then run:

```powershell
npm ci
node scripts/setup-reviewer.mjs
```

The script uses Supabase Admin Auth to create a confirmed email/password account with a random password. It enrolls **Google Play Reviewer**, adds AL001 and two private sample prayers, and lights one sample candle through the account's ordinary database permissions. It never resets an existing user's password or disables authentication or RLS.

Credentials are saved locally in `reviewer-access.txt`, which is ignored by Git. Do not upload it to a public repository. The email is preconfirmed, so no mailbox access or verification code is required for password sign-in. Sample candles expire after 24 hours; a reviewer can light another one normally.

If setup fails, retain the credential file and inspect the error before retrying. The script intentionally does not overwrite existing accounts or silently delete partial setup. No schema change is needed when the existing onboarding, prayer privacy and candle setup are already installed.

## 3. Run the automated checks

The initial setup also tests password sign-in, confirmed-user session creation, private prayer ownership, anonymous access denial, the deployed identity endpoint, and the Pilgrims directory. Repeat those checks without recreating the account:

```powershell
node scripts/setup-reviewer.mjs --test
```

These checks do not replace a real device/UI test. The script does not publish sample prayers automatically or inspect other pilgrims' private prayers.

## 4. Test the APK on your Android phone

1. Open Cyber-Altar and go to Home. Tap **Sign In With Password**.
2. Enter the reviewer email/password from your private credential file. Do not use the email-code flow.
3. Confirm altar selection opens. Select AL001 and confirm Holy Place displays **Google Play Reviewer** and the two sample prayers without asking for an emailed code.
4. Offer a new sample prayer and light a candle. Confirm the candle appears and its count updates.
5. Publish one sample prayer using the Prayer Wall control. Check the Public Prayer Wall, then return it to private and confirm it disappears from the wall. Use clearly marked sample content only.
6. Check the Pilgrims directory, scripture arrows, altar selection/history, navigation, screen rotation and keyboard spacing.
7. Close and reopen the app; verify the session is restored. For a clean-login retest, clear Cyber-Altar app storage in Android settings and repeat steps 1–3. Clearing storage removes only local state; server data stays.

A public Prayer Wall visit alone is not proof of full reviewer access. Never claim the account is ready until the signed-in Holy Place works.

## 5. Complete Play Console

Name: `Cyber-Altar Reviewer Account`
Username/email: copy the actual reviewer email from the local credential file.
Password: copy the generated app password. Never provide your Gmail or developer-account password.

After the account and UI tests pass, use these instructions (under 500 characters):

> Open the app and tap Sign In With Password on the entrance screen. Use the provided reviewer email and password. No emailed code is required. Select altar AL001 to open Holy Place and the sample prayers. You can offer prayers, light candles, change prayer visibility, open the Public Prayer Wall and Pilgrims directory, and select other altars. Internet access is required.

Only then select the full-access checkbox and save. Keep the dedicated account active for later reviews. It has normal pilgrim access to its own sample data and public content, not administrator access or access to other pilgrims' private data.
