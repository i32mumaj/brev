// Formas de datos tal y como las devuelve el backend.

export interface CreateLinkResponse {
  short_url: string
}

export interface LinkStats {
  original_url: string
  short_code: string
  created_at: string
  click_count: number
}
