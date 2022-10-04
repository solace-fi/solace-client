export const lightTheme = {
  typography: {
    contrastText: 'rgb(125, 125, 125)', // text color that contrasts the general theme
    analogicalText: 'rgb(250, 250, 250)', // text color that is relatively the same as the general theme
    lightText: 'rgb(250, 250, 250)',
    darkText: 'rgb(125, 125, 125)',
    secondary: 'rgb(94, 94, 94)',
    infoText: 'rgb(95, 93, 249)',
    errorText: 'rgb(255, 12, 28)',
    warningText: 'rgb(187, 136, 0)',
    successText: 'rgb(40, 167, 69)',
    techyGradientA: 'rgb(212, 120, 216)',
    techyGradientB: 'rgb(95, 93, 249)',
    warmGradientA: 'rgba(243, 211, 126, 1)',
    warmGradientB: 'rgba(240, 77, 66, 1)',
    lightGray: 'rgb(244, 245, 247)',
    separator: '#E3E4E6',
    lightNeutral: '#F2CAD6',
    opposite: 'rgb(250, 250, 250)',
  },
  body: {
    bg_color: '#fafafa',
    layout_bg_color: '#f4f5f7',
  },
  accordion: {
    color: 'auto',
    bg_color: 'rgba(227, 227, 227, 1)',
  },
  box: {
    bg_color_1: 'linear-gradient(145.04deg, #F3D37E 0%, #F04D42 100%)',
    bg_color_2: 'linear-gradient(145.04deg, #D478D8 0%, #5F5DF9 100%)',
    border_color: 'rgb(94, 94, 94)',
    success: 'rgba(0, 187, 40, 0.7)',
    info: 'rgba(60, 58, 158)',
    infoLight: '#f7f7ff',
    warning: 'rgb(230, 158, 16)',
    error: 'rgb(240, 77, 66)',
    glow: '0 0 7px #fff',
    shadow: '0 3px 3px rgba(0, 0, 0, 0.5)',
  },
  button: {
    border_color: 'rgb(94, 94, 94)',
    text_color: 'rgb(94, 94, 94)',
    secondary_text_color: 'rgb(250, 250, 250)',
    hover_color: '#fff',
    glow: '0 0 7px #fff',
  },
  card: {
    bg_color_0: 'rgb(250, 250, 250)',
    bg_color_1: 'linear-gradient(145.04deg, #F3D37E 0%, #F04D42 100%)',
    bg_color_2: 'linear-gradient(145.04deg, #D478D8 0%, #5F5DF9 100%)',
    fade: 'rgb(64, 80, 128)',
    hover_color: 'rgb(231, 231, 231)',
    glow: '0 0 7px #fff',
  },
  form: {
    border_color: '#fff',
    bg_color: 'transparent',
    option_color: '#7c7c7c',
  },
  input: {
    color: 'rgb(94, 94, 94)',
    border_color: '#E3E4E6',
    bg_color: 'rgba(0, 0, 0, 0)',
    slider_color: 'rgb(95, 93, 249)',
    slider_node_color: 'rgb(95, 93, 249)',
  },
  modal: {
    bg_color: 'rgba(95, 93, 249, 0.9)',
    base_color: '#fff',
    glow: '0 0 7px #fff',
  },
  radio: {
    checked_color: '#fff',
    checked_bg_color: 'rgb(95, 93, 249)',
    checked_circle_color: 'rgb(95, 93, 249)',
    circle_color: 'rgb(95, 93, 249)',
  },
  table: {
    highlight_bg_color: 'rgb(95, 93, 249)',
    hover_color: 'rgb(231, 231, 231)',
    cell_bg_color: '#ffffff',
    head_bg_color: '#fafafa',
  },
  progress: {
    step_color: 'rgb(94, 94, 94)',
    step_completed_color: 'rgb(95, 93, 249)',
    progress_bg_color: 'rgba(0, 0, 0, 0.3)',
    bar_bg_color: 'rgb(95, 93, 249)',
  },
  tooltip: {
    bg_color: 'rgba(25, 29, 36, 1)',
  },
  separator: {
    bg_color: '#E3E4E6',
  },
  v2: {
    aside: '#FAFAFA',
    raised: '#FFFFFF',
    primary: '#5F5DF9',
    secondary: '#5e5e5e',
    tertiary: '#969696',
    separator: '#E3E4E6',
    lightNeutral: '#F2CAD6',
  },
} as const

export const darkTheme = {
  typography: {
    contrastText: 'rgb(250, 250, 250)', // text color that contrasts the general theme
    analogicalText: 'rgb(125, 125, 125)', // text color that is relatively the same as the general theme
    lightText: 'rgb(250, 250, 250)',
    darkText: 'rgb(125, 125, 125)',
    secondary: 'rgb(250, 250, 250)',
    infoText: '#6ec3ff',
    errorText: 'rgb(240, 77, 66)',
    warningText: 'rgb(245, 221, 83)',
    successText: 'rgb(74, 222, 128)',
    techyGradientA: '#EBC0ED',
    techyGradientB: '#9594FF',
    warmGradientA: 'rgba(243, 211, 126, 1)',
    warmGradientB: 'rgba(240, 77, 66, 1)',
    lightGray: 'rgba(255, 255, 255, 0.02)',
    separator: '#828282',
    lightNeutral: '#F2CAD6',
    opposite: 'rgba(0,0,0,0.75)',
  },
  body: {
    bg_color: '#242933',
    layout_bg_color: '#1f242b',
  },
  accordion: {
    color: 'auto',
    bg_color: '#2E3440',
  },
  box: {
    bg_color_1: 'linear-gradient(145.04deg, #F3D37E 0%, #F04D42 100%)',
    bg_color_2: 'linear-gradient(145.04deg, #D478D8 0%, #5F5DF9 100%)',
    border_color: 'rgb(250, 250, 250)',
    success: 'rgba(21, 163, 52, 0.7)',
    info: 'rgba(76, 87, 133)',
    infoLight: '#17252e',
    warning: 'rgb(212, 136, 6)',
    error: 'rgb(240, 77, 66)',
    glow: '0 0 0px #fff',
    shadow: '0 3px 3px rgba(0, 0, 0, 0.5)',
  },
  button: {
    border_color: 'rgba(255, 255, 255, 0.4)',
    text_color: '#fff',
    secondary_text_color: 'rgb(250, 250, 250)',
    hover_color: 'rgba(255, 255, 255, 0.2)',
    glow: '0 0 7px #00ffd1',
  },
  card: {
    bg_color_0: 'rgb(59, 62, 73)',
    bg_color_1: 'linear-gradient(145.04deg, #F3D37E 0%, #F04D42 100%)',
    bg_color_2: 'linear-gradient(145.04deg, #D478D8 0%, #5F5DF9 100%)',
    fade: 'rgb(64, 80, 128)',
    hover_color: 'rgba(255, 255, 255, 0.2)',
    glow: '0 0 7px #fff',
  },
  form: {
    border_color: '#fff',
    bg_color: 'transparent',
    option_color: '#7c7c7c',
  },
  input: {
    color: '#fff',
    border_color: 'rgba(255, 255, 255, 0.4)',
    bg_color: 'rgba(255, 255, 255, 0.04)',
    slider_color: '#6ec3ff',
    slider_node_color: '#6ec3ff',
  },
  modal: {
    bg_color: 'rgba(21, 25, 31, 0.9)',
    base_color: '#2a2f3b',
    glow: '0',
  },
  radio: {
    checked_color: '#fff',
    checked_bg_color: '#6ec3ff',
    checked_circle_color: '#6ec3ff',
    circle_color: '#6ec3ff',
  },
  table: {
    highlight_bg_color: 'rgba(76, 87, 133)',
    hover_color: 'rgba(255, 255, 255, 0.2)',
    cell_bg_color: 'rgb(59, 62, 73)',
    head_bg_color: '#2E3440',
  },
  progress: {
    step_color: 'rgb(94, 94, 94)',
    step_completed_color: 'rgb(250, 250, 250)',
    progress_bg_color: 'rgba(255, 255, 255, 0.3)',
    bar_bg_color: '#fff',
  },
  tooltip: {
    bg_color: 'rgba(25, 29, 36, 1)',
  },
  separator: {
    bg_color: '#828282',
  },
  v2: {
    aside: '#1f1f1f',
    raised: '#2E3440',
    primary: '#6ec3ff',
    secondary: 'rgb(250, 250, 250)',
    tertiary: '#a6a6a6',
    separator: '#E3E4E6',
    lightNeutral: '#F2CAD6',
  },
} as const

export type Theme = typeof lightTheme | typeof darkTheme
export default Theme
// export type Theme = { theme: typeof lightTheme | typeof darkTheme }
