import React from 'react'
import styled from 'styled-components'
import {
  HeightAndWidthProps,
  HeightAndWidthCss,
  MarginProps,
  PaddingProps,
  MarginCss,
  PaddingCss,
} from '../generalInterfaces'
import { GeneralTextProps, GeneralTextCss } from '../Typography'

interface TableProps extends HeightAndWidthProps, GeneralTextProps, MarginProps, PaddingProps {
  isHighlight?: boolean
  isQuote?: boolean
  headers?: string[]
}

export const Table = styled.table<TableProps>`
  width: 100%;
  border-spacing: 0px 10px;
  th,
  td {
    ${GeneralTextCss}
  }
  ${(props) => props.isHighlight && 'td {background-color: rgba(0, 255, 209, 0.3);}'}
  ${(props) =>
    props.isQuote &&
    'tr { &:hover { td { background-color: rgba(255, 255, 255, 0.5); transition: background-color 200ms linear;} } }'}
  ${HeightAndWidthCss}
  ${MarginCss}
  ${PaddingCss}
`

export const TableRow = styled.tr<TableProps>`
  ${(props) => props.isHighlight && 'background-color: rgba(0, 255, 209, 0.3);'}
`

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
  ${GeneralTextCss}
  ${MarginCss}
  ${PaddingCss}
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
  ${GeneralTextCss}
  ${MarginCss}
  ${PaddingCss}
`

export const TableDataGroup = styled.div<TableProps>`
  width: ${(props) => (props.width ? `${props.width}px` : '100%')};
  display: grid;
  grid-template-columns: repeat(${(props) => React.Children.count(props.children)}, 1fr);
  gap: 16px;
  ${HeightAndWidthCss}
  ${GeneralTextCss}
`
