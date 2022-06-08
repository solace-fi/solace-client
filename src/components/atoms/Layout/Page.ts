import { BKPT_5 } from '../../../constants'
import styled, { css } from 'styled-components'
import { GeneralElementProps, GeneralElementCss, HeightAndWidthProps, HeightAndWidthCss } from '../../generalInterfaces'
import { BKPT_6 } from '../../../constants'
import { Theme } from '../../../styles/themes'

export interface FlexProps {
  between?: boolean
  around?: boolean
  evenly?: boolean
  justifyStart?: boolean
  justifyCenter?: boolean
  justifyEnd?: boolean
  itemsCenter?: boolean
  itemsEnd?: boolean
  center?: boolean
  column?: boolean
  col?: boolean
  stretch?: boolean
  wrap?: boolean
  marginAuto?: boolean
  m?: number
  mb?: number
  mt?: number
  ml?: number
  mr?: number
  mx?: number
  my?: number
  p?: number
  pb?: number
  pl?: number
  pr?: number
  pt?: number
  px?: number
  py?: number
  gap?: number
  w?: number
  hidden?: boolean
  baseline?: boolean
  flex1?: boolean
  rounded?: boolean
  shadow?: boolean

  bgRaised?: boolean
  bgSecondary?: boolean
  bgTechy?: boolean
  bgWarm?: boolean
  bgInfo?: boolean
  bgError?: boolean
}

// type Conditional = string | number | boolean | undefined

// function ifNotFalsey(value: Conditional, css: ThemedCssFunction<DefaultTheme>) {
// }

// prettier-ignore
export const Flex = styled.div<FlexProps>`
  display: flex;
  ${({ justifyStart })  => justifyStart  !== undefined ? css`justify-content: flex-start;` : ""}
  ${({ justifyCenter }) => justifyCenter !== undefined ? css`justify-content: center;` : ""}
  ${({ justifyEnd })    => justifyEnd    !== undefined ? css`justify-content: flex-end;` : ""}
  ${({ itemsCenter })   => itemsCenter   !== undefined ? css`align-items: center;` : ""}
  ${({ itemsEnd })      => itemsEnd      !== undefined ? css`align-items: flex-end;` : ""}
  ${({ center })        => center        !== undefined ? css`justify-content: center;` : ""}
  ${({ column })        => column        !== undefined ? css`flex-direction: column;` : ""}
  ${({ col })           => col           !== undefined ? css`flex-direction: column;` : ""}
  ${({ stretch })       => stretch       !== undefined ? css`align-items: stretch;` : ""}
  ${({ wrap })          => wrap          !== undefined ? css`flex-wrap: wrap;` : ""}
  ${({ between })       => between       !== undefined ? css`justify-content: space-between;` : ""}
  ${({ around })        => around        !== undefined ? css`justify-content: space-around;` : ""}
  ${({ evenly })        => evenly        !== undefined ? css`justify-content: space-evenly;` : ""}
  ${({ marginAuto })    => marginAuto    !== undefined ? css`margin: auto;` : ""}
  ${({ m })             => m             !== undefined ? css`margin: ${m}px;` : ""}
  ${({ mb })            => mb            !== undefined ? css`margin-bottom: ${mb}px;` : ""}
  ${({ mt })            => mt            !== undefined ? css`margin-top: ${mt}px;` : ""}
  ${({ ml })            => ml            !== undefined ? css`margin-left: ${ml}px;` : ""}
  ${({ mr })            => mr            !== undefined ? css`margin-right: ${mr}px;` : ""}
  ${({ mx })            => mx            !== undefined ? css`margin-left: ${mx}px; margin-right: ${mx}px;` : ""}
  ${({ my })            => my            !== undefined ? css`margin-top: ${my}px; margin-bottom: ${my}px;` : ""}
  ${({ p })             => p             !== undefined ? css`padding: ${p}px;` : ""}
  ${({ pb })            => pb            !== undefined ? css`padding-bottom: ${pb}px;` : ""}
  ${({ pl })            => pl            !== undefined ? css`padding-left: ${pl}px;` : ""}
  ${({ pr })            => pr            !== undefined ? css`padding-right: ${pr}px;` : ""}
  ${({ pt })            => pt            !== undefined ? css`padding-top: ${pt}px;` : ""}
  ${({ px })            => px            !== undefined ? css`padding-left: ${px}px; padding-right: ${px}px;` : ""}
  ${({ py })            => py            !== undefined ? css`padding-top: ${py}px; padding-bottom: ${py}px;` : ""}
  ${({ gap })           => gap           !== undefined ? css`gap: ${gap}px;` : ""}
  ${({ w })             => w             !== undefined ? css`width: ${w}px;` : ""}
  ${({ hidden })        => hidden        !== undefined ? css`display: none;` : ""}
  ${({ baseline })      => baseline      !== undefined ? css`align-self: baseline;` : ""}
  ${({ flex1 })         => flex1         !== undefined ? css`flex: 1;` : ""}
  ${({ rounded })       => rounded       !== undefined ? css`border-radius: 10px;` : ""}
  ${({ shadow })        => shadow        !== undefined ? css`box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);` : ""}
  
  ${(props)             => props.bgRaised    !== undefined ? css`background-color: ${(props.theme as Theme).v2.raised};` : ""}
  ${(props)             => props.bgSecondary !== undefined ? css`background-color: ${(props.theme as Theme).body.bg_color};` : ""}
  ${(props)             => props.bgTechy     !== undefined ? css`background-image: linear-gradient(to bottom right, ${(props.theme as Theme).typography.techyGradientA}, ${(props.theme as Theme).typography.techyGradientB});` : ""}
  ${(props)             => props.bgWarm      !== undefined ? css`background-image: linear-gradient(to bottom right, ${(props.theme as Theme).typography.warmGradientA}, ${(props.theme as Theme).typography.warmGradientB});` : ""}
  ${(props)             => props.bgInfo      !== undefined ? css`background-color: ${(props.theme as Theme).typography.infoText};` : ""}
  ${(props)             => props.bgError     !== undefined ? css`background-color: ${(props.theme as Theme).typography.errorText};` : ""}
`

export const GridOrRow = styled(Flex)<{ preferredWidth?: number }>`
  display: flex;
  /* gap: 80px; */
  align-items: stretch;
  @media screen and (max-width: ${(props) => props.preferredWidth ?? BKPT_6}px) {
    margin-left: auto;
    margin-right: auto;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
    grid-column-gap: 20px;
    grid-row-gap: 22px;
    .items-6 {
      grid-area: 1 / 1 / 3 / 4;
    }
    .items-1 {
      grid-area: 3 / 2 / 4 / 3;
    }
  }
`

export interface ShadowDivProps {
  stretch?: boolean
}
export const ShadowDiv = styled.div<ShadowDivProps>`
  box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.12);
  border-radius: 10px;
  ${(props) =>
    props.stretch &&
    css`
      display: flex;
      flex-direction: column;
      & > * {
        height: 100%;
        display: flex;
        flex-direction: column;
      }
    `}
`

export interface GridProps extends GeneralElementProps, HeightAndWidthProps {
  columns?: number
  columnGap?: number
  rowGap?: number
  gap?: number
}

// prettier-ignore
export const Grid = styled.div<GridProps & GeneralElementProps & HeightAndWidthProps>`
  display: grid;
  ${({ columns })   => columns   !== undefined && css`grid-template-columns: repeat(${columns}, 1fr);`}
  ${({ columnGap }) => columnGap !== undefined && css`grid-column-gap: ${columnGap}px;`}
  ${({ rowGap })    => rowGap    !== undefined && css`grid-row-gap: ${rowGap}px;`}
  ${({ gap })       => gap       !== undefined && css`gap: ${gap}px;`}
  ${GeneralElementCss}
  ${HeightAndWidthCss}
`

export const HeroContainer = styled.div<HeightAndWidthProps & GeneralElementProps>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  ${HeightAndWidthCss}
  ${GeneralElementCss}
`

export const Content = styled.div<GeneralElementProps>`
  padding: 20px 0;

  @media screen and (max-width: ${BKPT_5}px) {
    padding: 30px 20px;
  }
  ${GeneralElementCss}
`

export const BodyBgInput = styled.input`
  background-color: ${(props) => props.theme.body.bg_color};
`

// both of these are the same
export const BodyBgDiv = styled.div`
  background-color: ${(props) => props.theme.body.bg_color};
`
export const GrayBgDiv = styled.div`
  background-color: ${(props) => props.theme.body.bg_color};
`
