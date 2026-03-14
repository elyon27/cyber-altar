'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

type PrayerItem = {
  id: string
  text: string
  createdAt: string
}

export default function HolyPlace() {
  const [username, setUsername] = useState('')
  const [altarSlug, setAltarSlug] = useState('al001')
  const [prayerText, setPrayerText] = useState('')
  const [prayers, setPrayers] = useState<PrayerItem[]>([])
  const [candleCount, setCandleCount] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isSubmittingPrayer, setIsSubmittingPrayer] = useState(false)
  const [isLightingCandle, setIsLightingCandle] = useState(false)

  const altarImageSrc = useMemo(() => {
    return `/altar/${altarSlug}.jpg`
  }, [altarSlug])

  useEffect(() => {
    try {
      const savedUsername =
        localStorage.getItem('cyber_altar_username') ||
        localStorage.getItem('altar_username') ||
        ''

      const savedAltarSlug =
        localStorage.getItem('cyber_altar_selected_altar') ||
        localStorage.getItem('selected_altar_slug') ||
        'al001'

      const savedPrayerHistoryRaw =
        localStorage.getItem(`cyber_altar_prayers_${savedUsername}_${savedAltarSlug}`) ||
        localStorage.getItem(`cyber_altar_prayers_${savedUsername}`) ||
        '[]'

      const savedCandleCountRaw =
        localStorage.getItem(`cyber_altar_candles_${savedUsername}_${savedAltarSlug}`) ||
        localStorage.getItem(`cyber_altar_candles_${savedUsername}`) ||
        '0'

      let parsedPrayers: PrayerItem[] = []
      try {
        const data = JSON.parse(savedPrayerHistoryRaw)
        if (Array.isArray(data)) {
          parsedPrayers = data.map((item, index) => ({
            id: String(item?.id ?? `${Date.now()}-${index}`),
            text: String(item?.text ?? item?.prayer_text ?? item?.prayer ?? ''),
            createdAt: String(
              item?.createdAt ?? item?.created_at ?? new Date().toISOString()
            ),
          }))
        }
      } catch {
        parsedPrayers = []
      }

      setUsername(savedUsername)
      setAltarSlug(savedAltarSlug)
      setPrayers(parsedPrayers)
      setCandleCount(Number(savedCandleCountRaw) || 0)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!isLoaded || !username) return

    localStorage.setItem('cyber_altar_username', username)
    localStorage.setItem('cyber_altar_selected_altar', altarSlug)
    localStorage.setItem(
      `cyber_altar_prayers_${username}_${altarSlug}`,
      JSON.stringify(prayers)
    )
    localStorage.setItem(
      `cyber_altar_candles_${username}_${altarSlug}`,
      String(candleCount)
    )
  }, [username, altarSlug, prayers, candleCount, isLoaded])

  const handleSubmitPrayer = () => {
    const trimmed = prayerText.trim()
    if (!trimmed) return

    setIsSubmittingPrayer(true)

    const newPrayer: PrayerItem = {
      id: `${Date.now()}`,
      text: trimmed,
      createdAt: new Date().toISOString(),
    }

    setPrayers((prev) => [newPrayer, ...prev])
    setPrayerText('')

    setTimeout(() => {
      setIsSubmittingPrayer(false)
    }, 250)
  }

  const handleLightCandle = () => {
    setIsLightingCandle(true)
    setCandleCount((prev) => prev + 1)

    setTimeout(() => {
      setIsLightingCandle(false)
    }, 250)
  }

  const formatDate = (value: string) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleString()
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(180deg, #071a3d 0%, #0f2f6b 45%, #163d84 100%)',
        color: '#ffffff',
        padding: '24px 16px 48px',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            marginBottom: 24,
          }}
        >
          <h1
            style={{
              fontSize: '2.1rem',
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            The Holy Place
          </h1>

          <p
            style={{
              margin: 0,
              color: '#d8e6ff',
              fontSize: '1rem',
            }}
          >
            Enter reverently, offer your prayer, and light your candle before the altar.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 20,
          }}
        >
          <section
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.16)',
              borderRadius: 16,
              padding: 18,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                gap: 12,
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '0.95rem',
                    color: '#cfe0ff',
                    marginBottom: 6,
                  }}
                >
                  Pilgrim
                </div>
                <div
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 700,
                  }}
                >
                  {username || 'Guest'}
                </div>
              </div>

              <div
                style={{
                  textAlign: 'right',
                }}
              >
                <div
                  style={{
                    fontSize: '0.95rem',
                    color: '#cfe0ff',
                    marginBottom: 6,
                  }}
                >
                  Chosen Altar
                </div>
                <div
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  {altarSlug}
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: 20,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    maxWidth: 560,
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: 18,
                    padding: 14,
                    border: '1px solid rgba(255,255,255,0.14)',
                  }}
                >
                  <img
                    src={altarImageSrc}
                    alt={`Altar ${altarSlug}`}
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      borderRadius: 14,
                      objectFit: 'cover',
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gap: 16,
                }}
              >
                <div
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.14)',
                    borderRadius: 16,
                    padding: 16,
                  }}
                >
                  <label
                    htmlFor="prayer-input"
                    style={{
                      display: 'block',
                      fontWeight: 700,
                      marginBottom: 10,
                    }}
                  >
                    Enter your prayer
                  </label>

                  <textarea
                    id="prayer-input"
                    value={prayerText}
                    onChange={(e) => setPrayerText(e.target.value)}
                    placeholder="Write your prayer here..."
                    rows={5}
                    style={{
                      width: '100%',
                      borderRadius: 12,
                      border: '1px solid rgba(255,255,255,0.18)',
                      background: 'rgba(5,18,48,0.72)',
                      color: '#ffffff',
                      padding: 12,
                      resize: 'vertical',
                      outline: 'none',
                      fontSize: '0.98rem',
                      boxSizing: 'border-box',
                    }}
                  />

                  <div
                    style={{
                      marginTop: 14,
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 12,
                    }}
                  >
                    <button
                      type="button"
                      onClick={handleSubmitPrayer}
                      disabled={isSubmittingPrayer}
                      style={{
                        background: '#f4c542',
                        color: '#102347',
                        border: 'none',
                        borderRadius: 12,
                        padding: '12px 18px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {isSubmittingPrayer ? 'Submitting...' : 'Submit Prayer'}
                    </button>

                    <button
                      type="button"
                      onClick={handleLightCandle}
                      disabled={isLightingCandle}
                      style={{
                        background: '#ffffff',
                        color: '#102347',
                        border: 'none',
                        borderRadius: 12,
                        padding: '12px 18px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {isLightingCandle ? 'Lighting...' : 'Light Candle'}
                    </button>

                    <Link
                      href="/altar-selection"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textDecoration: 'none',
                        background: 'transparent',
                        color: '#ffffff',
                        border: '1px solid rgba(255,255,255,0.28)',
                        borderRadius: 12,
                        padding: '12px 18px',
                        fontWeight: 700,
                      }}
                    >
                      Return to Altar Selection
                    </Link>

                    <Link
                      href="/"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textDecoration: 'none',
                        background: 'transparent',
                        color: '#ffffff',
                        border: '1px solid rgba(255,255,255,0.28)',
                        borderRadius: 12,
                        padding: '12px 18px',
                        fontWeight: 700,
                      }}
                    >
                      Exit
                    </Link>
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: 16,
                  }}
                >
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.14)',
                      borderRadius: 16,
                      padding: 16,
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.95rem',
                        color: '#cfe0ff',
                        marginBottom: 8,
                      }}
                    >
                      Candles Lighted
                    </div>
                    <div
                      style={{
                        fontSize: '2rem',
                        fontWeight: 800,
                      }}
                    >
                      {candleCount}
                    </div>
                  </div>

                  <div
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.14)',
                      borderRadius: 16,
                      padding: 16,
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.95rem',
                        color: '#cfe0ff',
                        marginBottom: 8,
                      }}
                    >
                      Stored Prayers
                    </div>
                    <div
                      style={{
                        fontSize: '2rem',
                        fontWeight: 800,
                      }}
                    >
                      {prayers.length}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.16)',
              borderRadius: 16,
              padding: 18,
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: 14,
                fontSize: '1.3rem',
              }}
            >
              Former Prayers
            </h2>

            {!isLoaded ? (
              <p style={{ color: '#d8e6ff', margin: 0 }}>Loading prayers...</p>
            ) : prayers.length === 0 ? (
              <p style={{ color: '#d8e6ff', margin: 0 }}>
                No prayers have been stored yet for this altar.
              </p>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gap: 12,
                }}
              >
                {prayers.map((prayer) => (
                  <article
                    key={prayer.id}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 14,
                      padding: 14,
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.85rem',
                        color: '#cfe0ff',
                        marginBottom: 8,
                      }}
                    >
                      {formatDate(prayer.createdAt)}
                    </div>

                    <div
                      style={{
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {prayer.text}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}