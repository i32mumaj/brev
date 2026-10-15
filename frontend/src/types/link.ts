// Data shapes exactly as the backend returns them.

export interface CreateLinkResponse {
  short_url: string
}

export interface LinkStats {
  original_url: string
  short_code: string
  created_at: string
  click_count: number
}

export interface DailyClicks {
  date: string
  count: number
}
