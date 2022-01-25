export default function swapTwoItems<T>(arr: T[], indexA: number, indexB: number): T[] {
  const newArr = [...arr]
  const temp = newArr[indexA]
  newArr[indexA] = newArr[indexB]
  newArr[indexB] = temp
  return newArr
}
