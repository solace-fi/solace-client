// import { SolaceRiskSeries } from '@solace-fi/sdk-nightly'

// // a nothing object
// const a = {}
// // we type it as if it were a SolaceRiskSeries
// const typedSeries = (a as unknown) as SolaceRiskSeries
// // we create a new object with the same properties as the type, to be able to pull use the properties without "x of undefined" errors
// const b: any = {
//   metadata: '',
//   function: {
//     name: 'string',
//     description: 'string',
//     provenance: 'string',
//   },
//   data: {
//     protocolMap: 'ProtocolMap[]',
//     corrValue: 'CorrelationValue[]',
//     correlCat: 'CorrelationCategory[]',
//     rateCard: 'RateCard[]',
//   },
// }
// // we take out the ProtocolMap[]
// const typedProtocolMapArr = b.data.protocolMap as typeof typedSeries.data.protocolMap
// // we take out first ProtocolMap
// const typedProtocolMapItem = typedProtocolMapArr[0]
// // we type it as Protocol to use it later
// export type Protocol = typeof typedProtocolMapItem
// export type Metadata = typeof typedSeries.metadata
// export type CorrelationValue = typeof typedSeries.data.corrValue[0]
// export type CorrelationCategory = typeof typedSeries.data.correlCat[0]
// export type RateCard = typeof typedSeries.data.rateCard[0]

// export type ClientSideProtocol = {
//   appId: string
//   category: string
//   tier: number
//   clientSideProcessedName: string
// }

// export type ClientSideRiskSeries = {
//   metadata: Metadata
//   function: {
//     name: string
//     description: string
//     provenance: string
//   }
//   data: {
//     protocolMap: ClientSideProtocol[]
//     corrValue: CorrelationValue[]
//     correlCat: CorrelationCategory[]
//     rateCard: RateCard[]
//   }
// }
export {}
