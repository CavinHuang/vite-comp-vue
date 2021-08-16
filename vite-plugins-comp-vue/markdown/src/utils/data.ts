import { DemoBlockType } from '../markdown'

class vueDemoBus {
  public cacheDemos: Map<string, DemoBlockType[]> = new Map()

  setCache (key: string, data: DemoBlockType[]) {
    return this.cacheDemos.set(key, data)
  }

  getCache (key: string) {
    return this.cacheDemos.get(key)
  }
}

const demoBlockBus = new vueDemoBus()

export {
  demoBlockBus
}