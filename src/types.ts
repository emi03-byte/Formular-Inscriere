export type ParentData = {
  fullName: string
  email: string
  phone: string
}

export type ChildData = {
  id: string
  fullName: string
  age: string
}

export type FormPayload = {
  parent: ParentData
  children: ChildData[]
}

export const emptyParent = (): ParentData => ({
  fullName: '',
  email: '',
  phone: '',
})

export const createChild = (): ChildData => ({
  id: crypto.randomUUID(),
  fullName: '',
  age: '',
})
