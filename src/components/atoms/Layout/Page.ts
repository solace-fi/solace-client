import { BKPT_5 } from '../../../constants'
import styled, { css } from 'styled-components'
import { GeneralElementProps, GeneralElementCss, HeightAndWidthProps, HeightAndWidthCss } from '../../generalInterfaces'
import { BKPT_6 } from '../../../constants'

export interface FlexProps {
  between?: boolean
  around?: boolean
  justifyCenter?: boolean
  itemsCenter?: boolean
  center?: boolean
  column?: boolean
  col?: boolean
  justifyEnd?: boolean
  stretch?: boolean
  wrap?: boolean
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
}

// prettier-ignore
export const Flex = styled.div<FlexProps>`
  display: flex;
  ${({ justifyCenter }) => justifyCenter && css`justify-content: center;`}
  ${({ justifyEnd })    => justifyEnd    && css`justify-content: flex-end;`}
  ${({ itemsCenter })   => itemsCenter   && css`align-items: center;`}
  ${({ center })        => center        && css`justify-content: center;`}
  ${({ column })        => column        && css`flex-direction: column;`}
  ${({ col })           => col           && css`flex-direction: column;`}
  ${({ stretch })       => stretch       && css`flex-grow: 1;`}
  ${({ wrap })          => wrap          && css`flex-wrap: wrap;`}
  ${({ between })       => between       && css`justify-content: space-between;`}
  ${({ around })        => around        && css`justify-content: space-around;`}
  ${({ m })             => m             && css`margin: ${m}px;`}
  ${({ mb })            => mb            && css`margin-bottom: ${mb}px;`}
  ${({ mt })            => mt            && css`margin-top: ${mt}px;`}
  ${({ ml })            => ml            && css`margin-left: ${ml}px;`}
  ${({ mr })            => mr            && css`margin-right: ${mr}px;`}
  ${({ mx })            => mx            && css`margin-left: ${mx}px; margin-right: ${mx}px;`}
  ${({ my })            => my            && css`margin-top: ${my}px; margin-bottom: ${my}px;`}
  ${({ p })             => p             && css`padding: ${p}px;`}
  ${({ pb })            => pb            && css`padding-bottom: ${pb}px;`}
  ${({ pl })            => pl            && css`padding-left: ${pl}px;`}
  ${({ pr })            => pr            && css`padding-right: ${pr}px;`}
  ${({ pt })            => pt            && css`padding-top: ${pt}px;`}
  ${({ px })            => px            && css`padding-left: ${px}px; padding-right: ${px}px;`}
  ${({ py })            => py            && css`padding-top: ${py}px; padding-bottom: ${py}px;`}
  ${({ gap })           => gap           && css`gap: ${gap}px;`}
  ${({ w })             => w             && css`width: ${w}px;`}
  ${({ hidden })        => hidden        && css`display: none;`}
  ${({ baseline })      => baseline      && css`align-self: baseline;`}
  ${({ flex1 })         => flex1         && css`flex: 1;`}
`

export const GridOrRow = styled(Flex)`
  display: flex;
  /* gap: 80px; */
  align-items: stretch;
  @media screen and (max-width: ${BKPT_6}px) {
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
