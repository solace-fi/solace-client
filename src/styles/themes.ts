export const lightTheme = {
  typography: {
    contrastText: 'rgb(94, 94, 94)', // text color that contrasts the general theme
    analogicalText: 'rgb(250, 250, 250)', // text color that is relatively the same as the general theme
    lightText: 'rgb(250, 250, 250)',
    darkText: 'rgb(94, 94, 94)',
    infoText: 'rgb(95, 93, 249)',
    errorText: 'rgb(255, 12, 28)',
    warningText: 'rgb(187, 136, 0)',
    successText: 'rgb(40, 167, 69)',
  },
  body: {
    bg_color: '#fafafa',
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
    bg_color_0: 'rgb(242, 242, 242)',
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
    border_color: 'rgb(94, 94, 94)',
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
    cell_bg_color: 'rgb(242, 242, 242)',
    head_bg_color: 'rgb(227, 227, 227)',
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
  v2: {
    aside: '#FAFAFA',
    raised: '#FFFFFF',
    primary: '#5F5DF9',
    secondary: '#5e5e5e',
    tertiary: '#969696',
    separator: '#E3E4E6',
  },
} as const

export const darkTheme = {
  typography: {
    contrastText: 'rgb(250, 250, 250)', // text color that contrasts the general theme
    analogicalText: 'rgb(94, 94, 94)', // text color that is relatively the same as the general theme
    lightText: 'rgb(250, 250, 250)',
    darkText: 'rgb(94, 94, 94)',
    infoText: 'rgb(250, 130, 255)',
    errorText: 'rgb(240, 77, 66)',
    warningText: 'rgb(245, 221, 83)',
    successText: 'rgb(0, 255, 209)',
  },
  body: {
    bg_color: 'rgb(46, 46, 46)',
  },
  accordion: {
    color: 'auto',
    bg_color: 'rgba(38, 38, 38, 1)',
  },
  box: {
    bg_color_1: 'linear-gradient(145.04deg, #F3D37E 0%, #F04D42 100%)',
    bg_color_2: 'linear-gradient(145.04deg, #D478D8 0%, #5F5DF9 100%)',
    border_color: 'rgb(250, 250, 250)',
    success: 'rgba(21, 163, 52, 0.7)',
    info: 'rgba(76, 87, 133)',
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
    bg_color_0: 'rgba(255, 255, 255, 0.05)',
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
    slider_color: 'rgb(212, 120, 216)',
    slider_node_color: 'rgb(212, 120, 216)',
  },
  modal: {
    bg_color: 'rgba(20, 19, 51, 0.9)',
    base_color: 'rgb(46, 46, 46)',
    glow: '0',
  },
  radio: {
    checked_color: '#fff',
    checked_bg_color: 'rgb(212, 120, 216)',
    checked_circle_color: 'rgb(212, 120, 216)',
    circle_color: 'rgb(212, 120, 216)',
  },
  table: {
    highlight_bg_color: 'rgba(76, 87, 133)',
    hover_color: 'rgba(255, 255, 255, 0.2)',
    cell_bg_color: 'rgba(255, 255, 255, 0.05)',
    head_bg_color: 'rgba(38, 38, 38, 1)',
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
  v2: {
    aside: '#2e2e2e',
    raised: '#FFFFFF',
    primary: '#8e8df2',
    secondary: '#5e5e5e',
    tertiary: '#969696',
    separator: '#E3E4E6',
  },
} as const

export type Theme = typeof lightTheme | typeof darkTheme
// export type Theme = { theme: typeof lightTheme | typeof darkTheme }
