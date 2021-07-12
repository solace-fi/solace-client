import React from 'react'
import styled from 'styled-components'
import { HeightAndWidthProps, HeightAndWidthCss } from '../generalInterfaces'
import { TextAlignProps, TextAlignCss } from '../Text'

interface TableProps extends HeightAndWidthProps, TextAlignProps {
  isHighlight?: boolean
  isQuote?: boolean
  headers?: string[]
  body?: { data: string[]; status: boolean }[]
}

const TableBase = styled.table<TableProps>`
  width: 100%;
  border-spacing: 0px 10px;
  th,
  td {
    ${TextAlignCss}
  }
  ${(props) => props.isHighlight && 'td {background-color: rgba(0, 255, 209, 0.3);}'}
  ${(props) =>
    props.isQuote &&
    'tr { &:hover { td { background-color: rgba(255, 255, 255, 0.5); transition: background-color 200ms linear;} } }'}
`

export const TableRow = styled.tr``

export const TableBody = styled.tbody``

export const TableHead = styled.thead``

export const TableHeader = styled.th<TableProps>`
  ${(props) => props.width && `max-width: ${props.width}px !important`};
  padding: 4px 18px;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
  white-space: nowrap;
  ${HeightAndWidthCss}
  ${TextAlignCss}
`

export const TableData = styled.td<TableProps>`
  ${(props) => props.width && `max-width: ${props.width}px !important`};
  background-color: rgba(255, 255, 255, 0.2);
  padding: 14px 18px;
  &:first-child {
    border-radius: 10px 0 0 10px;
  }
  &:last-child {
    border-radius: 0 10px 10px 0;
  }
  overflow: hidden;
  text-overflow: ellipsis;
  ${HeightAndWidthCss}
  ${TextAlignCss}
`

export const TableDataGroup = styled.div<TableProps>`
  width: ${(props) => (props.width ? `${props.width}px` : '100%')};
  display: grid;
  grid-template-columns: repeat(${(props) => React.Children.count(props.children)}, 1fr);
  gap: 16px;
  ${HeightAndWidthCss}
  ${TextAlignCss}
`

export const Table: React.FC<TableProps> = ({
  isHighlight,
  textAlignLeft,
  textAlignCenter,
  textAlignRight,
  headers,
  body,
  children,
  isQuote,
}) => {
  return (
    <TableBase
      isHighlight={isHighlight}
      textAlignLeft={textAlignLeft}
      textAlignCenter={textAlignCenter}
      textAlignRight={textAlignRight}
      headers={headers}
      body={body}
      isQuote={isQuote}
    >
      {children}
    </TableBase>
  )
}
