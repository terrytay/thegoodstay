import { createClient } from '@/lib/supabase/client'

export class SupabaseStorage {
  private static instance: SupabaseStorage
  private supabase = createClient()
  private bucketName = 'website-images'

  static getInstance() {
    if (!SupabaseStorage.instance) {
      SupabaseStorage.instance = new SupabaseStorage()
    }
    return SupabaseStorage.instance
  }

  // Upload image to Supabase Storage
  async uploadImage(file: File, folder: string = 'general'): Promise<string> {
    try {
      // Generate unique filename
      const timestamp = Date.now()
      const fileExt = file.name.split('.').pop()
      const fileName = `${timestamp}.${fileExt}`
      const filePath = `${folder}/${fileName}`

      // Upload file
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        throw error
      }

      // Get public URL
      const { data: { publicUrl } } = this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath)

      // Store in media library
      await this.addToMediaLibrary(fileName, file.name, filePath, file.type, file.size, publicUrl)

      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    }
  }

  // Add image to CMS media library
  private async addToMediaLibrary(
    filename: string,
    originalName: string,
    filePath: string,
    fileType: string,
    fileSize: number,
    publicUrl: string
  ) {
    try {
      // Get image dimensions if it's an image
      let dimensions = null
      if (fileType.startsWith('image/')) {
        dimensions = await this.getImageDimensions(publicUrl)
      }

      const { error } = await this.supabase
        .from('cms_media')
        .insert({
          filename,
          original_name: originalName,
          file_path: publicUrl,
          file_type: fileType,
          file_size: fileSize,
          dimensions: dimensions ? { width: dimensions.width, height: dimensions.height } : null,
          folder: filePath.split('/')[0]
        })

      if (error) {
        console.error('Error adding to media library:', error)
      }
    } catch (error) {
      console.error('Error adding to media library:', error)
    }
  }

  // Get image dimensions
  private getImageDimensions(url: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight })
      }
      img.onerror = reject
      img.src = url
    })
  }

  // Get public URL for a file
  getPublicUrl(filePath: string): string {
    const { data: { publicUrl } } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath)
    
    return publicUrl
  }

  // Delete image
  async deleteImage(filePath: string): Promise<void> {
    try {
      // Extract path from full URL if needed
      const pathToDelete = filePath.includes(this.bucketName) 
        ? filePath.split(`${this.bucketName}/`)[1]
        : filePath

      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .remove([pathToDelete])

      if (error) {
        throw error
      }

      // Remove from media library
      await this.supabase
        .from('cms_media')
        .delete()
        .eq('file_path', filePath)

    } catch (error) {
      console.error('Error deleting image:', error)
      throw error
    }
  }

  // List images from media library
  async getMediaLibrary(folder?: string, limit: number = 50) {
    try {
      let query = this.supabase
        .from('cms_media')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (folder) {
        query = query.eq('folder', folder)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error getting media library:', error)
      return []
    }
  }

  // Create storage bucket if it doesn't exist
  async initializeBucket(): Promise<void> {
    try {
      const { data: buckets, error: listError } = await this.supabase.storage.listBuckets()
      
      if (listError) {
        throw listError
      }

      const bucketExists = buckets?.some(bucket => bucket.name === this.bucketName)

      if (!bucketExists) {
        const { error: createError } = await this.supabase.storage.createBucket(this.bucketName, {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
          fileSizeLimit: 10485760 // 10MB
        })

        if (createError) {
          throw createError
        }

        console.log('Created website-images bucket')
      }
    } catch (error) {
      console.error('Error initializing bucket:', error)
    }
  }
}

// Utility functions
export const storage = SupabaseStorage.getInstance()

export const uploadImage = (file: File, folder?: string) => {
  return storage.uploadImage(file, folder)
}

export const getMediaLibrary = (folder?: string, limit?: number) => {
  return storage.getMediaLibrary(folder, limit)
}

export const deleteImage = (filePath: string) => {
  return storage.deleteImage(filePath)
}

// Initialize bucket on module load
storage.initializeBucket()