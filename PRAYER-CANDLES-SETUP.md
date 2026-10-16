# Candles for individual prayers

1. In your Cyber-Altar Supabase project, open SQL Editor > New query.
2. Run `supabase/prayer-candles-setup.sql`. The earlier prayer visibility setup must already be installed. If setting up from an older version, run `supabase/prayer-visibility-setup.sql` first.
3. Deploy this updated package to Netlify using your existing process.
4. Open an altar with two prayers. Light a candle beneath one prayer. Only that prayer's count and the altar total should increase. Refresh and check that the count remains saved.

The main-section Light Candle button has been removed. Each offered prayer now has its own Light Candle button and Candles Lighted indicator. Prayer visibility controls remain available.

Existing altar candle totals are retained. Individual prayers start at zero because earlier candles were not associated with a prayer. New candles increment both counts in one database transaction. The action requires the verified prayer owner's session and respects existing row-level security.

This package does not apply the SQL to your live database or deploy the website automatically.
