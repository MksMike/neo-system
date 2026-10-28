export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      company: {
        Row: {
          address: string | null;
          canceled_on: string | null;
          code: string;
          created_at: string;
          created_by: string | null;
          default_locale: string;
          deleted_at: string | null;
          display_name: string;
          email: string | null;
          id: string;
          invoice_reg_no: string | null;
          is_investor: boolean;
          legal_name: string;
          legal_name_kana: string | null;
          phone: string | null;
          postal_code: string | null;
          referred_by_company_id: string | null;
          status: string;
          status_locked: boolean;
          status_reason: string | null;
          timezone: string;
          updated_at: string;
          updated_by: string | null;
          version: number;
        };
        ComputedFields: never;
        Insert: {
          address?: string | null;
          canceled_on?: string | null;
          code: string;
          created_at?: string;
          created_by?: string | null;
          default_locale?: string;
          deleted_at?: string | null;
          display_name: string;
          email?: string | null;
          id?: string;
          invoice_reg_no?: string | null;
          is_investor?: boolean;
          legal_name: string;
          legal_name_kana?: string | null;
          phone?: string | null;
          postal_code?: string | null;
          referred_by_company_id?: string | null;
          status?: string;
          status_locked?: boolean;
          status_reason?: string | null;
          timezone?: string;
          updated_at?: string;
          updated_by?: string | null;
          version?: number;
        };
        Update: {
          address?: string | null;
          canceled_on?: string | null;
          code?: string;
          created_at?: string;
          created_by?: string | null;
          default_locale?: string;
          deleted_at?: string | null;
          display_name?: string;
          email?: string | null;
          id?: string;
          invoice_reg_no?: string | null;
          is_investor?: boolean;
          legal_name?: string;
          legal_name_kana?: string | null;
          phone?: string | null;
          postal_code?: string | null;
          referred_by_company_id?: string | null;
          status?: string;
          status_locked?: boolean;
          status_reason?: string | null;
          timezone?: string;
          updated_at?: string;
          updated_by?: string | null;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'company_referred_by_company_id_fkey';
            columns: ['referred_by_company_id'];
            isOneToOne: false;
            referencedRelation: 'company';
            referencedColumns: ['id'];
          },
        ];
      };
      company_module: {
        Row: {
          company_id: string;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          id: string;
          module_key: string;
          note: string | null;
          updated_at: string;
          updated_by: string | null;
          valid_from: string;
          valid_to: string | null;
          version: number;
        };
        ComputedFields: never;
        Insert: {
          company_id: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          id?: string;
          module_key: string;
          note?: string | null;
          updated_at?: string;
          updated_by?: string | null;
          valid_from: string;
          valid_to?: string | null;
          version?: number;
        };
        Update: {
          company_id?: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          id?: string;
          module_key?: string;
          note?: string | null;
          updated_at?: string;
          updated_by?: string | null;
          valid_from?: string;
          valid_to?: string | null;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'company_module_company_id_fkey';
            columns: ['company_id'];
            isOneToOne: false;
            referencedRelation: 'company';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'company_module_module_key_fkey';
            columns: ['module_key'];
            isOneToOne: false;
            referencedRelation: 'module';
            referencedColumns: ['key'];
          },
        ];
      };
      company_status_event: {
        Row: {
          actor_id: string | null;
          company_id: string;
          created_at: string;
          from_status: string | null;
          id: string;
          reason: string | null;
          source: string;
          to_status: string;
        };
        ComputedFields: never;
        Insert: {
          actor_id?: string | null;
          company_id: string;
          created_at?: string;
          from_status?: string | null;
          id?: string;
          reason?: string | null;
          source: string;
          to_status: string;
        };
        Update: {
          actor_id?: string | null;
          company_id?: string;
          created_at?: string;
          from_status?: string | null;
          id?: string;
          reason?: string | null;
          source?: string;
          to_status?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'company_status_event_company_id_fkey';
            columns: ['company_id'];
            isOneToOne: false;
            referencedRelation: 'company';
            referencedColumns: ['id'];
          },
        ];
      };
      contract: {
        Row: {
          billing_start: string | null;
          block_after_days: number;
          company_id: string;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          grace_days: number;
          id: string;
          note: string | null;
          paid_until: string | null;
          payment_method: string | null;
          price_yen: number;
          starts_on: string;
          trial_ends_on: string | null;
          type: string;
          updated_at: string;
          updated_by: string | null;
          valid_from: string;
          valid_to: string | null;
          version: number;
        };
        ComputedFields: never;
        Insert: {
          billing_start?: string | null;
          block_after_days?: number;
          company_id: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          grace_days?: number;
          id?: string;
          note?: string | null;
          paid_until?: string | null;
          payment_method?: string | null;
          price_yen?: number;
          starts_on: string;
          trial_ends_on?: string | null;
          type: string;
          updated_at?: string;
          updated_by?: string | null;
          valid_from: string;
          valid_to?: string | null;
          version?: number;
        };
        Update: {
          billing_start?: string | null;
          block_after_days?: number;
          company_id?: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          grace_days?: number;
          id?: string;
          note?: string | null;
          paid_until?: string | null;
          payment_method?: string | null;
          price_yen?: number;
          starts_on?: string;
          trial_ends_on?: string | null;
          type?: string;
          updated_at?: string;
          updated_by?: string | null;
          valid_from?: string;
          valid_to?: string | null;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'contract_company_id_fkey';
            columns: ['company_id'];
            isOneToOne: false;
            referencedRelation: 'company';
            referencedColumns: ['id'];
          },
        ];
      };
      job: {
        Row: {
          attempts: number;
          company_id: string | null;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          done_at: string | null;
          id: string;
          last_error: string | null;
          locked_until: string | null;
          max_attempts: number;
          payload: NonNullable<Json>;
          run_after: string;
          status: string;
          type: string;
          updated_at: string;
          updated_by: string | null;
          version: number;
        };
        ComputedFields: never;
        Insert: {
          attempts?: number;
          company_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          done_at?: string | null;
          id?: string;
          last_error?: string | null;
          locked_until?: string | null;
          max_attempts?: number;
          payload?: NonNullable<Json>;
          run_after?: string;
          status?: string;
          type: string;
          updated_at?: string;
          updated_by?: string | null;
          version?: number;
        };
        Update: {
          attempts?: number;
          company_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          done_at?: string | null;
          id?: string;
          last_error?: string | null;
          locked_until?: string | null;
          max_attempts?: number;
          payload?: NonNullable<Json>;
          run_after?: string;
          status?: string;
          type?: string;
          updated_at?: string;
          updated_by?: string | null;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'job_company_id_fkey';
            columns: ['company_id'];
            isOneToOne: false;
            referencedRelation: 'company';
            referencedColumns: ['id'];
          },
        ];
      };
      membership: {
        Row: {
          company_id: string;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          id: string;
          role: string;
          status: string;
          updated_at: string;
          updated_by: string | null;
          user_id: string;
          valid_until: string | null;
          version: number;
        };
        ComputedFields: never;
        Insert: {
          company_id: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          id?: string;
          role: string;
          status?: string;
          updated_at?: string;
          updated_by?: string | null;
          user_id: string;
          valid_until?: string | null;
          version?: number;
        };
        Update: {
          company_id?: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          id?: string;
          role?: string;
          status?: string;
          updated_at?: string;
          updated_by?: string | null;
          user_id?: string;
          valid_until?: string | null;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'membership_company_id_fkey';
            columns: ['company_id'];
            isOneToOne: false;
            referencedRelation: 'company';
            referencedColumns: ['id'];
          },
        ];
      };
      metric_hour: {
        Row: {
          bucket: string;
          count: number;
          error_count: number;
          histogram: number[];
          kind: string;
          max_ms: number;
          name: string;
          total_ms: number;
        };
        ComputedFields: never;
        Insert: {
          bucket: string;
          count?: number;
          error_count?: number;
          histogram?: number[];
          kind: string;
          max_ms?: number;
          name: string;
          total_ms?: number;
        };
        Update: {
          bucket?: string;
          count?: number;
          error_count?: number;
          histogram?: number[];
          kind?: string;
          max_ms?: number;
          name?: string;
          total_ms?: number;
        };
        Relationships: [];
      };
      metric_minute: {
        Row: {
          bucket: string;
          count: number;
          error_count: number;
          histogram: number[];
          kind: string;
          max_ms: number;
          name: string;
          total_ms: number;
        };
        ComputedFields: never;
        Insert: {
          bucket: string;
          count?: number;
          error_count?: number;
          histogram?: number[];
          kind: string;
          max_ms?: number;
          name: string;
          total_ms?: number;
        };
        Update: {
          bucket?: string;
          count?: number;
          error_count?: number;
          histogram?: number[];
          kind?: string;
          max_ms?: number;
          name?: string;
          total_ms?: number;
        };
        Relationships: [];
      };
      module: {
        Row: {
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          depends_any: string[];
          depends_on: string[];
          key: string;
          kind: string;
          name_ja: string;
          name_pt: string;
          sort_order: number;
          updated_at: string;
          updated_by: string | null;
          version: number;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          depends_any?: string[];
          depends_on?: string[];
          key: string;
          kind: string;
          name_ja: string;
          name_pt: string;
          sort_order: number;
          updated_at?: string;
          updated_by?: string | null;
          version?: number;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          depends_any?: string[];
          depends_on?: string[];
          key?: string;
          kind?: string;
          name_ja?: string;
          name_pt?: string;
          sort_order?: number;
          updated_at?: string;
          updated_by?: string | null;
          version?: number;
        };
        Relationships: [];
      };
      owner_invitation: {
        Row: {
          accepted_at: string | null;
          company_id: string;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          email: string;
          id: string;
          job_id: string | null;
          name: string;
          sent_at: string | null;
          status: string;
          updated_at: string;
          updated_by: string | null;
          version: number;
        };
        ComputedFields: never;
        Insert: {
          accepted_at?: string | null;
          company_id: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          email: string;
          id?: string;
          job_id?: string | null;
          name: string;
          sent_at?: string | null;
          status?: string;
          updated_at?: string;
          updated_by?: string | null;
          version?: number;
        };
        Update: {
          accepted_at?: string | null;
          company_id?: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          email?: string;
          id?: string;
          job_id?: string | null;
          name?: string;
          sent_at?: string | null;
          status?: string;
          updated_at?: string;
          updated_by?: string | null;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'owner_invitation_company_id_fkey';
            columns: ['company_id'];
            isOneToOne: false;
            referencedRelation: 'company';
            referencedColumns: ['id'];
          },
        ];
      };
      plan_template: {
        Row: {
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          key: string;
          module_keys: string[];
          name_ja: string;
          name_pt: string;
          sort_order: number;
          updated_at: string;
          updated_by: string | null;
          version: number;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          key: string;
          module_keys: string[];
          name_ja: string;
          name_pt: string;
          sort_order: number;
          updated_at?: string;
          updated_by?: string | null;
          version?: number;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          key?: string;
          module_keys?: string[];
          name_ja?: string;
          name_pt?: string;
          sort_order?: number;
          updated_at?: string;
          updated_by?: string | null;
          version?: number;
        };
        Relationships: [];
      };
      platform_admin: {
        Row: {
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          id: string;
          is_active: boolean;
          name: string;
          updated_at: string;
          updated_by: string | null;
          user_id: string;
          version: number;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          id?: string;
          is_active?: boolean;
          name: string;
          updated_at?: string;
          updated_by?: string | null;
          user_id: string;
          version?: number;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          id?: string;
          is_active?: boolean;
          name?: string;
          updated_at?: string;
          updated_by?: string | null;
          user_id?: string;
          version?: number;
        };
        Relationships: [];
      };
      platform_audit_log: {
        Row: {
          action: string;
          actor_id: string | null;
          company_id: string | null;
          created_at: string;
          id: string;
          payload: NonNullable<Json>;
        };
        ComputedFields: never;
        Insert: {
          action: string;
          actor_id?: string | null;
          company_id?: string | null;
          created_at?: string;
          id?: string;
          payload?: NonNullable<Json>;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          company_id?: string | null;
          created_at?: string;
          id?: string;
          payload?: NonNullable<Json>;
        };
        Relationships: [
          {
            foreignKeyName: 'platform_audit_log_company_id_fkey';
            columns: ['company_id'];
            isOneToOne: false;
            referencedRelation: 'company';
            referencedColumns: ['id'];
          },
        ];
      };
      platform_setting: {
        Row: {
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          description: string;
          key: string;
          updated_at: string;
          updated_by: string | null;
          value: NonNullable<Json>;
          version: number;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          description: string;
          key: string;
          updated_at?: string;
          updated_by?: string | null;
          value: NonNullable<Json>;
          version?: number;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          description?: string;
          key?: string;
          updated_at?: string;
          updated_by?: string | null;
          value?: NonNullable<Json>;
          version?: number;
        };
        Relationships: [];
      };
      saas_charge: {
        Row: {
          amount_yen: number;
          company_id: string;
          contract_id: string;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          due_on: string;
          fee_yen: number;
          id: string;
          paid_yen: number;
          period_end: string;
          period_start: string;
          status: string;
          updated_at: string;
          updated_by: string | null;
          version: number;
        };
        ComputedFields: never;
        Insert: {
          amount_yen: number;
          company_id: string;
          contract_id: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          due_on: string;
          fee_yen?: number;
          id?: string;
          paid_yen?: number;
          period_end: string;
          period_start: string;
          status?: string;
          updated_at?: string;
          updated_by?: string | null;
          version?: number;
        };
        Update: {
          amount_yen?: number;
          company_id?: string;
          contract_id?: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          due_on?: string;
          fee_yen?: number;
          id?: string;
          paid_yen?: number;
          period_end?: string;
          period_start?: string;
          status?: string;
          updated_at?: string;
          updated_by?: string | null;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'saas_charge_company_id_fkey';
            columns: ['company_id'];
            isOneToOne: false;
            referencedRelation: 'company';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'saas_charge_contract_id_fkey';
            columns: ['contract_id'];
            isOneToOne: false;
            referencedRelation: 'contract';
            referencedColumns: ['id'];
          },
        ];
      };
      saas_payment: {
        Row: {
          amount_yen: number;
          charge_id: string;
          company_id: string;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          id: string;
          method: string;
          note: string | null;
          paid_on: string;
          receipt_path: string | null;
          reference: string | null;
          settlement: string;
          updated_at: string;
          updated_by: string | null;
          version: number;
        };
        ComputedFields: never;
        Insert: {
          amount_yen: number;
          charge_id: string;
          company_id: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          id?: string;
          method: string;
          note?: string | null;
          paid_on: string;
          receipt_path?: string | null;
          reference?: string | null;
          settlement: string;
          updated_at?: string;
          updated_by?: string | null;
          version?: number;
        };
        Update: {
          amount_yen?: number;
          charge_id?: string;
          company_id?: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          id?: string;
          method?: string;
          note?: string | null;
          paid_on?: string;
          receipt_path?: string | null;
          reference?: string | null;
          settlement?: string;
          updated_at?: string;
          updated_by?: string | null;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'saas_payment_charge_id_fkey';
            columns: ['charge_id'];
            isOneToOne: false;
            referencedRelation: 'saas_charge';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'saas_payment_company_id_fkey';
            columns: ['company_id'];
            isOneToOne: false;
            referencedRelation: 'company';
            referencedColumns: ['id'];
          },
        ];
      };
      system_event: {
        Row: {
          at: string;
          code: string;
          company_id: string | null;
          data: NonNullable<Json>;
          duration_ms: number | null;
          id: string;
          request_id: string | null;
          route: string | null;
          seen_at: string | null;
          severity: string;
          user_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          at?: string;
          code: string;
          company_id?: string | null;
          data?: NonNullable<Json>;
          duration_ms?: number | null;
          id?: string;
          request_id?: string | null;
          route?: string | null;
          seen_at?: string | null;
          severity: string;
          user_id?: string | null;
        };
        Update: {
          at?: string;
          code?: string;
          company_id?: string | null;
          data?: NonNullable<Json>;
          duration_ms?: number | null;
          id?: string;
          request_id?: string | null;
          route?: string | null;
          seen_at?: string | null;
          severity?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      system_event_202610: {
        Row: {
          at: string;
          code: string;
          company_id: string | null;
          data: NonNullable<Json>;
          duration_ms: number | null;
          id: string;
          request_id: string | null;
          route: string | null;
          seen_at: string | null;
          severity: string;
          user_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          at?: string;
          code: string;
          company_id?: string | null;
          data?: NonNullable<Json>;
          duration_ms?: number | null;
          id?: string;
          request_id?: string | null;
          route?: string | null;
          seen_at?: string | null;
          severity: string;
          user_id?: string | null;
        };
        Update: {
          at?: string;
          code?: string;
          company_id?: string | null;
          data?: NonNullable<Json>;
          duration_ms?: number | null;
          id?: string;
          request_id?: string | null;
          route?: string | null;
          seen_at?: string | null;
          severity?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      system_event_202611: {
        Row: {
          at: string;
          code: string;
          company_id: string | null;
          data: NonNullable<Json>;
          duration_ms: number | null;
          id: string;
          request_id: string | null;
          route: string | null;
          seen_at: string | null;
          severity: string;
          user_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          at?: string;
          code: string;
          company_id?: string | null;
          data?: NonNullable<Json>;
          duration_ms?: number | null;
          id?: string;
          request_id?: string | null;
          route?: string | null;
          seen_at?: string | null;
          severity: string;
          user_id?: string | null;
        };
        Update: {
          at?: string;
          code?: string;
          company_id?: string | null;
          data?: NonNullable<Json>;
          duration_ms?: number | null;
          id?: string;
          request_id?: string | null;
          route?: string | null;
          seen_at?: string | null;
          severity?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      system_event_202612: {
        Row: {
          at: string;
          code: string;
          company_id: string | null;
          data: NonNullable<Json>;
          duration_ms: number | null;
          id: string;
          request_id: string | null;
          route: string | null;
          seen_at: string | null;
          severity: string;
          user_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          at?: string;
          code: string;
          company_id?: string | null;
          data?: NonNullable<Json>;
          duration_ms?: number | null;
          id?: string;
          request_id?: string | null;
          route?: string | null;
          seen_at?: string | null;
          severity: string;
          user_id?: string | null;
        };
        Update: {
          at?: string;
          code?: string;
          company_id?: string | null;
          data?: NonNullable<Json>;
          duration_ms?: number | null;
          id?: string;
          request_id?: string | null;
          route?: string | null;
          seen_at?: string | null;
          severity?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      system_event_default: {
        Row: {
          at: string;
          code: string;
          company_id: string | null;
          data: NonNullable<Json>;
          duration_ms: number | null;
          id: string;
          request_id: string | null;
          route: string | null;
          seen_at: string | null;
          severity: string;
          user_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          at?: string;
          code: string;
          company_id?: string | null;
          data?: NonNullable<Json>;
          duration_ms?: number | null;
          id?: string;
          request_id?: string | null;
          route?: string | null;
          seen_at?: string | null;
          severity: string;
          user_id?: string | null;
        };
        Update: {
          at?: string;
          code?: string;
          company_id?: string | null;
          data?: NonNullable<Json>;
          duration_ms?: number | null;
          id?: string;
          request_id?: string | null;
          route?: string | null;
          seen_at?: string | null;
          severity?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      user_profile: {
        Row: {
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          display_name: string;
          employee_login_id: string | null;
          id: string;
          locale: string;
          login_kind: string;
          updated_at: string;
          updated_by: string | null;
          user_id: string;
          version: number;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          display_name: string;
          employee_login_id?: string | null;
          id?: string;
          locale?: string;
          login_kind: string;
          updated_at?: string;
          updated_by?: string | null;
          user_id: string;
          version?: number;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          display_name?: string;
          employee_login_id?: string | null;
          id?: string;
          locale?: string;
          login_kind?: string;
          updated_at?: string;
          updated_by?: string | null;
          user_id?: string;
          version?: number;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      accept_owner_invitation: { Args: { p_invitation_id: string }; Returns: string };
      cancel_company: {
        Args: { p_company_id: string; p_effective_on?: string; p_reason: string };
        Returns: string;
      };
      change_contract: {
        Args: { p: Json; p_company_id: string; p_valid_from?: string };
        Returns: string;
      };
      claim_jobs: {
        Args: { p_limit?: number; p_lock_seconds?: number };
        Returns: {
          attempts: number;
          company_id: string | null;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          done_at: string | null;
          id: string;
          last_error: string | null;
          locked_until: string | null;
          max_attempts: number;
          payload: NonNullable<Json>;
          run_after: string;
          status: string;
          type: string;
          updated_at: string;
          updated_by: string | null;
          version: number;
        }[];
        SetofOptions: {
          from: '*';
          to: 'job';
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      company_can_write: { Args: { p_company_id: string }; Returns: boolean };
      complete_job: { Args: { p_job_id: string }; Returns: undefined };
      fail_job: { Args: { p_error: string; p_job_id: string }; Returns: string };
      generate_saas_charges: { Args: { p_today?: string }; Returns: number };
      has_module: { Args: { p_company_id: string; p_module_key: string }; Returns: boolean };
      ingest_observability: { Args: { p_events: Json; p_metrics: Json }; Returns: undefined };
      mark_events_seen: { Args: { p_event_ids: string[] }; Returns: number };
      my_company_access: { Args: { p_company_id: string }; Returns: Json };
      my_session: { Args: Record<PropertyKey, never>; Returns: Json };
      provision_company: { Args: { p: Json }; Returns: string };
      reactivate_company: { Args: { p_company_id: string; p_reason: string }; Returns: string };
      recompute_company_status: { Args: { p_today?: string }; Returns: number };
      register_saas_payment: { Args: { p: Json; p_charge_id: string }; Returns: Json };
      retry_job: { Args: { p_job_id: string }; Returns: undefined };
      set_company_modules: {
        Args: { p_company_id: string; p_module_keys: string[]; p_valid_from?: string };
        Returns: Json;
      };
      suspend_company: { Args: { p_company_id: string; p_reason: string }; Returns: undefined };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
