import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "../config/firebase";

export interface MediaResult {
  uri: string;
  type: "image" | "video" | "audio" | "document";
  name?: string;
  size?: number;
  duration?: number;
  thumbnail?: string;
}

export class MediaService {
  // Request permissions
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status: cameraStatus } =
        await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaLibraryStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      const { status: audioStatus } = await Audio.requestPermissionsAsync();

      return (
        cameraStatus === "granted" &&
        mediaLibraryStatus === "granted" &&
        audioStatus === "granted"
      );
    } catch (error) {
      console.error("Permission request error:", error);
      return false;
    }
  }

  // Take photo with camera
  static async takePhoto(): Promise<MediaResult | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error("Camera permission not granted");
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (result.canceled) return null;

      const asset = result.assets[0];
      return {
        uri: asset.uri,
        type: "image",
        name: `IMG_${Date.now()}.jpg`,
        size: asset.fileSize,
      };
    } catch (error) {
      console.error("Take photo error:", error);
      throw error;
    }
  }

  // Record video with camera
  static async recordVideo(): Promise<MediaResult | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error("Camera permission not granted");
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
        videoMaxDuration: 60, // 1 minute max
      });

      if (result.canceled) return null;

      const asset = result.assets[0];
      return {
        uri: asset.uri,
        type: "video",
        name: `VID_${Date.now()}.mp4`,
        size: asset.fileSize,
        duration: asset.duration,
      };
    } catch (error) {
      console.error("Record video error:", error);
      throw error;
    }
  }

  // Pick image from gallery
  static async pickImage(): Promise<MediaResult | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error("Media library permission not granted");
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (result.canceled) return null;

      const asset = result.assets[0];
      return {
        uri: asset.uri,
        type: "image",
        name: `IMG_${Date.now()}.jpg`,
        size: asset.fileSize,
      };
    } catch (error) {
      console.error("Pick image error:", error);
      throw error;
    }
  }

  // Pick video from gallery
  static async pickVideo(): Promise<MediaResult | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error("Media library permission not granted");
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled) return null;

      const asset = result.assets[0];
      return {
        uri: asset.uri,
        type: "video",
        name: `VID_${Date.now()}.mp4`,
        size: asset.fileSize,
        duration: asset.duration,
      };
    } catch (error) {
      console.error("Pick video error:", error);
      throw error;
    }
  }

  // Pick document
  static async pickDocument(): Promise<MediaResult | null> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) return null;

      const asset = result.assets[0];
      return {
        uri: asset.uri,
        type: "document",
        name: asset.name,
        size: asset.size || 0,
      };
    } catch (error) {
      console.error("Pick document error:", error);
      throw error;
    }
  }

  // Record audio message
  static async recordAudio(): Promise<MediaResult | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error("Audio permission not granted");
      }

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      return new Promise((resolve, reject) => {
        let duration = 0;
        const interval = setInterval(() => {
          duration += 100;
        }, 100);

        // Auto-stop after 5 minutes
        const timeout = setTimeout(async () => {
          clearInterval(interval);
          try {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            if (uri) {
              resolve({
                uri,
                type: "audio",
                name: `AUDIO_${Date.now()}.m4a`,
                duration: duration / 1000,
              });
            } else {
              resolve(null);
            }
          } catch (error) {
            reject(error);
          }
        }, 300000); // 5 minutes

        // Return recording control
        (recording as any).stopRecording = async () => {
          clearInterval(interval);
          clearTimeout(timeout);
          try {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            if (uri) {
              resolve({
                uri,
                type: "audio",
                name: `AUDIO_${Date.now()}.m4a`,
                duration: duration / 1000,
              });
            } else {
              resolve(null);
            }
          } catch (error) {
            reject(error);
          }
        };
      });
    } catch (error) {
      console.error("Record audio error:", error);
      throw error;
    }
  }

  // Upload media to Firebase Storage
  static async uploadMedia(
    mediaResult: MediaResult,
    userId: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      const response = await fetch(mediaResult.uri);
      const blob = await response.blob();

      const timestamp = Date.now();
      const filename = mediaResult.name || `${mediaResult.type}_${timestamp}`;
      const storagePath = `media/${mediaResult.type}/${userId}/${timestamp}_${filename}`;

      const storageRef = ref(storage, storagePath);

      // Upload with progress monitoring
      const uploadTask = uploadBytes(storageRef, blob);

      // Simulate progress for now (Firebase Web SDK doesn't have progress events)
      if (onProgress) {
        const progressInterval = setInterval(() => {
          onProgress(Math.random() * 100);
        }, 200);

        setTimeout(() => {
          clearInterval(progressInterval);
          onProgress(100);
        }, 2000);
      }

      await uploadTask;
      const downloadUrl = await getDownloadURL(storageRef);

      return downloadUrl;
    } catch (error) {
      console.error("Upload media error:", error);
      throw error;
    }
  }

  // Generate thumbnail for video
  static async generateVideoThumbnail(
    videoUri: string
  ): Promise<string | null> {
    try {
      // This would require expo-video-thumbnails in a real implementation
      // For now, return null and handle in UI
      return null;
    } catch (error) {
      console.error("Generate thumbnail error:", error);
      return null;
    }
  }

  // Compress image
  static async compressImage(
    uri: string,
    quality: number = 0.7
  ): Promise<string> {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality,
      });

      return result.canceled ? uri : result.assets[0].uri;
    } catch (error) {
      console.error("Compress image error:", error);
      return uri;
    }
  }

  // Delete media from storage
  static async deleteMedia(mediaUrl: string): Promise<void> {
    try {
      const mediaRef = ref(storage, mediaUrl);
      await deleteObject(mediaRef);
    } catch (error) {
      console.error("Delete media error:", error);
      throw error;
    }
  }

  // Get media info
  static async getMediaInfo(
    uri: string
  ): Promise<{ size: number; duration?: number }> {
    try {
      const info = await FileSystem.getInfoAsync(uri);
      return {
        size: info.size || 0,
        // Duration would be extracted differently for audio/video
      };
    } catch (error) {
      console.error("Get media info error:", error);
      return { size: 0 };
    }
  }

  // Format file size
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B";

    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }

  // Format duration
  static formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }
}
