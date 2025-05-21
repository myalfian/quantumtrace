export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          full_name: string
          email: string
          role: 'admin' | 'supervisor' | 'engineer'
          team_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name: string
          email: string
          role: 'admin' | 'supervisor' | 'engineer'
          team_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name?: string
          email?: string
          role?: 'admin' | 'supervisor' | 'engineer'
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_team_id_fkey"
            columns: ["team_id"]
            referencedRelation: "teams"
            referencedColumns: ["id"]
          }
        ]
      }
      teams: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          supervisor_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          supervisor_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          supervisor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_supervisor_id_fkey"
            columns: ["supervisor_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      activities: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          date: string
          description: string
          status: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          date: string
          description: string
          status: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          date?: string
          description?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      reminders: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          title: string
          description: string
          due_date: string
          priority: string
          status: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          title: string
          description: string
          due_date: string
          priority: string
          status: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          title?: string
          description?: string
          due_date?: string
          priority?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      projects: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string
          status: string
          team_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description: string
          status: string
          team_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string
          status?: string
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_team_id_fkey"
            columns: ["team_id"]
            referencedRelation: "teams"
            referencedColumns: ["id"]
          }
        ]
      }
      project_updates: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          project_id: string
          progress: number
          update_text: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          project_id: string
          progress: number
          update_text: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          project_id?: string
          progress?: number
          update_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_updates_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      productivity_metrics: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          metric: string
          value: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          metric: string
          value: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          metric?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "productivity_metrics_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      leave_requests: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          start_date: string
          end_date: string
          reason: string
          status: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          start_date: string
          end_date: string
          reason: string
          status: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          start_date?: string
          end_date?: string
          reason?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}