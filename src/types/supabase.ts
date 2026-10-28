// src/types/supabase.ts
// Placeholder for generated Supabase Database types.
// Replace with output from: npx supabase gen types typescript --linked > src/types/supabase.ts
//
// Until real types are generated, every table is typed as `any` so that
// `.from(...).select(...)` calls return `any[]` instead of `never[]`.

type AnyRow = Record<string, any>;

interface AnyTable {
  Row: AnyRow;
  Insert: AnyRow;
  Update: AnyRow;
  Relationships: [];
}

export type Database = {
  public: {
    Tables: {
      [key: string]: AnyTable;
    };
    Views: {
      [key: string]: {
        Row: AnyRow;
      };
    };
    Functions: {
      [key: string]: {
        Args: AnyRow;
        Returns: any;
      };
    };
    Enums: {
      [key: string]: string;
    };
    CompositeTypes: {
      [key: string]: AnyRow;
    };
  };
};
