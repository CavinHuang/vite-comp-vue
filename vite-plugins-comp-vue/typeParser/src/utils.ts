/*
 * @Author: your name
 * @Date: 2021-08-28 16:19:36
 * @LastEditTime: 2021-08-28 16:20:39
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \vite-comp-vue\vite-plugins-comp-vue\vuePropsTypes\src\utils.ts
 */

import humps from "humps"

// 横杠写法 -
export function toLine(str: string): string {
  return humps
    .decamelize(str, {
      separator: "-",
    })
    .replace(/^\/-/, "/");
}