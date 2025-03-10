-- Remover a coluna truck_id da tabela operators (se ainda não foi feito)
ALTER TABLE operators DROP COLUMN IF EXISTS truck_id;

-- Garantir que a tabela trucks tenha a coluna operator_id
ALTER TABLE trucks ADD COLUMN IF NOT EXISTS operator_id INTEGER REFERENCES operators(id);

-- Criar índice para melhorar a performance das consultas
CREATE INDEX IF NOT EXISTS idx_trucks_operator_id ON trucks(operator_id);

-- Atualizar o status de todos os caminhões para disponível (se necessário)
UPDATE trucks SET truck_entry_status = 0 WHERE truck_entry_status IS NULL;

