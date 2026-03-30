export interface Camp {
  _id: string
  name: string
  location: string
  price: number
  capacity: number
  description: string
  imageUrl?: string
  imageHint?: string
  featured?: boolean
  status?: 'active' | 'inactive'
  isActive?: boolean
  id?: string
  date?: string
  activities?: string[]
  image?: {
    id?: string
    imageUrl?: string
    imageHint?: string
  }
}

export interface GalleryImage {
  _id: string
  imageUrl?: string
  description: string
  imageHint?: string
  createdAt?: string | Date
  id?: string
}