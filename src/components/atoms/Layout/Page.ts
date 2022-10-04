import { BKPT_5 } from '../../../constants'
import styled, { css } from 'styled-components'
import { GeneralElementProps, GeneralElementCss, HeightAndWidthProps, HeightAndWidthCss } from '../../generalInterfaces'
import { BKPT_6 } from '../../../constants'
import { Theme } from '../../../styles/themes'
import { ThinScrollbarCss } from '../Scrollbar/ThinScrollbar'
import { ButtonAppearanceCss, ButtonProps } from '../Button'

const isNum = (n: boolean | number): n is number => typeof n === 'number'

export interface FlexProps {
  button?: boolean
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
  row?: boolean
  stretch?: boolean
  wrapped?: boolean
  marginAuto?: boolean
  gap?: number
  hidden?: boolean
  baseline?: boolean
  flex1?: boolean
  rounded?: boolean | number
  shadow?: boolean
  thinScrollbar?: boolean
  zIndex?: number

  bgRaised?: boolean
  bgSecondary?: boolean
  bgTechy?: boolean
  bgWarm?: boolean
  bgLight?: boolean
  bgDark?: boolean
  bgInfo?: boolean
  bgSuccess?: boolean
  bgError?: boolean
  bgLightGray?: boolean
  bgTertiary?: boolean
}

// type Conditional = string | number | boolean | undefined

// function ifNotFalsey(value: Conditional, css: ThemedCssFunction<DefaultTheme>) {
// }

// prettier-ignore
export const Flex = styled.div<FlexProps & ButtonProps & GeneralElementProps>`
  display: flex;
  ${({ button })        => button                      ? ButtonAppearanceCss                                 : ""}
  ${({ button })        => button                      ? css`min-height: auto; min-width: auto;`             : ""}
  ${({ between })       => between                     ? css`justify-content: space-between;`                : ""}
  ${({ around })        => around                      ? css`justify-content: space-around;`                 : ""}
  ${({ evenly })        => evenly                      ? css`justify-content: space-evenly;`                 : ""}
  ${({ justifyStart })  => justifyStart                ? css`justify-content: flex-start;`                   : ""}
  ${({ justifyCenter }) => justifyCenter               ? css`justify-content: center;`                       : ""}
  ${({ justifyEnd })    => justifyEnd                  ? css`justify-content: flex-end;`                     : ""}
  ${({ itemsCenter })   => itemsCenter                 ? css`align-items: center;`                           : ""}
  ${({ itemsEnd })      => itemsEnd                    ? css`align-items: flex-end;`                         : ""}
  ${({ center })        => center                      ? css`justify-content: center;`                       : ""}
  ${({ column })        => column                      ? css`flex-direction: column;`                        : ""}
  ${({ col })           => col                         ? css`flex-direction: column;`                        : ""}
  ${({ row })           => row                         ? css`flex-direction: row;`                           : ""}
  ${({ button, row })   => button                ? row ? css`flex-direction: row;`
                                                       : css`flex-direction: column;`                        : ""}
  ${({ stretch })       => stretch                     ? css`align-items: stretch;`                          : ""}
  ${({ wrapped })          => wrapped                  ? css`flex-wrap: wrap;`                               : ""}
  ${({ marginAuto })    => marginAuto                  ? css`margin: auto;`                                  : ""}

  ${({ gap })           => gap           !== undefined ? css`gap: ${gap}px;`                                 : ""}
  
  ${({ hidden })        => hidden                      ? css`display: none;`                                              : ""}
  ${({ baseline })      => baseline                    ? css`display: inline-block;`                                      : ""}
  ${({ flex1 })         => flex1                       ? css`flex: 1;`                                                    : ""}
  ${({ rounded })       => rounded       !== undefined ? css`border-radius: ${isNum(rounded) ? rounded : 12}px;`          : ""}
  ${({ shadow })        => shadow                      ? css`box-shadow: 0px 0px 30px -10px rgba(138, 138, 138, 0.15);`                : ""}
  ${({ thinScrollbar }) => thinScrollbar               ? ThinScrollbarCss                                                 : ""}
  ${({ zIndex })        => zIndex        !== undefined ? css`z-index: ${zIndex};`                                         : ""}
  
  ${(props)             => props.bgRaised              ? css`background-color: ${(props.theme as Theme).v2.raised};` : ""}
  ${(props)             => props.bgSecondary           ? css`background-color: ${(props.theme as Theme).body.bg_color};` : ""}
  ${(props)             => props.bgTechy               ? css`background-image: linear-gradient(to bottom right, ${(props.theme as Theme).typography.techyGradientA}, ${(props.theme as Theme).typography.techyGradientB});` : ""}
  ${(props)             => props.bgWarm                ? css`background-image: linear-gradient(to bottom right, ${(props.theme as Theme).typography.warmGradientA}, ${(props.theme as Theme).typography.warmGradientB});` : ""}
  ${(props)             => props.bgLight               ? css`background-color: ${(props.theme as Theme).typography.lightText};` : ""}
  ${(props)             => props.bgDark                ? css`background-color: ${(props.theme as Theme).typography.darkText};` : ""}
  ${(props)             => props.bgInfo                ? css`background-color: ${(props.theme as Theme).typography.infoText};` : ""}
  ${(props)             => props.bgError               ? css`background-color: ${(props.theme as Theme).typography.errorText};` : ""}
  ${(props)             => props.bgSuccess             ? css`background-color: ${(props.theme as Theme).typography.successText};` : ""}
  ${(props)             => props.bgLightGray           ? css`background-color: ${(props.theme as Theme).typography.lightGray};` : ""}
  ${(props)             => props.bgTertiary            ? css`background-color: ${(props.theme as Theme).v2.tertiary};` : ""}
  ${GeneralElementCss}
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
    grid-template-rows: repeat(1, 1fr);
    grid-column-gap: 20px;
    grid-row-gap: 15px;
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
  box-shadow: 0px 0px 30px -10px rgba(138, 138, 138, 0.15);
  border-radius: 12px;
  /* overflow: hidden; */
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
