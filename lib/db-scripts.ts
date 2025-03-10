"use server"

import { createClient } from "@supabase/supabase-js"

export async function addPhotoBase64Column() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  // Usando a service role key para ter permissões de alteração de schema
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // Verificar se a função RPC existe
    const { data: functionExists, error: functionCheckError } = await supabase
      .from("pg_proc")
      .select("*")
      .eq("proname", "add_photo_base64_column")
      .maybeSingle()

    if (functionCheckError) {
      console.error("Erro ao verificar função RPC:", functionCheckError)
      return {
        success: false,
        error: {
          message:
            "A função RPC add_photo_base64_column não foi encontrada. Por favor, crie-a no SQL Editor do Supabase.",
        },
      }
    }

    if (!functionExists) {
      // Se a função não existir, tentar criar a coluna diretamente
      const { error: alterTableError } = await supabase.rpc("add_photo_base64_column")

      if (alterTableError) {
        // Tentar alternativa: executar SQL diretamente
        const { error: directSqlError } = await supabase.from("trips").select("photo_base64").limit(1)

        if (directSqlError && directSqlError.message.includes('column "photo_base64" does not exist')) {
          // A coluna não existe, tentar adicioná-la
          const { error: addColumnError } = await supabase.rpc("execute_sql", {
            sql: "ALTER TABLE trips ADD COLUMN IF NOT EXISTS photo_base64 TEXT;",
          })

          if (addColumnError) {
            return { success: false, error: addColumnError }
          }
        } else if (!directSqlError) {
          // A coluna já existe
          return { success: true, message: "A coluna photo_base64 já existe na tabela trips." }
        } else {
          return { success: false, error: directSqlError }
        }
      }
    } else {
      // A função existe, chamá-la
      const { error } = await supabase.rpc("add_photo_base64_column")

      if (error) {
        return { success: false, error }
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Erro ao adicionar coluna photo_base64:", error)
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
    }
  }
}

export async function addOperatorNameColumn() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  // Usando a service role key para ter permissões de alteração de schema
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // Verificar se a função RPC existe
    const { data: functionExists, error: functionCheckError } = await supabase
      .from("pg_proc")
      .select("*")
      .eq("proname", "add_operator_name_column")
      .maybeSingle()

    if (functionCheckError) {
      console.error("Erro ao verificar função RPC:", functionCheckError)
      return {
        success: false,
        error: {
          message:
            "A função RPC add_operator_name_column não foi encontrada. Por favor, crie-a no SQL Editor do Supabase.",
        },
      }
    }

    if (!functionExists) {
      // Se a função não existir, tentar criar a coluna diretamente
      const { error: directSqlError } = await supabase.from("trips").select("operator_name").limit(1)

      if (directSqlError && directSqlError.message.includes('column "operator_name" does not exist')) {
        // A coluna não existe, tentar adicioná-la
        const { error: addColumnError } = await supabase.rpc("execute_sql", {
          sql: "ALTER TABLE trips ADD COLUMN IF NOT EXISTS operator_name TEXT;",
        })

        if (addColumnError) {
          return { success: false, error: addColumnError }
        }
      } else if (!directSqlError) {
        // A coluna já existe
        return { success: true, message: "A coluna operator_name já existe na tabela trips." }
      } else {
        return { success: false, error: directSqlError }
      }
    } else {
      // A função existe, chamá-la
      const { error } = await supabase.rpc("add_operator_name_column")

      if (error) {
        return { success: false, error }
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Erro ao adicionar coluna operator_name:", error)
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
    }
  }
}

// Nota: Você precisa criar esta função RPC no Supabase SQL Editor:
/*
CREATE OR REPLACE FUNCTION add_photo_base64_column()
RETURNS void AS $$
BEGIN
  -- Verifica se a coluna já existe
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'trips' 
    AND column_name = 'photo_base64'
  ) THEN
    -- Adiciona a coluna se não existir
    ALTER TABLE trips ADD COLUMN photo_base64 TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION add_operator_name_column()
RETURNS void AS $$
BEGIN
  -- Verifica se a coluna já existe
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'trips' 
    AND column_name = 'operator_name'
  ) THEN
    -- Adiciona a coluna se não existir
    ALTER TABLE trips ADD COLUMN operator_name TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Função auxiliar para executar SQL diretamente (caso necessário)
CREATE OR REPLACE FUNCTION execute_sql(sql text)
RETURNS void AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql;
*/

