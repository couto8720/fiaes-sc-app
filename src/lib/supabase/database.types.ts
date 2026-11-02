// Tipos da base de dados, escritos à mão a partir das migrações.
// Depois de ligares o projeto Supabase, regenera com:
//   npm run db:tipos
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type EstadoJogo =
  | "agendado"
  | "primeira_parte"
  | "intervalo"
  | "segunda_parte"
  | "final"
  | "adiado"
  | "cancelado";

export type PapelAdmin = "super_admin" | "treinador";

type Tabela<Row, Obrigatorios extends keyof Row> = {
  Row: Row;
  Insert: Pick<Row, Obrigatorios> & Partial<Omit<Row, Obrigatorios>>;
  Update: Partial<Row>;
};

export type Database = {
  __InternalSupabase: { PostgrestVersion: "13" };
  public: {
    Tables: {
      clube_config: Tabela<
        {
          id: boolean;
          nome: string;
          nome_curto: string;
          logo_url: string | null;
          cor_primaria: string;
          cor_secundaria: string;
          cor_destaque: string;
          hashtag: string | null;
        },
        "nome" | "nome_curto"
      > & { Relationships: [] };
      escaloes: Tabela<
        {
          id: string;
          nome: string;
          slug: string;
          ordem: number;
          epoca: string;
          competicao: string | null;
          ativo: boolean;
        },
        "nome" | "slug" | "epoca"
      > & { Relationships: [] };
      locais: Tabela<
        { id: string; nome: string; morada: string | null; maps_url: string | null },
        "nome"
      > & { Relationships: [] };
      jogos: Tabela<
        {
          id: string;
          escalao_id: string;
          competicao: string | null;
          jornada: number | null;
          data_hora: string;
          local_id: string | null;
          em_casa: boolean;
          adversario: string;
          adversario_logo_url: string | null;
          golos_clube: number | null;
          golos_adversario: number | null;
          estado: EstadoJogo;
          estado_desde: string;
          notas: string | null;
          atualizado_por: string | null;
          atualizado_em: string;
        },
        "escalao_id" | "data_hora" | "em_casa" | "adversario"
      > & {
        Relationships: [
          {
            foreignKeyName: "jogos_escalao_id_fkey";
            columns: ["escalao_id"];
            isOneToOne: false;
            referencedRelation: "escaloes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "jogos_local_id_fkey";
            columns: ["local_id"];
            isOneToOne: false;
            referencedRelation: "locais";
            referencedColumns: ["id"];
          },
        ];
      };
      classificacoes: Tabela<
        {
          id: string;
          escalao_id: string;
          posicao: number;
          equipa: string;
          e_o_clube: boolean;
          jogos: number;
          vitorias: number;
          empates: number;
          derrotas: number;
          golos_marcados: number;
          golos_sofridos: number;
          pontos: number;
          atualizado_em: string;
        },
        "escalao_id" | "posicao" | "equipa"
      > & {
        Relationships: [
          {
            foreignKeyName: "classificacoes_escalao_id_fkey";
            columns: ["escalao_id"];
            isOneToOne: false;
            referencedRelation: "escaloes";
            referencedColumns: ["id"];
          },
        ];
      };
      golos: Tabela<
        { id: string; jogo_id: string; marcador: string; minuto: number | null; penalti: boolean; criado_em: string },
        "jogo_id" | "marcador"
      > & {
        Relationships: [
          {
            foreignKeyName: "golos_jogo_id_fkey";
            columns: ["jogo_id"];
            isOneToOne: false;
            referencedRelation: "jogos";
            referencedColumns: ["id"];
          },
        ];
      };
      expulsoes: Tabela<
        { id: string; jogo_id: string; lado: "clube" | "adversario"; atleta: string | null; minuto: number | null; criado_em: string },
        "jogo_id" | "lado"
      > & {
        Relationships: [
          {
            foreignKeyName: "expulsoes_jogo_id_fkey";
            columns: ["jogo_id"];
            isOneToOne: false;
            referencedRelation: "jogos";
            referencedColumns: ["id"];
          },
        ];
      };
      adeptos: Tabela<
        { id: string; nome: string; numero_socio: string | null; escaloes: string[]; criado_em: string },
        "id" | "nome"
      > & { Relationships: [] };
      perfis: Tabela<
        { id: string; nome: string; email: string | null; papel: PapelAdmin; ativo: boolean },
        "id" | "nome"
      > & { Relationships: [] };
      perfis_escaloes: Tabela<
        { perfil_id: string; escalao_id: string },
        "perfil_id" | "escalao_id"
      > & {
        Relationships: [
          {
            foreignKeyName: "perfis_escaloes_perfil_id_fkey";
            columns: ["perfil_id"];
            isOneToOne: false;
            referencedRelation: "perfis";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "perfis_escaloes_escalao_id_fkey";
            columns: ["escalao_id"];
            isOneToOne: false;
            referencedRelation: "escaloes";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      is_admin_ativo: { Args: Record<string, never>; Returns: boolean };
      is_super_admin: { Args: Record<string, never>; Returns: boolean };
      pode_editar_escalao: { Args: { e: string }; Returns: boolean };
      substituir_classificacao: { Args: { p_escalao: string; p_linhas: Json }; Returns: undefined };
      pode_editar_jogo: { Args: { j: string }; Returns: boolean };
      abreviar_nome: { Args: { nome: string }; Returns: string };
    };
    Enums: { estado_jogo: EstadoJogo; papel_admin: PapelAdmin };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Jogo = Database["public"]["Tables"]["jogos"]["Row"];
export type Escalao = Database["public"]["Tables"]["escaloes"]["Row"];
export type Local = Database["public"]["Tables"]["locais"]["Row"];
export type Classificacao = Database["public"]["Tables"]["classificacoes"]["Row"];
export type ClubeConfig = Database["public"]["Tables"]["clube_config"]["Row"];
export type Perfil = Database["public"]["Tables"]["perfis"]["Row"];
export type GoloLinha = Database["public"]["Tables"]["golos"]["Row"];
export type ExpulsaoLinha = Database["public"]["Tables"]["expulsoes"]["Row"];
export type Adepto = Database["public"]["Tables"]["adeptos"]["Row"];
