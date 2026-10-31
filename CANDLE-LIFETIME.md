# 24-hour melting candles

Each prayer stores one UTC lighting timestamp per candle in `candle_lit_at`.
The candle body, wick and flame descend together as its remaining fraction
falls from 1 to 0 over 86,400,000 milliseconds. Expired candles and displayed
prayer/profile counts update every second without needing a page reload.
Focus refreshes the clock; a 30-second poll also synchronizes other devices.
The public wall derives its count from the same timestamps.

`supabase/candle-lifetime-setup.sql` is a one-time upgrade after the existing
prayer candle setup. Existing candles receive the migration timestamp because
the previous schema did not save their original lighting times. The scheduled
administrator-only expiry function runs every 30 seconds, even with browsers
closed. Saved prayer/profile counts can therefore trail the exact display
expiry by up to 30 seconds. Prayer text is never removed by candle expiry.
Lighting and expiry both lock the profile before changing prayer records.
Browser cached totals are never written back to the database.

Validation: TypeScript, production build with validation environment values,
clock boundary checks at 0h/12h/24h and staggered lifetimes, and database tests
inside a rolled-back transaction for expiry, count synchronization, idempotence,
unauthenticated lighting rejection, and maintenance access restrictions.
