import React from 'react'
import styled from 'styled-components'

interface TableProps {
  isHighlight?: boolean
  cellAlignLeft?: boolean
  cellAlignCenter?: boolean
  cellAlignRight?: boolean
  headers?: string[]
  body?: { data: string[]; status: boolean }[]
  width?: number
}

const handleCellAlign = (props: TableProps) => {
  if (props.cellAlignLeft) return 'text-align: left;'
  if (props.cellAlignCenter) return 'text-align: center'
  if (props.cellAlignRight) return 'text-align: right'
}

const TableBase = styled.table<TableProps>`
  width: 100%;
  border-spacing: 0px 10px;
  th.cell-align-center,
  td.cell-align-center {
    ${(props) => handleCellAlign(props)}
  }
  ${(props) =>
    props.isHighlight
      ? 'td {background-color: rgba(0, 255, 209, 0.3);}'
      : 'td {background-color: rgba(255, 255, 255, 0.3);}'}
`

export const TableRow = styled.tr``

export const TableBody = styled.tbody``

export const TableHead = styled.thead``

export const TableHeader = styled.th<TableProps>`
  ${(props) => props.width && `max-width: ${props.width}px !important`};
  padding: 4px 18px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const TableData = styled.td<TableProps>`
  ${(props) => props.width && `max-width: ${props.width}px !important`};
  text-align: center;
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
}) => {
  return (
    <TableBase
      isHighlight={isHighlight}
      cellAlignLeft={cellAlignLeft}
      cellAlignCenter={cellAlignCenter}
      cellAlignRight={cellAlignRight}
      headers={headers}
      body={body}
    >
      {children}
    </TableBase>
  )
}
