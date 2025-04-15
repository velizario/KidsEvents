export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      children: {
        Row: {
          created_at: string | null;
          date_of_birth: string;
          first_name: string;
          id: string;
          last_name: string;
          parent_id: string;
          special_needs: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          date_of_birth: string;
          first_name: string;
          id?: string;
          last_name: string;
          parent_id: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          date_of_birth?: string;
          first_name?: string;
          id?: string;
          last_name?: string;
          parent_id?: string;
          special_needs?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "children_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "parents";
            referencedColumns: ["id"];
          }
        ];
      };
      events: {
        Row: {
          age_group: string;
          capacity: number;
          category: string;
          created_at: string | null;
          date: string;
          description: string;
          id: string;
          image_url: string;
          is_paid: boolean | null;
          location: string;
          long_description: string | null;
          organizer_id: string;
          price: string;
          registrations: number | null;
          status: string;
          time: string;
          title: string;
          updated_at: string | null;
        };
        Insert: {
          age_group: string;
          capacity: number;
          category: string;
          created_at?: string | null;
          date: string;
          description: string;
          id?: string;
          image_url: string;
          is_paid?: boolean | null;
          location: string;
          long_description?: string | null;
          organizer_id: string;
          price: string;
          registrations?: number | null;
          status: string;
          time: string;
          title: string;
          updated_at?: string | null;
        };
        Update: {
          age_group?: string;
          capacity?: number;
          category?: string;
          created_at?: string | null;
          date?: string;
          description?: string;
          id?: string;
          image_url?: string;
          is_paid?: boolean | null;
          location?: string;
          long_description?: string | null;
          organizer_id?: string;
          price?: string;
          registrations?: number | null;
          status?: string;
          time?: string;
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "events_organizer_id_fkey";
            columns: ["organizer_id"];
            isOneToOne: false;
            referencedRelation: "organizers";
            referencedColumns: ["id"];
          }
        ];
      };
      organizers: {
        Row: {
          address: string | null;
          city: string | null;
          contact_name: string;
          created_at: string | null;
          description: string;
          email: string;
          id: string;
          organization_name: string;
          phone: string;
          rating: number | null;
          review_count: number | null;
          state: string | null;
          updated_at: string | null;
          website: string | null;
          year_established: number | null;
          zip_code: string | null;
        };
        Insert: {
          address?: string | null;
          city?: string | null;
          contact_name: string;
          created_at?: string | null;
          description: string;
          email: string;
          id?: string;
          organization_name: string;
          phone: string;
          rating?: number | null;
          review_count?: number | null;
          state?: string | null;
          updated_at?: string | null;
          website?: string | null;
          year_established?: number | null;
          zip_code?: string | null;
        };
        Update: {
          address?: string | null;
          city?: string | null;
          contact_name?: string;
          created_at?: string | null;
          description?: string;
          email?: string;
          id?: string;
          organization_name?: string;
          phone?: string;
          rating?: number | null;
          review_count?: number | null;
          state?: string | null;
          updated_at?: string | null;
          website?: string | null;
          year_established?: number | null;
          zip_code?: string | null;
        };
        Relationships: [];
      };
      parents: {
        Row: {
          address: string | null;
          city: string | null;
          created_at: string | null;
          email: string;
          first_name: string;
          id: string;
          last_name: string;
          phone: string;
          state: string | null;
          updated_at: string | null;
          zip_code: string | null;
        };
        Insert: {
          address?: string | null;
          city?: string | null;
          created_at?: string | null;
          email: string;
          first_name: string;
          id?: string;
          last_name: string;
          phone: string;
          state?: string | null;
          updated_at?: string | null;
          zip_code?: string | null;
        };
        Update: {
          address?: string | null;
          city?: string | null;
          created_at?: string | null;
          email?: string;
          first_name?: string;
          id?: string;
          last_name?: string;
          phone?: string;
          state?: string | null;
          updated_at?: string | null;
          zip_code?: string | null;
        };
        Relationships: [];
      };
      registrations: {
        Row: {
          child_id: string;
          confirmation_code: string;
          created_at: string | null;
          emergency_contact: Json;
          event_id: string;
          id: string;
          parent_id: string;
          payment_status: string;
          registration_date: string;
          status: string;
          updated_at: string | null;
        };
        Insert: {
          child_id: string;
          confirmation_code: string;
          created_at?: string | null;
          emergency_contact: Json;
          event_id: string;
          id?: string;
          parent_id: string;
          payment_status: string;
          registration_date: string;
          status: string;
          updated_at?: string | null;
        };
        Update: {
          child_id?: string;
          confirmation_code?: string;
          created_at?: string | null;
          emergency_contact?: Json;
          event_id?: string;
          id?: string;
          parent_id?: string;
          payment_status?: string;
          registration_date?: string;
          status?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "registrations_child_id_fkey";
            columns: ["child_id"];
            isOneToOne: false;
            referencedRelation: "children";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "registrations_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "registrations_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "parents";
            referencedColumns: ["id"];
          }
        ];
      };
      reviews: {
        Row: {
          comment: string;
          created_at: string | null;
          date: string;
          event_id: string;
          id: string;
          parent_id: string;
          rating: number;
          updated_at: string | null;
        };
        Insert: {
          comment: string;
          created_at?: string | null;
          date: string;
          event_id: string;
          id?: string;
          parent_id: string;
          rating: number;
          updated_at?: string | null;
        };
        Update: {
          comment?: string;
          created_at?: string | null;
          date?: string;
          event_id?: string;
          id?: string;
          parent_id?: string;
          rating?: number;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "parents";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
      PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
      PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
  ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;
