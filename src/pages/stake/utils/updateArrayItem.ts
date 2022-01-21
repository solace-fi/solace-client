/**
 * @name updateArrayItem
 * @description Replaces an item in an array with a new item at the same index
 * @param arr The array to update
 * @param index The index of the item to update
 * @param newItem The new item to replace the old one
 * @returns The updated array
 */
export default function updateArrayItem<T>(arr: T[], index: number, newItem: T): T[] {
  const newArr = [...arr]
  newArr[index] = newItem
  return newArr
}
