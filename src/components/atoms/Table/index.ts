import React from 'react'
import styled from 'styled-components'
import { GeneralElementProps, GeneralElementCss } from '../../generalInterfaces'
import { GeneralTextProps, GeneralTextCss, Text2_5Css, Text3Css } from '../Typography'
import { Z_TABLE } from '../../../constants/'

interface TableProps extends GeneralTextProps, GeneralElementProps {
  isHighlight?: boolean
  canHover?: boolean
  headers?: string[]
  fade?: boolean
}

interface TableHeadProps {
  zIndex?: number
  sticky?: boolean
}

export const Table = styled.table<TableProps>`
  width: 100%;
  border-spacing: 0px 10px;
  th,
  td {
    ${GeneralTextCss}
  }
  ${(props) => props.isHighlight && `td {background-color: ${props.theme.table.highlight_bg_color};}`}
  ${(props) =>
    props.canHover &&
    `tr { &:hover { td { background-color: ${props.theme.table.hover_color}; transition: background-color 200ms linear;} } }`}
    ${(props) => props.fade && `opacity: 0.5;`}
    ${GeneralElementCss}
`

export const TableRow = styled.tr<TableProps>`
  ${(props) =>
    props.isHighlight &&
    `background-color: ${props.theme.table.highlight_bg_color}; td { background-color: ${props.theme.table.highlight_bg_color}; }`}
  th,
  td {
    ${GeneralTextCss}
  }
`

export const TableBody = styled.tbody``

export const TableHead = styled.thead<TableHeadProps>`
  ${(props) =>
    props.sticky &&
    `
    position: sticky;
    transform: translateY(-7px);
    top: 7px;
    background-color: ${props.theme.table.head_bg_color};
    z-index: ${props.zIndex ? props.zIndex : `${Z_TABLE}`};
    th {
      padding-top: 20px;
    }
  `};
`

export const TableHeader = styled.th<TableProps>`
  ${(props) => props.width && `max-width: ${props.width}px !important`};
  padding: 4px 18px;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
  white-space: nowrap;
  ${Text3Css}
  ${GeneralTextCss}
  ${GeneralElementCss}
`

export const TableData = styled.td<TableProps>`
  ${(props) => props.width && `max-width: ${props.width}px !important`};
  background-color: ${({ theme }) => theme.table.cell_bg_color};
  padding: 14px 18px;
  &:first-child {
    border-radius: 10px 0 0 10px;
  }
  &:last-child {
    border-radius: 0 10px 10px 0;
  }
  &:first-child:last-child {
    border-radius: 10px;
  }
  overflow: hidden;
  text-overflow: ellipsis;
  ${GeneralTextCss}
  ${GeneralElementCss}
`

export const TableDataGroup = styled.div<TableProps>`
  width: ${(props) => (props.width ? `${props.width}px` : '100%')};
  display: grid;
  grid-template-columns: repeat(${(props) => React.Children.count(props.children)}, 1fr);
  gap: 16px;
  ${GeneralTextCss}
  ${GeneralElementCss}
`
