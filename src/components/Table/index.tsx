import React from 'react'
import styled from 'styled-components'

interface TableProps {
  isHighlight?: boolean
  isQuote?: boolean
  cellAlignLeft?: boolean
  cellAlignCenter?: boolean
  cellAlignRight?: boolean
  headers?: string[]
  body?: { data: string[]; status: boolean }[]
  width?: number
  disabled?: boolean
}

const handleCellAlign = (props: TableProps) => {
  if (props.cellAlignLeft) return 'text-align: left;'
  if (props.cellAlignCenter) return 'text-align: center;'
  if (props.cellAlignRight) return 'text-align: right;'
}

const TableBase = styled.table<TableProps>`
  width: 100%;
  border-spacing: 0px 10px;
  th,
  td {
    ${(props) => handleCellAlign(props)}
  }
  ${(props) => props.isHighlight && 'td {background-color: rgba(0, 255, 209, 0.3);}'}
  ${(props) =>
    props.isQuote &&
    'tr { &:hover { td { background-color: rgba(255, 255, 255, 0.5); transition: background-color 200ms linear;} } }'}
`

export const TableRow = styled.tr<TableProps>`
  cursor: pointer;
  ${(props) =>
    props.disabled && 'td {color: #fff; background-color: rgba(0, 255, 209, 0.3); opacity: 0.5; pointer-events: none }'}
`

export const TableBody = styled.tbody``

export const TableHead = styled.thead``

export const TableHeader = styled.th<TableProps>`
  ${(props) => props.width && `max-width: ${props.width}px !important`};
  padding: 4px 18px;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
`

export const TableData = styled.td<TableProps>`
  ${(props) => props.width && `max-width: ${props.width}px !important`};
  background-color: rgba(255, 255, 255, 0.3);
  padding: 18px;
  &:first-child {
    border-radius: 10px 0 0 10px;
  }
  &:last-child {
    border-radius: 0 10px 10px 0;
  }
  overflow: hidden;
  text-overflow: ellipsis;
`

export const TableDataGroup = styled.div<TableProps>`
  width: ${(props) => (props.width ? `${props.width}px` : '100%')};
  display: grid;
  grid-template-columns: repeat(${(props) => React.Children.count(props.children)}, 1fr);
  gap: 16px;
`

export const Table: React.FC<TableProps> = ({
  isHighlight,
  cellAlignLeft,
  cellAlignCenter,
  cellAlignRight,
  headers,
  body,
  children,
  isQuote,
  disabled,
}) => {
  return (
    <TableBase
      isHighlight={isHighlight}
      cellAlignLeft={cellAlignLeft}
      cellAlignCenter={cellAlignCenter}
      cellAlignRight={cellAlignRight}
      headers={headers}
      body={body}
      isQuote={isQuote}
      disabled={disabled}
    >
      {children}
    </TableBase>
  )
}
