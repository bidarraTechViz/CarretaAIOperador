-- Função para adicionar a coluna operator_name à tabela trips
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

-- Executar a função para adicionar a coluna
SELECT add_operator_name_column();

