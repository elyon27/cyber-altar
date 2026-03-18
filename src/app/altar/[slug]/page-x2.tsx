'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type AltarProfile = {
  id: string;
  username: string;
  email: string | null;
  altar_slug: string;
  candle_count: number;
  created_at: string;
  updated_at: string;
};

type AltarPrayer = {
  id: string;
  profile_id: string;
  username: string;
  altar_slug: string;
  prayer_text: string;
  created_at: string;
};

<<<<<<< HEAD
type PreviousAltarItem = {
  altar_slug: string;
  created_at?: string;
};

type ScriptureEntry = {
  key: string;
  altar_slug: string;
  reference: string;
  text: string;
};

const ALTAR_SCRIPTURES: ScriptureEntry[] = [
  { key: 'scrpt001', altar_slug: 'al001', reference: 'Psalm 46:10', text: 'Be still, and know that I am God.' },
  { key: 'scrpt002', altar_slug: 'al002', reference: 'Proverbs 3:5', text: 'Trust in the Lord with all thine heart; and lean not unto thine own understanding.' },
  { key: 'scrpt003', altar_slug: 'al003', reference: 'Psalm 23:1', text: 'The Lord is my shepherd; I shall not want.' },
  { key: 'scrpt004', altar_slug: 'al004', reference: 'John 14:6', text: 'Jesus saith unto him, I am the way, the truth, and the life.' },
  { key: 'scrpt005', altar_slug: 'al005', reference: 'Romans 8:28', text: 'All things work together for good to them that love God.' },
  { key: 'scrpt006', altar_slug: 'al006', reference: 'Philippians 4:13', text: 'I can do all things through Christ which strengtheneth me.' },
  { key: 'scrpt007', altar_slug: 'al007', reference: 'Psalm 27:1', text: 'The Lord is my light and my salvation; whom shall I fear?' },
  { key: 'scrpt008', altar_slug: 'al008', reference: 'Isaiah 41:10', text: 'Fear thou not; for I am with thee: be not dismayed; for I am thy God.' },
  { key: 'scrpt009', altar_slug: 'al009', reference: 'Jeremiah 29:11', text: 'For I know the thoughts that I think toward you, saith the Lord, thoughts of peace, and not of evil.' },
  { key: 'scrpt010', altar_slug: 'al010', reference: 'Matthew 11:28', text: 'Come unto me, all ye that labour and are heavy laden, and I will give you rest.' },
  { key: 'scrpt011', altar_slug: 'al011', reference: 'Psalm 91:1', text: 'He that dwelleth in the secret place of the most High shall abide under the shadow of the Almighty.' },
  { key: 'scrpt012', altar_slug: 'al012', reference: 'Joshua 1:9', text: 'Be strong and of a good courage; be not afraid, neither be thou dismayed.' },
  { key: 'scrpt013', altar_slug: 'al013', reference: 'John 3:16', text: 'For God so loved the world, that he gave his only begotten Son.' },
  { key: 'scrpt014', altar_slug: 'al014', reference: 'Psalm 121:1-2', text: 'I will lift up mine eyes unto the hills, from whence cometh my help. My help cometh from the Lord.' },
  { key: 'scrpt015', altar_slug: 'al015', reference: 'Romans 12:2', text: 'Be ye transformed by the renewing of your mind.' },
  { key: 'scrpt016', altar_slug: 'al016', reference: '2 Corinthians 5:17', text: 'If any man be in Christ, he is a new creature.' },
  { key: 'scrpt017', altar_slug: 'al017', reference: 'James 1:5', text: 'If any of you lack wisdom, let him ask of God.' },
  { key: 'scrpt018', altar_slug: 'al018', reference: 'Hebrews 11:1', text: 'Now faith is the substance of things hoped for, the evidence of things not seen.' },
  { key: 'scrpt019', altar_slug: 'al019', reference: 'Psalm 34:8', text: 'O taste and see that the Lord is good: blessed is the man that trusteth in him.' },
  { key: 'scrpt020', altar_slug: 'al020', reference: 'Lamentations 3:22-23', text: 'It is of the Lord’s mercies that we are not consumed... they are new every morning.' },
  { key: 'scrpt021', altar_slug: 'al021', reference: 'Isaiah 40:31', text: 'They that wait upon the Lord shall renew their strength.' },
  { key: 'scrpt022', altar_slug: 'al022', reference: 'Romans 10:9', text: 'If thou shalt confess with thy mouth the Lord Jesus... thou shalt be saved.' },
  { key: 'scrpt023', altar_slug: 'al023', reference: 'Psalm 37:4', text: 'Delight thyself also in the Lord; and he shall give thee the desires of thine heart.' },
  { key: 'scrpt024', altar_slug: 'al024', reference: 'Micah 6:8', text: 'What doth the Lord require of thee, but to do justly, and to love mercy, and to walk humbly with thy God?' },
  { key: 'scrpt025', altar_slug: 'al025', reference: 'Matthew 5:14', text: 'Ye are the light of the world.' },
  { key: 'scrpt026', altar_slug: 'al026', reference: 'Psalm 51:10', text: 'Create in me a clean heart, O God; and renew a right spirit within me.' },
  { key: 'scrpt027', altar_slug: 'al027', reference: 'John 8:12', text: 'I am the light of the world: he that followeth me shall not walk in darkness.' },
  { key: 'scrpt028', altar_slug: 'al028', reference: 'Galatians 2:20', text: 'I am crucified with Christ: nevertheless I live; yet not I, but Christ liveth in me.' },
  { key: 'scrpt029', altar_slug: 'al029', reference: '1 Peter 5:7', text: 'Casting all your care upon him; for he careth for you.' },
  { key: 'scrpt030', altar_slug: 'al030', reference: 'Psalm 19:14', text: 'Let the words of my mouth, and the meditation of my heart, be acceptable in thy sight.' },
  { key: 'scrpt031', altar_slug: 'al031', reference: 'Ephesians 2:8', text: 'For by grace are ye saved through faith.' },
  { key: 'scrpt032', altar_slug: 'al032', reference: 'Romans 6:23', text: 'For the wages of sin is death; but the gift of God is eternal life through Jesus Christ our Lord.' },
  { key: 'scrpt033', altar_slug: 'al033', reference: 'Psalm 145:18', text: 'The Lord is nigh unto all them that call upon him.' },
  { key: 'scrpt034', altar_slug: 'al034', reference: 'Matthew 6:33', text: 'Seek ye first the kingdom of God, and his righteousness.' },
  { key: 'scrpt035', altar_slug: 'al035', reference: 'Psalm 119:105', text: 'Thy word is a lamp unto my feet, and a light unto my path.' },
  { key: 'scrpt036', altar_slug: 'al036', reference: 'Hebrews 13:8', text: 'Jesus Christ the same yesterday, and to day, and for ever.' },
  { key: 'scrpt037', altar_slug: 'al037', reference: 'Isaiah 26:3', text: 'Thou wilt keep him in perfect peace, whose mind is stayed on thee.' },
  { key: 'scrpt038', altar_slug: 'al038', reference: 'Psalm 62:1', text: 'Truly my soul waiteth upon God: from him cometh my salvation.' },
  { key: 'scrpt039', altar_slug: 'al039', reference: '1 Thessalonians 5:16-18', text: 'Rejoice evermore. Pray without ceasing. In every thing give thanks.' },
  { key: 'scrpt040', altar_slug: 'al040', reference: 'Mark 11:24', text: 'What things soever ye desire, when ye pray, believe that ye receive them, and ye shall have them.' },
  { key: 'scrpt041', altar_slug: 'al041', reference: 'Psalm 139:23-24', text: 'Search me, O God, and know my heart... and lead me in the way everlasting.' },
  { key: 'scrpt042', altar_slug: 'al042', reference: 'Colossians 3:15', text: 'Let the peace of God rule in your hearts.' },
  { key: 'scrpt043', altar_slug: 'al043', reference: 'Romans 5:8', text: 'God commendeth his love toward us, in that, while we were yet sinners, Christ died for us.' },
  { key: 'scrpt044', altar_slug: 'al044', reference: 'Psalm 100:4', text: 'Enter into his gates with thanksgiving, and into his courts with praise.' },
  { key: 'scrpt045', altar_slug: 'al045', reference: 'John 15:5', text: 'I am the vine, ye are the branches.' },
  { key: 'scrpt046', altar_slug: 'al046', reference: '2 Timothy 1:7', text: 'God hath not given us the spirit of fear; but of power, and of love, and of a sound mind.' },
  { key: 'scrpt047', altar_slug: 'al047', reference: 'Psalm 118:24', text: 'This is the day which the Lord hath made; we will rejoice and be glad in it.' },
  { key: 'scrpt048', altar_slug: 'al048', reference: 'Nahum 1:7', text: 'The Lord is good, a strong hold in the day of trouble; and he knoweth them that trust in him.' },
  { key: 'scrpt049', altar_slug: 'al049', reference: '1 John 4:19', text: 'We love him, because he first loved us.' },
  { key: 'scrpt050', altar_slug: 'al050', reference: 'Psalm 63:1', text: 'O God, thou art my God; early will I seek thee.' },
  { key: 'scrpt051', altar_slug: 'al051', reference: 'Romans 15:13', text: 'Now the God of hope fill you with all joy and peace in believing.' },
  { key: 'scrpt052', altar_slug: 'al052', reference: 'Matthew 28:20', text: 'Lo, I am with you alway, even unto the end of the world.' },
  { key: 'scrpt053', altar_slug: 'al053', reference: 'Psalm 103:2-3', text: 'Bless the Lord, O my soul, and forget not all his benefits: who forgiveth all thine iniquities.' },
  { key: 'scrpt054', altar_slug: 'al054', reference: 'Isaiah 43:2', text: 'When thou passest through the waters, I will be with thee.' },
  { key: 'scrpt055', altar_slug: 'al055', reference: 'Hebrews 4:16', text: 'Let us therefore come boldly unto the throne of grace.' },
  { key: 'scrpt056', altar_slug: 'al056', reference: 'Psalm 150:6', text: 'Let every thing that hath breath praise the Lord.' },
  { key: 'scrpt057', altar_slug: 'al057', reference: 'John 16:33', text: 'In the world ye shall have tribulation: but be of good cheer; I have overcome the world.' },
  { key: 'scrpt058', altar_slug: 'al058', reference: 'Zephaniah 3:17', text: 'The Lord thy God in the midst of thee is mighty; he will save.' },
  { key: 'scrpt059', altar_slug: 'al059', reference: 'Psalm 84:11', text: 'The Lord God is a sun and shield: the Lord will give grace and glory.' },
  { key: 'scrpt060', altar_slug: 'al060', reference: 'Philippians 4:6-7', text: 'Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.' },
  { key: 'scrpt061', altar_slug: 'al061', reference: '1 Chronicles 16:11', text: 'Seek the Lord and his strength, seek his face continually.' },
  { key: 'scrpt062', altar_slug: 'al062', reference: 'Psalm 73:26', text: 'God is the strength of my heart, and my portion for ever.' },
  { key: 'scrpt063', altar_slug: 'al063', reference: 'Matthew 7:7', text: 'Ask, and it shall be given you; seek, and ye shall find; knock, and it shall be opened unto you.' },
  { key: 'scrpt064', altar_slug: 'al064', reference: 'John 10:27', text: 'My sheep hear my voice, and I know them, and they follow me.' },
  { key: 'scrpt065', altar_slug: 'al065', reference: 'Psalm 16:11', text: 'In thy presence is fulness of joy; at thy right hand there are pleasures for evermore.' },
  { key: 'scrpt066', altar_slug: 'al066', reference: 'Ephesians 3:20', text: 'Now unto him that is able to do exceeding abundantly above all that we ask or think.' },
  { key: 'scrpt067', altar_slug: 'al067', reference: 'Psalm 18:2', text: 'The Lord is my rock, and my fortress, and my deliverer.' },
  { key: 'scrpt068', altar_slug: 'al068', reference: 'Romans 8:38-39', text: 'Nothing shall be able to separate us from the love of God, which is in Christ Jesus our Lord.' },
  { key: 'scrpt069', altar_slug: 'al069', reference: 'Isaiah 55:8-9', text: 'My thoughts are not your thoughts, neither are your ways my ways, saith the Lord.' },
  { key: 'scrpt070', altar_slug: 'al070', reference: 'Psalm 138:3', text: 'In the day when I cried thou answeredst me, and strengthenedst me with strength in my soul.' },
  { key: 'scrpt071', altar_slug: 'al071', reference: 'Revelation 3:20', text: 'Behold, I stand at the door, and knock.' },
  { key: 'scrpt072', altar_slug: 'al072', reference: 'Jude 1:24', text: 'Now unto him that is able to keep you from falling, and to present you faultless before the presence of his glory with exceeding joy.' },
];

function getScriptureEntry(altarSlug: string) {
  return ALTAR_SCRIPTURES.find((item) => item.altar_slug === altarSlug) ?? ALTAR_SCRIPTURES[0];
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString();
}

function normalizeSlug(value?: string) {
  return (value || '').trim().toLowerCase();
}

function getCandleStorageKey(username: string, altarSlug: string) {
  return `cyber_altar_candles_${username}_${altarSlug}`;
}

function getOwnerKey(username: string) {
  if (typeof window === 'undefined') return username;
  return (localStorage.getItem('cyber_altar_email') || '').trim().toLowerCase() || username;
}

function updateStoredPrayerCount(ownerKey: string, altarSlug: string, increment = 1) {
  if (typeof window === 'undefined' || !ownerKey || !altarSlug) return;

  const storageKey = `cyber_altar_prayer_counts_${ownerKey}`;
  const raw = localStorage.getItem(storageKey);

  let counts: Record<string, number> = {};

  try {
    counts = raw ? JSON.parse(raw) : {};
  } catch {
    counts = {};
  }

  counts[altarSlug] = Number(counts[altarSlug] || 0) + increment;
  localStorage.setItem(storageKey, JSON.stringify(counts));
}

function setStoredCandleCount(ownerKey: string, altarSlug: string, value: number) {
  if (typeof window === 'undefined' || !ownerKey || !altarSlug) return;

  const storageKey = `cyber_altar_candle_counts_${ownerKey}`;
  const raw = localStorage.getItem(storageKey);

  let counts: Record<string, number> = {};

  try {
    counts = raw ? JSON.parse(raw) : {};
  } catch {
    counts = {};
  }

  counts[altarSlug] = Number(value || 0);
  localStorage.setItem(storageKey, JSON.stringify(counts));
}

function writeAltarHistory(currentUsername: string, altarSlug: string) {
  if (typeof window === 'undefined' || !currentUsername || !altarSlug) return [];

  const normalizedSlug = normalizeSlug(altarSlug);
  const savedEmail = (localStorage.getItem('cyber_altar_email') || '').trim().toLowerCase();
  const ownerKey = savedEmail && currentUsername ? `${savedEmail}__${currentUsername.trim().toLowerCase()}` : savedEmail || currentUsername;
  const historyKey = `cyber_altar_history_${ownerKey}`;

  const existingRaw = localStorage.getItem(historyKey);

  let history: PreviousAltarItem[] = [];

  try {
    history = existingRaw ? JSON.parse(existingRaw) : [];
  } catch {
    history = [];
  }

  history = Array.isArray(history) ? history : [];
  history = history
    .map((item) => ({
      altar_slug: normalizeSlug(item?.altar_slug),
      created_at: item?.created_at,
    }))
    .filter((item) => item.altar_slug && item.altar_slug !== normalizedSlug);

  history.unshift({
    altar_slug: normalizedSlug,
    created_at: new Date().toISOString(),
  });

  localStorage.setItem(`cyber_altar_selected_slug_${ownerKey}`, normalizedSlug);
  localStorage.setItem('cyber_altar_selected_slug', normalizedSlug);
  localStorage.setItem('cyber_altar_username', currentUsername);
  localStorage.setItem(historyKey, JSON.stringify(history));
  window.dispatchEvent(new CustomEvent('cyber-altar-history-updated'));
  return history;
}

export default function HolyPlacePage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();

  const altarSlug = typeof params?.slug === 'string' ? normalizeSlug(params.slug) : '';
  const altarSlug = typeof params?.slug === 'string' ? params.slug : '';
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [profile, setProfile] = useState<AltarProfile | null>(null);
  const [prayers, setPrayers] = useState<AltarPrayer[]>([]);
  const [prayerText, setPrayerText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingPrayer, setSubmittingPrayer] = useState(false);
  const [lightingCandle, setLightingCandle] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [globalCandleCount, setGlobalCandleCount] = useState(0);

  const [globalPrayerCount, setGlobalPrayerCount] = useState(0);
  const altarImageSrc = useMemo(() => {
    return altarSlug ? `/altar/${altarSlug}.jpg` : '';
  }, [altarSlug]);

  const scriptureEntry = useMemo(() => getScriptureEntry(altarSlug), [altarSlug]);

  const loadGlobalCandleCount = useCallback(async (currentAltarSlug: string) => {
    const { data, error } = await supabase
      .from('altar_profiles')
      .select('candle_count')
      .eq('altar_slug', currentAltarSlug);

    if (error) {
      throw new Error(
        `altar_profiles candle total load failed: ${error.message}${
          error.details ? ` | details: ${error.details}` : ''
        }${error.hint ? ` | hint: ${error.hint}` : ''}`
      );
    }

    const total = (data ?? []).reduce(
      (sum, item) => sum + (Number(item.candle_count) || 0),
      0
    );

    setGlobalCandleCount(total);
  }, []);

  const loadGlobalPrayerCount = useCallback(async (currentAltarSlug: string) => {
    const { count, error } = await supabase
      .from('altar_prayers')
      .select('*', { count: 'exact', head: true })
      .eq('altar_slug', currentAltarSlug);

    if (error) {
      throw new Error(
        `altar_prayers global count load failed: ${error.message}${
          error.details ? ` | details: ${error.details}` : ''
        }${error.hint ? ` | hint: ${error.hint}` : ''}`
      );
    }

    setGlobalPrayerCount(count || 0);
  }, []);

  const loadPrayers = useCallback(async (profileId: string) => {
    const { data, error } = await supabase
      .from('altar_prayers')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(
        `altar_prayers load failed: ${error.message}${
          error.details ? ` | details: ${error.details}` : ''
        }${error.hint ? ` | hint: ${error.hint}` : ''}`
      );
    }

    setPrayers((data ?? []) as AltarPrayer[]);
  }, []);

  const ensureProfile = useCallback(
    async (currentUsername: string, currentEmail: string, currentAltarSlug: string) => {
      const loadExistingProfile = async () => {
        const { data, error } = await supabase
          .from('altar_profiles')
          .select('*')
          .eq('username', currentUsername)
          .eq('altar_slug', currentAltarSlug)
          .maybeSingle();

        if (error) {
          throw new Error(
            `altar_profiles select failed: ${error.message}${
              error.details ? ` | details: ${error.details}` : ''
            }${error.hint ? ` | hint: ${error.hint}` : ''}`
          );
        }

        return (data as AltarProfile | null) ?? null;
      };

      let nextProfile = await loadExistingProfile();

      if (!nextProfile) {
        const { data: insertedProfile, error: insertError } = await supabase
          .from('altar_profiles')
          .insert({
            username: currentUsername,
            email: currentEmail || null,
            altar_slug: currentAltarSlug,
            candle_count: 0,
          })
          .select('*')
          .single();

        if (insertError) {
          const isDuplicateProfile =
            insertError.code === '23505' ||
            /duplicate key value violates unique constraint/i.test(insertError.message || '');

          if (!isDuplicateProfile) {
            throw new Error(
              `altar_profiles insert failed: ${insertError.message}${
                insertError.details ? ` | details: ${insertError.details}` : ''
              }${insertError.hint ? ` | hint: ${insertError.hint}` : ''}`
            );
          }

          nextProfile = await loadExistingProfile();

          if (!nextProfile) {
            throw new Error(
              'altar_profiles insert encountered a duplicate record, but the existing profile could not be loaded.'
            );
          }
        } else {
          nextProfile = insertedProfile as AltarProfile;
        }
      }

      if (typeof window !== 'undefined') {
        const candleStorageKey = getCandleStorageKey(currentUsername, currentAltarSlug);
        const storedCandleCount = localStorage.getItem(candleStorageKey);
        const parsedStoredCount = storedCandleCount ? Number.parseInt(storedCandleCount, 10) : NaN;

        if (Number.isFinite(parsedStoredCount) && parsedStoredCount > (nextProfile.candle_count ?? 0)) {
    async (
      currentUsername: string,
      currentEmail: string,
      currentAltarSlug: string
    ) => {
      const { error: upsertError } = await supabase.from('altar_profiles').upsert(
        {
          username: currentUsername,
          email: currentEmail || null,
          altar_slug: currentAltarSlug,
        },
        {
          onConflict: 'username,altar_slug',
        }
      );

      if (upsertError) {
        throw new Error(
          `altar_profiles upsert failed: ${upsertError.message}${
            upsertError.details ? ` | details: ${upsertError.details}` : ''
          }${upsertError.hint ? ` | hint: ${upsertError.hint}` : ''}`
        );
      }

      const { data: profileData, error: profileError } = await supabase
        .from('altar_profiles')
        .select('*')
        .eq('username', currentUsername)
        .eq('altar_slug', currentAltarSlug)
        .single();

      if (profileError) {
        throw new Error(
          `altar_profiles select failed: ${profileError.message}${
            profileError.details ? ` | details: ${profileError.details}` : ''
          }${profileError.hint ? ` | hint: ${profileError.hint}` : ''}`
        );
      }

      let nextProfile = profileData as AltarProfile;

      if (typeof window !== 'undefined') {
        const candleStorageKey = getCandleStorageKey(
          currentUsername,
          currentAltarSlug
        );
        const storedCandleCount = localStorage.getItem(candleStorageKey);
        const parsedStoredCount = storedCandleCount
          ? Number.parseInt(storedCandleCount, 10)
          : NaN;

        if (
          Number.isFinite(parsedStoredCount) &&
          parsedStoredCount > (nextProfile.candle_count ?? 0)
        ) {
          const { data: updatedProfile, error: updateError } = await supabase
            .from('altar_profiles')
            .update({ candle_count: parsedStoredCount })
            .eq('id', nextProfile.id)
            .select()
            .single();

          if (!updateError && updatedProfile) {
            nextProfile = updatedProfile as AltarProfile;
          }
        }

        localStorage.setItem(candleStorageKey, String(nextProfile.candle_count ?? 0));

        const ownerKey = getOwnerKey(currentUsername);
        setStoredCandleCount(ownerKey, currentAltarSlug, Number(nextProfile.candle_count ?? 0));
        writeAltarHistory(currentUsername, currentAltarSlug);
      
        localStorage.setItem(
          candleStorageKey,
          String(nextProfile.candle_count ?? 0)
        );
      }

      setProfile(nextProfile);
      await loadPrayers(nextProfile.id);
      await loadGlobalCandleCount(currentAltarSlug);
      await loadGlobalPrayerCount(currentAltarSlug);

      return nextProfile;
    },
    [loadGlobalCandleCount, loadGlobalPrayerCount, loadPrayers]
      return nextProfile;
    },
    [loadGlobalCandleCount, loadPrayers]
  );

  useEffect(() => {
    const bootstrap = async () => {
      try {
        setLoading(true);
        setErrorMessage('');

        const storedUsername =
          typeof window !== 'undefined' ? localStorage.getItem('cyber_altar_username') || '' : '';

        const storedEmail =
          typeof window !== 'undefined' ? localStorage.getItem('cyber_altar_email') || '' : '';

        const storedSelectedSlug =
          typeof window !== 'undefined' ? localStorage.getItem('cyber_altar_selected_slug') || '' : '';

        if (!storedUsername) {
          setErrorMessage('No pilgrim was found. Please return to the altar selection screen.');

          typeof window !== 'undefined'
            ? localStorage.getItem('cyber_altar_username') || ''
            : '';

        const storedEmail =
          typeof window !== 'undefined'
            ? localStorage.getItem('cyber_altar_email') || ''
            : '';

        const storedSelectedSlug =
          typeof window !== 'undefined'
            ? localStorage.getItem('cyber_altar_selected_slug') || ''
            : '';

        if (!storedUsername) {
          setErrorMessage(
            'No pilgrim was found. Please return to the altar selection screen.'
          );
          setLoading(false);
          return;
        }

        if (!altarSlug) {
          setErrorMessage('No altar was selected.');
          setLoading(false);
          return;
        }

        if (typeof window !== 'undefined') {
          if (storedSelectedSlug !== altarSlug) {
            localStorage.setItem('cyber_altar_selected_slug', altarSlug);
          }
          writeAltarHistory(storedUsername, altarSlug);
        if (typeof window !== 'undefined' && storedSelectedSlug !== altarSlug) {
          localStorage.setItem('cyber_altar_selected_slug', altarSlug);
        }

        setUsername(storedUsername);
        setEmail(storedEmail);

        await ensureProfile(storedUsername, storedEmail, altarSlug);
      } catch (error: any) {
        console.error('Holy Place load error:', error);
        setErrorMessage(
          `Failed to load the Holy Place: ${
            error?.message || error?.details || error?.hint || JSON.stringify(error)
            error?.message ||
            error?.details ||
            error?.hint ||
            JSON.stringify(error)
          }`
        );
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [altarSlug, ensureProfile]);

  useEffect(() => {
    if (!altarSlug || !profile?.id) return;

    const prayerChannel = supabase
      .channel(`holy-place-prayers-${altarSlug}-${profile.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'altar_prayers',
          filter: `profile_id=eq.${profile.id}`,
        },
        async () => {
          await loadPrayers(profile.id);
          await loadGlobalPrayerCount(altarSlug);
        }
      )
      .subscribe();

    const candleChannel = supabase
      .channel(`holy-place-candles-${altarSlug}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'altar_profiles',
          filter: `altar_slug=eq.${altarSlug}`,
        },
        async () => {
          await loadGlobalCandleCount(altarSlug);

          const { data } = await supabase
            .from('altar_profiles')
            .select('*')
            .eq('username', username)
            .eq('altar_slug', altarSlug)
            .maybeSingle();

          if (data) {
            const nextProfile = data as AltarProfile;
            setProfile(nextProfile);

            if (typeof window !== 'undefined') {
              localStorage.setItem(
                getCandleStorageKey(username, altarSlug),
                String(nextProfile.candle_count ?? 0)
              );

              const ownerKey = getOwnerKey(username);
              setStoredCandleCount(ownerKey, altarSlug, Number(nextProfile.candle_count ?? 0));
              writeAltarHistory(username, altarSlug);
            }

            .single();

          if (data) {
            setProfile(data as AltarProfile);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(prayerChannel);
      supabase.removeChannel(candleChannel);
    };

  }, [altarSlug, loadGlobalCandleCount, loadGlobalPrayerCount, loadPrayers, profile?.id, username]);

  }, [altarSlug, loadGlobalCandleCount, loadPrayers, profile?.id, username]);

  const handleSubmitPrayer = async (event: FormEvent) => {
    event.preventDefault();

    if (!profile) return;

    const trimmedPrayer = prayerText.trim();
    if (!trimmedPrayer) return;

    try {
      setSubmittingPrayer(true);
      setErrorMessage('');

      const { error } = await supabase.from('altar_prayers').insert({
        profile_id: profile.id,
        username: profile.username,
        altar_slug: profile.altar_slug,
        prayer_text: trimmedPrayer,
      });

      if (error) {
        throw error;
      }

      setPrayerText('');
      await loadPrayers(profile.id);
      await loadGlobalPrayerCount(profile.altar_slug);

      if (typeof window !== 'undefined') {
        const ownerKey = getOwnerKey(profile.username);
        updateStoredPrayerCount(ownerKey, profile.altar_slug, 1);
        writeAltarHistory(profile.username, profile.altar_slug);
      }

      const { data } = await supabase.from('altar_profiles').select('*').eq('id', profile.id).single();

      if (data) {
        setProfile(data as AltarProfile);
      }

    } catch (error) {
      console.error(error);
      setErrorMessage('Failed to submit prayer.');
    } finally {
      setSubmittingPrayer(false);
    }
  };

  const handleLightCandle = async () => {
    if (!profile) return;

    try {
      setLightingCandle(true);
      setErrorMessage('');

      const nextCount = (profile.candle_count ?? 0) + 1;

      if (typeof window !== 'undefined') {
        const candleStorageKey = getCandleStorageKey(username, altarSlug);
        localStorage.setItem(candleStorageKey, String(nextCount));
      }

      const { data, error } = await supabase
        .from('altar_profiles')
        .update({ candle_count: nextCount })
        .eq('id', profile.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      const updatedProfile = data as AltarProfile;
      setProfile(updatedProfile);

      if (typeof window !== 'undefined') {
        const candleStorageKey = getCandleStorageKey(username, altarSlug);
        localStorage.setItem(candleStorageKey, String(updatedProfile.candle_count ?? nextCount));

        const ownerKey = getOwnerKey(username);
        setStoredCandleCount(ownerKey, altarSlug, Number(updatedProfile.candle_count ?? nextCount));
        writeAltarHistory(username, altarSlug);
        localStorage.setItem(
          candleStorageKey,
          String(updatedProfile.candle_count ?? nextCount)
        );
      }

      await loadGlobalCandleCount(altarSlug);
    } catch (error) {
      console.error(error);
      setErrorMessage('Failed to light candle.');
    } finally {
      setLightingCandle(false);
    }
  };

  const handleReturnToSelection = () => {
    if (typeof window !== 'undefined') {
      if (username) {
        localStorage.setItem('cyber_altar_username', username);
      }

      if (email) {
        localStorage.setItem('cyber_altar_email', email);
      }

      if (altarSlug) {
        localStorage.setItem('cyber_altar_selected_slug', altarSlug);
        writeAltarHistory(username, altarSlug);
      }

      if (profile) {
        const candleStorageKey = getCandleStorageKey(username, altarSlug);
        localStorage.setItem(candleStorageKey, String(profile.candle_count ?? 0));

        const ownerKey = getOwnerKey(username);
        setStoredCandleCount(ownerKey, altarSlug, Number(profile.candle_count ?? 0));
        localStorage.setItem(
          candleStorageKey,
          String(profile.candle_count ?? 0)
        );
      }
    }

    router.push('/select-altar');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
        <div className="mx-auto max-w-6xl rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-lg font-medium">Loading the Holy Place...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-start gap-3">
              <h1 className="text-3xl font-bold">Holy Place</h1>
              <div className="max-w-2xl rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200/80">
                  {scriptureEntry.key.toUpperCase()} • {scriptureEntry.reference}
                </p>
                <p className="mt-2 text-sm leading-6 text-amber-50">{scriptureEntry.text}</p>
              </div>
            </div>
            <p className="mt-3 text-white/75">Pilgrim: {username}</p>
            <p className="text-white/60">Selected Altar: {altarSlug.toUpperCase()}</p>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-5">
          <div>
            <h1 className="text-3xl font-bold">Holy Place</h1>
            <p className="mt-1 text-white/75">Pilgrim: {username}</p>
            <p className="text-white/60">Selected Altar: {altarSlug}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleReturnToSelection}
              className="rounded-xl border border-white/20 px-4 py-3 font-medium hover:bg-white/10"
            >
              Return to Altar Selection
            </button>

            <Link href="/" className="rounded-xl border border-white/20 px-4 py-3 font-medium hover:bg-white/10">
              Main Introduction
            <Link
              href="https://crownmind.netlify.app"
              className="rounded-xl bg-amber-500 px-4 py-3 font-semibold text-slate-950"
            >
              Exit to CrownMind
            </Link>
          </div>
        </div>

        {errorMessage ? (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-100">
          <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm">
            {errorMessage}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
              {altarImageSrc ? (
                <Image
                  src={altarImageSrc}
                  alt={altarSlug}
                  width={1200}
                  height={900}
                  className="h-auto w-full object-cover"
                  priority
                />
              ) : (
                <div className="flex min-h-[320px] items-center justify-center text-white/60">
                  No altar image available.
                </div>
              )}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-white/60">Your Prayers Offered</p>
                <p className="mt-2 text-3xl font-bold">{prayers.length}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-white/60">Your Candles Lighted</p>
                <p className="mt-2 text-3xl font-bold">{profile?.candle_count ?? 0}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-white/60">Global Candles For This Altar</p>
                <p className="mt-2 text-3xl font-bold">{globalCandleCount}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-white/60">Global Prayers For This Altar</p>
                <p className="mt-2 text-3xl font-bold">{globalPrayerCount}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleLightCandle}
                disabled={lightingCandle || !profile}
                className="rounded-xl border border-amber-400/40 bg-amber-400/20 px-5 py-3 font-semibold text-amber-100 transition hover:bg-amber-400/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {lightingCandle ? 'Lighting Candle...' : 'Light Candle'}
              </button>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-xl font-semibold">Offer a Prayer</h2>

              <form className="mt-4 space-y-4" onSubmit={handleSubmitPrayer}>
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="relative mx-auto mb-5 h-[420px] w-full max-w-xl overflow-hidden rounded-2xl border border-white/10">
              {altarImageSrc ? (
                <Image
                  src={altarImageSrc}
                  alt={`Selected altar ${altarSlug}`}
                  fill
                  className="object-cover"
                  priority
                />
              ) : null}
            </div>

            <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-5">
              <p className="text-lg font-semibold">Your Candles Lighted</p>
              <p className="mt-2 text-4xl font-bold">
                {profile?.candle_count ?? 0}
              </p>

              <p className="mt-5 text-lg font-semibold text-amber-100">
                Global Candles for this Altar
              </p>
              <p className="mt-2 text-4xl font-bold text-amber-300">
                {globalCandleCount}
              </p>

              <div className="mt-4 flex items-center gap-4">
                <Image
                  src="/images/candle.jpg"
                  alt="Candle"
                  width={60}
                  height={120}
                  className="rounded-lg shadow-lg"
                />

                <button
                  type="button"
                  onClick={handleLightCandle}
                  disabled={lightingCandle}
                  className="rounded-xl bg-amber-500 px-5 py-3 font-semibold text-slate-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {lightingCandle ? 'Lighting Candle...' : 'Light Candle'}
                </button>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <form
              onSubmit={handleSubmitPrayer}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <h2 className="text-xl font-semibold">Enter Your Prayer</h2>

              <div className="mt-4 rounded-2xl border border-white/20 bg-slate-900/70 p-3">
                <textarea
                  value={prayerText}
                  onChange={(event) => setPrayerText(event.target.value)}
                  placeholder="Write your prayer here..."
                  className="min-h-[150px] w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-white/40 focus:border-cyan-400/50"
                />

                <button
                  type="submit"
                  disabled={submittingPrayer || !prayerText.trim()}
                  className="rounded-xl border border-cyan-400/40 bg-cyan-400/20 px-5 py-3 font-semibold text-cyan-100 transition hover:bg-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submittingPrayer ? 'Offering Prayer...' : 'Offer Prayer'}
                </button>
              </form>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-xl font-semibold">Your Offered Prayers</h2>

              <div className="mt-4 space-y-3">
                {prayers.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-white/65">
                    No prayers offered yet.
                  </div>
                ) : (
                  prayers.map((prayer) => (
                    <article
                      key={prayer.id}
                      className="rounded-2xl border border-white/10 bg-black/20 p-4"
                    >
                      <p className="whitespace-pre-wrap text-white/90">{prayer.prayer_text}</p>
                      <p className="mt-3 text-xs text-white/50">{formatDate(prayer.created_at)}</p>
                    </article>
                  ))
                )}
              </div>
            </section>
          </aside>
                  className="min-h-[160px] w-full resize-none bg-transparent outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submittingPrayer || !prayerText.trim()}
                className="mt-4 rounded-xl bg-blue-500 px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submittingPrayer ? 'Submitting Prayer...' : 'Submit Prayer'}
              </button>
            </form>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-xl font-semibold">Former Prayers</h2>

              {prayers.length === 0 ? (
                <p className="mt-4 text-white/70">No former prayers yet.</p>
              ) : (
                <div className="mt-4 space-y-4">
                  {prayers.map((prayer) => (
                    <div
                      key={prayer.id}
                      className="rounded-2xl border border-white/10 bg-slate-900/60 p-4"
                    >
                      <p className="text-xs uppercase tracking-wide text-white/50">
                        {formatDate(prayer.created_at)}
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-white/90">
                        {prayer.prayer_text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
}
