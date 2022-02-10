export type BasicData = {
  address: string
  name: string
}

export type StringToStringMapping = { [key: string]: string }

export type TokenToPriceMapping = { [key: string]: number }

export type ZerionPosition = {
  apr: any
  asset: ZerionAsset
  chain: string | null
  id: string | null
  included_in_chart: boolean
  is_displayable: boolean
  name: string | null
  parent_id: any | null
  protocol: string | null
  quantity: string | null
  type: string | null
  value: number
}

export type ZerionAsset = {
  asset_code: string | null
  decimals: number
  icon_url: string | null
  id: string | null
  implementations: {
    [key: string]: {
      address: string | null
      decimals: number
    }
  }
  is_displayable: boolean
  is_verified: boolean
  name: string | null
  price: ZerionAssetPrice
  symbol: string | null
  type: string | null
}

export type ZerionAssetPrice = {
  changed_at: number
  relative_change_24h: number
  value: number
}
