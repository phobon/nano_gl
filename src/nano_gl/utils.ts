export const hexStringToRgb = (hex: string) => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
  const hexString = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b)
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexString)
  if (!result) {
    return null
  }
  const [, r, g, b] = result
  return `rgb(${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)})`
}

export const rgbStringToArray = (rgb: string) => {
  const arr = rgb
    .replace('rgb(', '')
    .replace(')', '')
    .split(',')
    .map((n) => parseInt(n, 10) / 255)

  return arr
}

export const NICE_PALETTES_HEX = [
  ['#3e4146', '#fffde0', '#dfd97e', '#592e2e', '#2a2c30'],
  ['#8ce8ad', '#987856', '#fda6a3', '#f9d7ab', '#ffdcaa'],
  ['#eff2cc', '#b2d5ba', '#61ad9f', '#238f8d', '#60503d'],
  ['#f9d135', '#ff9c5b', '#f55e49', '#ec305e', '#3a81d0'],
  ['#ffeed3', '#fffee4', '#d1ebeb', '#9fdbc8', '#8b7a5e'],
  ['#fffaa7', '#a6f5ae', '#66b6ab', '#5a7bb0', '#4f2959'],
  ['#ffb266', '#ede8e6', '#faa78e', '#ffba7f', '#ff9996'],
]
