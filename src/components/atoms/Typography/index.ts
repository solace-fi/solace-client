import styled, { css } from 'styled-components'
import { GeneralElementProps, GeneralElementCss } from '../../generalInterfaces'
import { BKPT_3 } from '../../../constants'
export interface TextAlignProps {
  textAlignCenter?: boolean
  textAlignLeft?: boolean
  textAlignRight?: boolean
}

export interface TextStyleProps extends GeneralElementProps {
  nowrap?: boolean
  mont?: boolean
  lineHeight?: number
  analogical?: boolean
  light?: boolean
  dark?: boolean
  secondary?: boolean
  contrast?: boolean
  opposite?: boolean
  outlined?: boolean
  autoAlignVertical?: boolean
  autoAlignHorizontal?: boolean
  autoAlign?: boolean
  regular?: boolean
  medium?: boolean
  semibold?: boolean
  /** `font-weight: 600` if open sans, `700` if montserrat */ bold?: boolean
  extrabold?: boolean
  italics?: boolean
  underline?: boolean
  info?: boolean
  success?: boolean
  error?: boolean
  warning?: boolean
  fade?: boolean
  techygradient?: boolean
  warmgradient?: boolean
  lineThrough?: boolean
  inline?: boolean
}
export interface TextFontProps {
  /** `48px` */ big1?: boolean
  /** `36px` */ big2?: boolean
  /** `24px` */ big3?: boolean
  /** `width < BKPT_3` ? `24px` : `22px` */ t1?: boolean
  /** `width < BKPT_3` ? `20px` : `18px` */ t2?: boolean
  /** `width < BKPT_3` ? `18px` : `16px` */ t2_5?: boolean
  /** `width < BKPT_3` ? `16px` : `14px` */ t3?: boolean
  /** `width < BKPT_3` ? `14px` : `12px` */ t4?: boolean
  /** `font-size: 24px`, `line-height: 20px` */ t1s?: boolean
  /** `font-size: 20px`, `line-height: 18px` */ t2s?: boolean
  /** `font-size: 18px`, `line-height: 16px` */ t2_5s?: boolean
  /** `font-size: 16px` */ t3s?: boolean
  /** `14px` */ t4s?: boolean
  /** `font-size: 12px`, `line-height: 14px` */ t5s?: boolean
  /** `width < BKPT_3` ? `12px` : `10px` */ t6?: boolean
  /** `font-size: 10px`, `line-height: 12px` */ t6s?: boolean
  /** `width < BKPT_3` ? `10px` : `8px` */ t7?: boolean
  /** `font-size: 10px` */ t7s?: boolean
}

export interface GeneralTextProps extends TextFontProps, TextAlignProps, TextStyleProps {}

const AlignCenterCss = css`
  text-align: center;
`

const AlignLeftCss = css`
  text-align: left;
`

const AlignRightCss = css`
  text-align: right;
`

const AlignHeightCss = css`
  height: 30px;
  line-height: 30px;
`

const AlignVerticalCss = css`
  margin-top: auto;
  margin-bottom: auto;
`

const AlignHorizontalCss = css`
  margin-left: auto;
  margin-right: auto;
`

const AlignAutoCss = css`
  ${AlignHeightCss}
  ${AlignHorizontalCss}
  ${AlignVerticalCss}
`

const TextOutlineCss = css`
  padding: 2px 16px;
  margin: 0 5px 0 5px;
  border: 1px solid #fff;
  border-radius: 10px;
  ${AlignHeightCss}
`

const NoWrapCss = css`
  white-space: nowrap;
`

export const Text1Css = css`
  font-size: 24px;

  @media screen and (max-width: ${BKPT_3}px) {
    font-size: 22px;
  }
`

export const Text2Css = css`
  font-size: 20px;

  @media screen and (max-width: ${BKPT_3}px) {
    font-size: 18px;
  }
`

export const Text2_5Css = css`
  font-size: 18px;

  @media screen and (max-width: ${BKPT_3}px) {
    font-size: 16px;
  }
`

export const Text3Css = css`
  font-size: 16px;

  @media screen and (max-width: ${BKPT_3}px) {
    font-size: 14px;
  }
`

export const Text1StaticCss = css`
  font-size: 24px;
  line-height: 24px;
`

const Text2StaticCss = css`
  font-size: 20px;
  line-height: 18px;
`

const Text2_5StaticCss = css`
  font-size: 18px;
  line-height: 16px;
`
export const Text3StaticCss = css`
  font-size: 16px;
  /* line-height: 14.4px; */
`

export const Text4Css = css`
  font-size: 14px;

  @media screen and (max-width: ${BKPT_3}px) {
    font-size: 12px;
  }
`

export const Text4StaticCss = css`
  font-size: 14px;
`

export const Text5StaticCss = css`
  font-size: 12px;
  line-height: 1.5;
`

export const Text6StaticCss = css`
  font-size: 10px;
  line-height: 12px;
`

export const Text6Css = css`
  font-size: 12px;

  @media screen and (max-width: ${BKPT_3}px) {
    font-size: 10px;
  }
`

export const Text7Css = css`
  font-size: 10px;

  @media screen and (max-width: ${BKPT_3}px) {
    font-size: 8px;
  }
`

export const Text7StaticCss = css`
  font-size: 10px;
`

export const BigSize1Css = css`
  font-size: 48px;
`

export const BigSize2Css = css`
  font-size: 36px;
`

export const BigSize3Css = css`
  font-size: 24px;
`

export const TextFontCss = css<TextFontProps>`
  ${(props) => {
    if (props.t1) return Text1Css
    if (props.t2) return Text2Css
    if (props.t2_5) return Text2_5Css
    if (props.t3) return Text3Css
    if (props.t4) return Text4Css
    if (props.t1s) return Text1StaticCss
    if (props.t2s) return Text2StaticCss
    if (props.t2_5s) return Text2_5StaticCss
    if (props.t3s) return Text3StaticCss
    if (props.t4s) return Text4StaticCss
    if (props.t5s) return Text5StaticCss
    if (props.t6) return Text6Css
    if (props.t6s) return Text6StaticCss
    if (props.t7) return Text7Css
    if (props.t7s) return Text7StaticCss
    if (props.big1) return BigSize1Css
    if (props.big2) return BigSize2Css
    if (props.big3) return BigSize3Css
    // return css`
    //   font-size: inherit;
    // `
  }}
`

export const TextAlignCss = css<TextAlignProps>`
  ${(props) => props.textAlignCenter && AlignCenterCss}
  ${(props) => props.textAlignLeft && AlignLeftCss}
  ${(props) => props.textAlignRight && AlignRightCss}
`

export const TextStyleCss = css<TextStyleProps>`
  ${(props) => props.nowrap && NoWrapCss}
  ${(props) => props.mont && `font-family: 'Montserrat', sans-serif;`}
  ${(props) => props.outlined && TextOutlineCss}
  ${(props) => props.autoAlign && AlignAutoCss}
  ${(props) => props.autoAlignVertical && AlignVerticalCss}
  ${(props) => props.autoAlignHorizontal && AlignHorizontalCss}
  ${(props) => props.medium && 'font-weight: 500;'}
  ${(props) => props.semibold && 'font-weight: 600;'}
  ${(props) => {
    if (props.bold && props.mont)
      return css`
        font-weight: 700;
        letter-spacing: 0.5px;
      `
    if (props.bold)
      return css`
        font-weight: 600;
      `
  }}
  ${(props) => props.regular && 'font-weight: 400;'}
  ${(props) => props.extrabold && 'font-weight: 700;'}
  ${(props) => props.italics && 'font-style: italic;'}
  ${(props) => props.underline && 'text-decoration: underline;'}

  ${(props) => props.lineHeight && `line-height: ${props.lineHeight};`}
  ${(props) => props.lineThrough && 'text-decoration: line-through;'}

  ${(props) => (props.analogical ? `color: ${props.theme.typography.analogicalText};` : `color: inherit;`)}
  ${(props) => props.info && `color: ${props.theme.typography.infoText};`}
  ${(props) => props.success && `color: ${props.theme.typography.successText};`}
  ${(props) => props.error && `color: ${props.theme.typography.errorText};`}
  ${(props) => props.warning && `color: ${props.theme.typography.warningText};`}
  ${(props) => props.light && `color: ${props.theme.typography.lightText};`}
  ${(props) => props.dark && `color: ${props.theme.typography.darkText};`}
  ${(props) => props.secondary && `color: ${props.theme.typography.secondary};`}
  ${(props) => props.contrast && `color: ${props.theme.typography.contrastText};`}
  ${(props) => props.opposite && `color: ${props.theme.typography.opposite};`}
  ${(props) => props.fade && `opacity: 0.8;`}
  ${(props) => props.inline && `display: inline;`}
  /* techy gradient is props.theme.typography.techyGradientA and techyGradientB (top to bottom); text bg clip css */
  ${(props) =>
    props.techygradient &&
    css`
      background-image: linear-gradient(
        to bottom,
        ${props.theme.typography.techyGradientA},
        ${props.theme.typography.techyGradientB}
      );
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
      font-weight: ${props.extrabold ? 700 : 600} !important;
    `}
  /* warm gradient is props.theme.typography.warmGradientA and warmGradientB (top left to bottom right); text bg clip css */
  ${(props) =>
    props.warmgradient &&
    css`
      background-image: linear-gradient(
        to bottom right,
        ${props.theme.typography.warmGradientA},
        ${props.theme.typography.warmGradientB}
      );
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
      font-weight: ${props.extrabold ? 700 : 600} !important;
    `}
  ${GeneralElementCss}
  transition: all 200ms ease;
`

export const GeneralTextCss = css<GeneralTextProps>`
  ${TextFontCss}
  ${TextAlignCss}
  ${TextStyleCss}
`

export const Text = styled.div<GeneralTextProps & GeneralElementProps>`
  ${GeneralTextCss}
  ${GeneralElementCss}
`

export const TextSpan = styled.span<GeneralTextProps & GeneralElementProps>`
  ${GeneralTextCss}
  ${GeneralElementCss}
`

/**
 * @name TTTest
 * @description Test component for typography
 * @param {string} testprop - test prop
 */
export const TTTest = styled.div<{
  testprop: string
}>`
  ${(props) =>
    props.testprop &&
    css`
      color: 'blue';
    `}
`
