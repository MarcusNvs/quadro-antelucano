import { ImageResponse } from 'next/og'

/* OG image gerada dinamicamente (Next 15 + Satori). O Next injeta as meta
   tags og:image e twitter:image apontando para esta rota automaticamente.
   Estética de nameplate de jornal, alinhada aos tokens do globals.css. */

export const alt = 'Quadro Antelucano — O jornal antes do amanhecer.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ede1c4',
          padding: '60px 80px',
        }}
      >
        {/* Régua dupla superior */}
        <div style={{ display: 'flex', width: '100%', height: 8, backgroundColor: '#1c1208' }} />
        <div style={{ display: 'flex', width: '100%', height: 3, backgroundColor: '#1c1208', marginTop: 5 }} />

        {/* Meta da edição */}
        <div
          style={{
            display: 'flex',
            fontSize: 26,
            letterSpacing: 12,
            color: '#4a2e16',
            marginTop: 56,
          }}
        >
          EDIÇÃO ANTELUCANA
        </div>

        {/* Nameplate */}
        <div style={{ display: 'flex', alignItems: 'baseline', marginTop: 20, fontSize: 112, fontWeight: 700 }}>
          <div style={{ display: 'flex', color: '#1c1208' }}>Quadro Antelucano</div>
          <div style={{ display: 'flex', color: '#8a1e10' }}>.</div>
        </div>

        {/* Tagline com separador (Satori não tem glyph para ✦) */}
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 28, fontSize: 34, color: '#4a2e16' }}>
          <div style={{ display: 'flex' }}>O jornal antes do amanhecer</div>
          <div style={{ display: 'flex', color: '#8a1e10', marginLeft: 16, marginRight: 16 }}>·</div>
          <div style={{ display: 'flex' }}>Brasil e mundo</div>
        </div>

        {/* Régua inferior */}
        <div style={{ display: 'flex', width: '100%', height: 3, backgroundColor: '#1c1208', marginTop: 56 }} />
      </div>
    ),
    { ...size }
  )
}
