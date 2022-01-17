import { TransactionCondition, SystemNotice, Error } from '../enums'

export type WindowDimensions = {
  width: number
  height: number
}

export type LocalTx = {
  hash: any
  type: string
  status: TransactionCondition
}

export type TxResult = {
  tx: any | null
  localTx: LocalTx | null
}

export type ErrorData = {
  type: Error
  metadata: string
  uniqueId: string
}

export type SystemNoticeData = {
  type: SystemNotice
  metadata: string
  uniqueId: string
}
