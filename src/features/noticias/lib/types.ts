export type Region = 'world' | 'br'

export interface Section {
  id: string
  label: string
  accent: string
  url: string
  region: Region
}

export interface FeedItem {
  id: string
  title: string
  link: string
  image: string | null
  description: string
  rawDate: string
  formattedDate: string
  source: Section
}

export interface FeedResponse {
  items: FeedItem[]
  error?: string
}
