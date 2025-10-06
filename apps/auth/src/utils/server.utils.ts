import { Request } from 'express';

export class ServerUtils {
  private static requestHost: string | null = null;

  static setRequestHost(req: Request): void {
    const serverHost = `${req.protocol}://${req.get('host')}`;
    this.requestHost = serverHost;
    console.log('Set server host from request:', serverHost);
  }

  static getServerBaseUrl(): string {
    // Primary: Use request-based host if available
    if (this.requestHost) {
      console.log('Using request-based server host:', this.requestHost);
      return this.requestHost;
    }

    // Fallback only: Use localhost for development when no request is available
    const baseUrl = 'http://localhost:3000';
    console.log('Using fallback localhost URL:', baseUrl);
    return baseUrl;
  }

  static getVideoStreamUrl(courseId: string, filename: string): string {
    const baseUrl = this.getServerBaseUrl();
    return `${baseUrl}/auth/api/v1/courses/${courseId}/videos/stream/${filename}`;
  }

  static getThumbnailUrl(courseId: string, filename: string): string {
    const baseUrl = this.getServerBaseUrl();
    return `${baseUrl}/auth/api/v1/courses/${courseId}/thumbnails/${filename}`;
  }

  // Legacy method for backward compatibility
  static getLegacyThumbnailUrl(filename: string): string {
    const baseUrl = this.getServerBaseUrl();
    return `${baseUrl}/auth/api/v1/courses/thumbnails/${filename}`;
  }
}