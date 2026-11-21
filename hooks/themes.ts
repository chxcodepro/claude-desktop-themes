import type { Theme } from '../types'
import { THUMBS } from './thumbs'

export const THEMES: Theme[] = [
  { id: 'claude', name: 'Claude', tagline: 'Claude 原本的配色' },
  {
    id: 'sakura-night', name: 'Sakura Night', tagline: '夜色里飘落的樱花，圆角，带一点回弹',
    bg: '#1d1418', text: '#f3e1e8', accent: '#f08fae', thumb: THUMBS['sakura-night'],
    vars: {
      'cds-radius': '14px', 'cds-radius-composer': '24px', 'cds-panel-radius': '22px',
      'cds-shadow-sm': '0 2px 10px rgba(0, 0, 0, .30)',
      'cds-shadow-md': '0 6px 20px rgba(0, 0, 0, .35), 0 0 0 1px rgba(240, 143, 174, .06)',
      'cds-shadow-lg': '0 12px 32px rgba(0, 0, 0, .45), 0 0 0 1px rgba(240, 143, 174, .08)',
      'cds-ease-out': 'cubic-bezier(.34, 1.56, .64, 1)', 'cds-dur-base': '.3s',
    },
    status: { idle: '🌸', tool: '🌸 {tool}…', error: '🥀 {tool} 失败', done: '🌙 完成' },
    deco: `<path d="M222 10 a11 11 0 1 0 6 20 a9 9 0 1 1 -6 -20 Z" fill="#f3e1e8" opacity=".22"/>
<g fill="#f4a6bd" opacity=".75"><ellipse cx="100" cy="20" rx="5" ry="3" transform="rotate(30 100 20)"/>
<ellipse cx="190" cy="90" rx="5" ry="3" transform="rotate(-20 190 90)"/>
<ellipse cx="130" cy="125" rx="4" ry="2.5" transform="rotate(60 130 125)"/></g>`,
  },
]

const mix = (a: string, b: string, k: number) =>
  '#' + [1, 3, 5].map(i => {
    const x = parseInt(a.slice(i, i + 2), 16), y = parseInt(b.slice(i, i + 2), 16)
    return Math.round(x + (y - x) * k).toString(16).padStart(2, '0')
  }).join('')

const esc = (s: string) => s.replace(/[&<>"]/g, c => `&#${c.charCodeAt(0)};`)
const px = (v: string | undefined, fallback: number) => (v && /^\d+(\.\d+)?px$/.test(v) ? parseFloat(v) : fallback)

export const preview = (t: Theme) => {
  const bg = t.bg ?? '#262624', text = t.text ?? '#f5f4ef', accent = t.accent ?? '#d97757'
  const side = mix(bg, text, .04), bubble = mix(bg, text, .1), muted = mix(text, bg, .55)
  const font = esc(t.font ?? "'Segoe UI', sans-serif")
  const r = Math.min(px(t.vars?.['cds-radius'], 6), 11), box = Math.min(px(t.vars?.['cds-radius-composer'], 12), 14)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="140" viewBox="0 0 240 140">
<clipPath id="w"><rect width="240" height="140" rx="10"/></clipPath><g clip-path="url(#w)">
<rect width="240" height="140" fill="${bg}"/>
<rect width="56" height="140" fill="${side}"/>
<rect x="9" y="14" width="38" height="6" rx="3" fill="${accent}"/>
<rect x="9" y="28" width="32" height="5" rx="2.5" fill="${muted}"/>
<rect x="9" y="39" width="36" height="5" rx="2.5" fill="${muted}"/>
<rect x="9" y="50" width="26" height="5" rx="2.5" fill="${muted}"/>
<rect x="148" y="12" width="82" height="22" rx="${r}" fill="${bubble}"/>
<text x="158" y="27" font-family="${font}" font-size="10" fill="${text}">Hi, Claude!</text>
<text x="66" y="54" font-family="${font}" font-size="10" fill="${text}">Hi! What shall we make?</text>
<rect x="66" y="62" width="150" height="5" rx="2.5" fill="${muted}"/>
<rect x="66" y="72" width="120" height="5" rx="2.5" fill="${muted}"/>
<rect x="66" y="102" width="164" height="28" rx="${box}" fill="${bubble}" stroke="${mix(bubble, text, .15)}"/>
<circle cx="216" cy="116" r="8" fill="${accent}"/>
${t.deco ?? ''}</g>
</svg>`
}

// scene: the person's own <id>.js sits beside the file, so a wallpaper named after the theme's own id is kept
export const parseUserTheme = (json: string, css?: string, scene = false): Theme | undefined => {
  let t: Record<string, unknown>
  try { t = JSON.parse(json) } catch { return undefined }
  const str = (v: unknown, max: number) => typeof v === 'string' && v.length > 0 && v.length <= max
  const hex = (v: unknown) => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v)
  if (!t || typeof t !== 'object' || typeof t.id !== 'string' || !/^[a-z][a-z0-9-]{1,40}$/.test(t.id)) return undefined
  if (!str(t.name, 60) || !hex(t.bg) || !hex(t.text) || !hex(t.accent)) return undefined
  const vars = Object.fromEntries(Object.entries(t.vars && typeof t.vars === 'object' ? t.vars : {})
    .filter(([k, v]) => /^[a-z][a-z0-9-]{0,80}$/.test(k) && str(v, 500)))
  const s = t.status as Record<string, unknown> | undefined
  const status = s && ['idle', 'tool', 'error', 'done'].every(k => str(s[k], 80))
    ? { idle: String(s.idle), tool: String(s.tool), error: String(s.error), done: String(s.done) } : undefined
  return {
    id: t.id, name: String(t.name), tagline: str(t.tagline, 200) ? String(t.tagline) : '',
    wallpaper: scene && t.wallpaper === t.id ? t.id : undefined,
    bg: String(t.bg), text: String(t.text), accent: String(t.accent),
    font: str(t.font, 200) ? String(t.font) : undefined, vars, status,
    deco: str(t.deco, 40000) ? String(t.deco) : undefined, css: css || undefined,
  }
}

export const tile = (t: Theme, on: boolean) => {
  const ring = on ? `<rect x="2" y="2" width="236" height="136" rx="12" fill="none" stroke="${t.accent ?? '#d97757'}" stroke-width="5"/>` : ''
  const shot = t.thumb ?? (t.wallpaper && THUMBS[t.wallpaper])
  if (!shot) return preview(t).replace('</svg>', `${ring}</svg>`)
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="240" height="140" viewBox="0 0 240 140">
<clipPath id="w"><rect width="240" height="140" rx="12"/></clipPath>
<image clip-path="url(#w)" width="240" height="140" preserveAspectRatio="xMidYMid slice" href="${shot}" xlink:href="${shot}"/>${ring}
</svg>`
}
