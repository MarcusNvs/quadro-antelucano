/* Reescreve URLs de imagem para versões em alta resolução, quando o host
   expõe a largura no path/query. Os feeds RSS entregam thumbnails (240–320px),
   que ficam borrados quando esticados para o hero (~1100px de largura). */

export function upgradeImageQuality(url: string): string {
  let u: URL
  try { u = new URL(url) } catch { return url }

  switch (u.hostname) {
    // BBC: /news/240/cpsprodpb/... ou /ace/standard/240/...
    // Larguras suportadas: 80, 240, 320, 480, 640, 800, 976, 1024, 1536
    case 'ichef.bbci.co.uk':
      return url.replace(/\/(news|ace\/standard|ace\/ws)\/\d{2,4}\//, '/$1/1024/')

    // Wired (Cloudinary-style): /w_320,c_limit/ → /w_1280,c_limit/
    case 'media.wired.com':
      return url.replace(/\/w_\d{2,4}([,/])/, '/w_1280$1')

    // Lifehacker / Kinja: idem
    case 'i.kinja-img.com':
      return url.replace(/\/w_\d{2,4}([,/])/, '/w_1280$1')

    // Vox CDN (The Verge): thumbor com WxH no path — risky (hash valida),
    // mas as URLs do RSS já vêm em ~1400px. Sem operação.
    case 'cdn.vox-cdn.com':
      return url

    // Reddit preview/external: parâmetro `s=` valida a request — não mexer.
    // A preferência por i.redd.it (resolução original) já é feita no parser.
    default:
      return url
  }
}
