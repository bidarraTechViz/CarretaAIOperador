-- Função para adicionar a coluna photo_base64 à tabela trips
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

-- Função auxiliar para executar SQL diretamente (caso necessário)
CREATE OR REPLACE FUNCTION execute_sql(sql text)
RETURNS void AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql;

-- Executar a função para adicionar a coluna
SELECT add_photo_base64_column();

