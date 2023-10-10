export interface Chat {
  id: string
  isOpen: Boolean
  Client: User
  clientId: string
  attendantId: string | null
  Messages: Message[]
  Department: Department
  departmentId: string
}

export interface Company {
  id: string
  name: string
  Departments: Department[]
}

export interface Department {
  id: string
  name: string
  Users: User[]
  Company: Company
  companyId: string
  Chats: Chat[]
}

export interface Message {
  id?: string
  text: string
  sendName: string
  sendId: string
  receivedName?: string
  receivedId?: string
  Chat?: Chat
  chatId: string
}

export interface User {
  id: string
  name: string
  login: string
  email: string
  isAttendant: boolean
  Departments: Department[]
  Treatment: Chat[]
}
