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

export type ConsentData = {
  termsAccepted: boolean
  mediaAccepted: boolean
  marketingAccepted: boolean
}

export type FormPayload = {
  parent: ParentData
  children: ChildData[]
  consent: ConsentData
  signature: string
  pdfBase64?: string
}
