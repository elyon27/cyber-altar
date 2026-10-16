# Prayer visibility update

This package adds two buttons to EVERY prayer in Your Offered Prayers:
- Paste Prayer On Wall: publishes that specific prayer for everyone.
- Keep Prayer Secret: removes that prayer from the public wall and restricts database reads to its verified owner.

New prayers start secret. Existing prayers retain their previous public visibility until the owner changes it. Each card displays Public or Secret and reports failed saves without falsely changing status.

## Required before deployment

1. Open the Supabase project used by Cyber-Altar. Back up the existing database, then run `supabase/prayer-visibility-setup.sql` in SQL Editor. It expects the existing `altar_prayers` and `altar_profiles` tables used by this package. Do not run `schema.sql` as a substitute: it describes a different, older schema.
2. Under Authentication, enable the Email provider, email confirmations, and new-user signups. Configure an email delivery provider suitable for your public users. Existing onboarding records are not automatically Supabase Auth accounts; the verification flow creates an Auth account when needed.
3. In Authentication > Email Templates, configure the Magic Link template to show the code using `{{ .Token }}`. Also include the same token in the Confirm signup template so first-time users can enter their code. Example email body:

   ```html
   <h2>Cyber-Altar verification code</h2>
   <p>Enter this code in Cyber-Altar: {{ .Token }}</p>
   ```

4. Deploy the full package with the existing `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and server-only `SUPABASE_SERVICE_ROLE_KEY` environment variables. Never put the service-role key in a public variable.
5. Open an altar, send a verification code, and verify the email entered at the entrance. This step prevents another visitor from reading your secret prayers simply by typing your email address.

Deploy the database setup and updated application together during a maintenance window. Until both are installed, the previous application is not a private-prayer system. Do not revert to the old service-role Holy Place API, which did not enforce prayer visibility.

## Verify after deployment

- Use two different verified email accounts plus a signed-out/incognito browser.
- Offer a prayer as account A. Confirm Secret appears, it remains visible after reload, and neither account B nor the public wall can retrieve it.
- Choose Paste Prayer On Wall. Confirm it appears on the public wall, including from incognito.
- Choose Keep Prayer Secret. Confirm it disappears from the wall and account B cannot retrieve it through the database API.
- Switch email accounts and confirm verification is required for the new identity.
- Confirm failed saves report an error and leave visibility unchanged.
- Confirm altar deletion removes the owner's prayers and history only after server success.

The wall refreshes on database events, focus, and every five seconds while visible. A public prayer already read or copied by another person cannot be recalled. An already-open wall can show its previous content briefly until its next successful refresh.

## Data and compatibility notes

- Prayer ownership is snapshotted from the existing altar profile email during setup. Later profile/name changes cannot transfer secret prayers to a different email.
- Existing records without a profile email need manual ownership reconciliation by the site owner. They are not automatically assigned by a matching Pilgrim Name.
- The script replaces the `altar_prayers` access policies, enables row-level security, and allows only the verified owner to change visibility. Review any custom views/RPCs outside this package that expose this table before deployment: service-role code and owner-created views can bypass RLS.
- The Holy Place displays only the current pilgrim’s prayer and candle counters. The global counter panels and their page requests have been removed.
- The unused legacy prayer-write endpoint now returns HTTP 410. Use the current Holy Place prayer form.
- Altar deletion now requires the verified email session, checks server success, and runs transactionally.

## Validation performed

The production build and TypeScript compilation passed. Eleven local PostgreSQL-compatible privacy checks passed using representative existing tables, including anonymous and second-user denial, owner access, publish/hide, private defaults, forged-profile insertion denial, cascade protection, and atomic deletion. The setup script was also run twice locally to check repeatability.

The live Cyber-Altar database schema, custom database views/functions, email settings, and delivery were not accessible and have not been tested or changed. Run the deployment checks above against the actual Cyber-Altar project.

References:
https://supabase.com/docs/guides/auth/auth-email-passwordless
https://supabase.com/docs/guides/database/postgres/row-level-security
