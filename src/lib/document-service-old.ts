// @ts-nocheck
import { createClient } from "@/lib/supabase/server";

export interface DocumentRequest {
  bookingId: string;
  documentType: "confirmation" | "invoice" | "agreement" | "receipt";
  generateIfMissing?: boolean;
}

export interface DocumentInfo {
  id: string;
  document_type: string;
  file_name: string;
  file_url?: string;
  mime_type: string;
  file_size?: number;
  is_generated: boolean;
  generated_at?: string;
  created_at: string;
}

export class DocumentService {
  private supabase;

  constructor() {
    this.supabase = createClient();
  }

  /**
   * Get all documents for a booking
   */
  async getBookingDocuments(bookingId: string): Promise<DocumentInfo[]> {
    const { data, error } = await this.supabase
      .from("booking_documents")
      .select("*")
      .eq("booking_id", bookingId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching booking documents:", error);
      return [];
    }

    return data || [];
  }

  /**
   * Get a specific document for a booking
   */
  async getDocument(
    bookingId: string,
    documentType: string
  ): Promise<DocumentInfo | null> {
    const { data, error } = await this.supabase
      .from("booking_documents")
      .select("*")
      .eq("booking_id", bookingId)
      .eq("document_type", documentType)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  }

  /**
   * Generate document URL for customer access
   */
  generateDocumentUrl(
    bookingToken: string,
    documentType: string,
    accessToken?: string
  ): string {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const params = new URLSearchParams({
      booking: bookingToken,
      type: documentType,
    });

    if (accessToken) {
      params.append("token", accessToken);
    }

    return `${baseUrl}/api/documents/generate?${params.toString()}`;
  }

  /**
   * Create document access token for a booking
   */
  async createAccessToken(
    bookingId: string,
    expiresInHours: number = 168
  ): Promise<string | null> {
    try {
      // Generate random token
      const token = this.generateSecureToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + expiresInHours);

      const { data, error } = await this.supabase
        .from("booking_access_tokens")
        .insert({
          booking_id: bookingId,
          access_token: token,
          token_type: "customer_access",
          expires_at: expiresAt.toISOString(),
          is_active: true,
        })
        .select("access_token")
        .single();

      if (error) {
        console.error("Error creating access token:", error);
        return null;
      }

      return data.access_token;
    } catch (error) {
      console.error("Error generating access token:", error);
      return null;
    }
  }

  /**
   * Schedule automatic document generation after booking completion
   */
  async scheduleDocumentGeneration(
    bookingId: string,
    bookingStatus: string
  ): Promise<void> {
    try {
      const documents = [];

      // Always generate confirmation document
      documents.push({
        booking_id: bookingId,
        document_type: "confirmation",
        file_name: `confirmation-${bookingId}.pdf`,
        mime_type: "application/pdf",
        is_generated: false, // Will be generated on demand
        document_data: {
          scheduled_at: new Date().toISOString(),
          booking_status: bookingStatus,
        },
      });

      // Generate invoice if payment was made
      if (bookingStatus === "confirmed") {
        const { data: payment } = await this.supabase
          .from("payment_records")
          .select("id")
          .eq("booking_id", bookingId)
          .eq("status", "completed")
          .single();

        if (payment) {
          documents.push({
            booking_id: bookingId,
            document_type: "invoice",
            file_name: `invoice-${bookingId}.pdf`,
            mime_type: "application/pdf",
            is_generated: false,
            document_data: {
              scheduled_at: new Date().toISOString(),
              payment_id: payment.id,
            },
          });
        }
      }

      // Generate agreement document if signature exists
      const { data: signature } = await this.supabase
        .from("digital_signatures")
        .select("id")
        .eq("booking_id", bookingId)
        .single();

      if (signature) {
        documents.push({
          booking_id: bookingId,
          document_type: "agreement",
          file_name: `agreement-${bookingId}.pdf`,
          mime_type: "application/pdf",
          is_generated: false,
          document_data: {
            scheduled_at: new Date().toISOString(),
            signature_id: signature.id,
          },
        });
      }

      // Insert document records
      if (documents.length > 0) {
        const { error } = await this.supabase
          .from("booking_documents")
          .upsert(documents, { onConflict: "booking_id,document_type" });

        if (error) {
          console.error("Error scheduling document generation:", error);
        } else {
          console.log(
            `Scheduled ${documents.length} documents for booking ${bookingId}`
          );
        }
      }
    } catch (error) {
      console.error("Error in scheduleDocumentGeneration:", error);
    }
  }

  /**
   * Get document access statistics
   */
  async getDocumentStats(bookingId: string): Promise<{
    totalDocuments: number;
    generatedDocuments: number;
    totalAccess: number;
    lastAccessed?: string;
  }> {
    try {
      // Get document count
      const { data: documents, error: docError } = await this.supabase
        .from("booking_documents")
        .select("is_generated")
        .eq("booking_id", bookingId);

      if (docError) {
        console.error("Error fetching document stats:", docError);
        return { totalDocuments: 0, generatedDocuments: 0, totalAccess: 0 };
      }

      const totalDocuments = documents?.length || 0;
      const generatedDocuments =
        documents?.filter((d) => d.is_generated).length || 0;

      // Get access token stats
      const { data: accessStats, error: accessError } = await this.supabase
        .from("booking_access_tokens")
        .select("access_count, last_accessed_at")
        .eq("booking_id", bookingId)
        .order("last_accessed_at", { ascending: false })
        .limit(1)
        .single();

      if (accessError && accessError.code !== "PGRST116") {
        // Ignore "not found" error
        console.error("Error fetching access stats:", accessError);
      }

      return {
        totalDocuments,
        generatedDocuments,
        totalAccess: accessStats?.access_count || 0,
        lastAccessed: accessStats?.last_accessed_at || undefined,
      };
    } catch (error) {
      console.error("Error calculating document stats:", error);
      return { totalDocuments: 0, generatedDocuments: 0, totalAccess: 0 };
    }
  }

  /**
   * Clean up expired tokens
   */
  async cleanupExpiredTokens(): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from("booking_access_tokens")
        .update({ is_active: false })
        .lt("expires_at", new Date().toISOString())
        .eq("is_active", true)
        .select("id");

      if (error) {
        console.error("Error cleaning up expired tokens:", error);
        return 0;
      }

      return data?.length || 0;
    } catch (error) {
      console.error("Error in cleanupExpiredTokens:", error);
      return 0;
    }
  }

  /**
   * Generate a secure random token
   */
  private generateSecureToken(): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    let result = "";
    for (let i = 0; i < 64; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Verify booking access
   */
  async verifyBookingAccess(
    bookingToken: string,
    accessToken?: string
  ): Promise<{
    booking: any;
    hasAccess: boolean;
    reason?: string;
  }> {
    try {
      // Get booking by token
      const { data: booking, error: bookingError } = await this.supabase
        .from("bookings")
        .select("*")
        .eq("booking_token", bookingToken)
        .single();

      if (bookingError || !booking) {
        return {
          booking: null,
          hasAccess: false,
          reason: "Booking not found",
        };
      }

      // If no access token provided, basic access only
      if (!accessToken) {
        return {
          booking,
          hasAccess: true,
          reason: "Basic access (no token)",
        };
      }

      // Verify access token
      const { data: tokenData, error: tokenError } = await this.supabase
        .from("booking_access_tokens")
        .select("*")
        .eq("access_token", accessToken)
        .eq("booking_id", booking.id)
        .eq("is_active", true)
        .single();

      if (tokenError || !tokenData) {
        return {
          booking,
          hasAccess: false,
          reason: "Invalid access token",
        };
      }

      // Check expiration
      if (tokenData.expires_at && new Date() > new Date(tokenData.expires_at)) {
        return {
          booking,
          hasAccess: false,
          reason: "Access token expired",
        };
      }

      return {
        booking,
        hasAccess: true,
        reason: "Valid token access",
      };
    } catch (error) {
      console.error("Error verifying booking access:", error);
      return {
        booking: null,
        hasAccess: false,
        reason: "System error",
      };
    }
  }
}

// Export singleton instance
export const documentService = new DocumentService();
