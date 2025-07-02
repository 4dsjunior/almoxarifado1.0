-- Sistema de Almoxarifado - Setup Supabase
-- Execute este script no SQL Editor do Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de Categorias
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Tabela de Fornecedores
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE,
    name VARCHAR(200) NOT NULL,
    cnpj VARCHAR(20) UNIQUE,
    email VARCHAR(200),
    phone VARCHAR(20),
    contact_person VARCHAR(200),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(10),
    active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Tabela de Produtos
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id),
    category VARCHAR(100), -- Redundância para facilitar queries
    unit VARCHAR(20) DEFAULT 'UN',
    stock INTEGER DEFAULT 0 CHECK (stock >= 0),
    min_stock INTEGER DEFAULT 0 CHECK (min_stock >= 0),
    max_stock INTEGER,
    location VARCHAR(100),
    cost_price DECIMAL(10,2),
    supplier_id UUID REFERENCES suppliers(id),
    ncm VARCHAR(20),
    active BOOLEAN DEFAULT true,
    perishable BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Tabela de Itens Físicos (para controle individual)
CREATE TABLE IF NOT EXISTS physical_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    serial_number VARCHAR(100),
    status VARCHAR(20) DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'emprestado', 'manutencao', 'atrasado', 'descartado')),
    location VARCHAR(100),
    condition VARCHAR(20) DEFAULT 'bom' CHECK (condition IN ('perfeito', 'bom', 'desgaste', 'danificado', 'manutencao')),
    purchase_date DATE,
    warranty_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Tabela de Usuários (simplificada - integrar com Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(200) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    department VARCHAR(100),
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'operator', 'user')),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Tabela de Movimentações (entrada/saída de produtos)
CREATE TABLE IF NOT EXISTS movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(20) NOT NULL CHECK (type IN ('entrada', 'saida')),
    product_id UUID REFERENCES products(id),
    product_name VARCHAR(200) NOT NULL, -- Redundância para histórico
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2),
    document_number VARCHAR(50),
    supplier_id UUID REFERENCES suppliers(id),
    user_id UUID REFERENCES users(id),
    user_name VARCHAR(200), -- Redundância para histórico
    cost_center VARCHAR(100),
    reason TEXT,
    date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Tabela de Empréstimos (retirada/devolução de itens físicos)
CREATE TABLE IF NOT EXISTS loans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID REFERENCES physical_items(id),
    user_id UUID REFERENCES users(id),
    user_name VARCHAR(200) NOT NULL,
    loan_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    expected_return_date DATE NOT NULL,
    actual_return_date TIMESTAMP WITH TIME ZONE,
    location_use VARCHAR(100),
    purpose TEXT NOT NULL,
    condition_out VARCHAR(20),
    condition_in VARCHAR(20),
    notes_out TEXT,
    notes_in TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'returned', 'overdue')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Índices para melhor performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_code ON products(code);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_movements_date ON movements(date);
CREATE INDEX idx_movements_type ON movements(type);
CREATE INDEX idx_movements_product ON movements(product_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loans_item ON loans(item_id);
CREATE INDEX idx_loans_user ON loans(user_id);
CREATE INDEX idx_physical_items_status ON physical_items(status);

-- Triggers para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_physical_items_updated_at BEFORE UPDATE ON physical_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON loans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para atualizar estoque após movimentação
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.type = 'entrada' THEN
        UPDATE products 
        SET stock = stock + NEW.quantity 
        WHERE id = NEW.product_id;
    ELSIF NEW.type = 'saida' THEN
        UPDATE products 
        SET stock = stock - NEW.quantity 
        WHERE id = NEW.product_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_stock
AFTER INSERT ON movements
FOR EACH ROW
EXECUTE FUNCTION update_product_stock();

-- Função para atualizar status de empréstimos atrasados
CREATE OR REPLACE FUNCTION update_overdue_loans()
RETURNS void AS $$
BEGIN
    UPDATE loans
    SET status = 'overdue'
    WHERE status = 'active'
    AND expected_return_date < CURRENT_DATE
    AND actual_return_date IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Dados iniciais de exemplo
INSERT INTO categories (name, description, icon) VALUES
    ('Ferramentas', 'Ferramentas manuais e elétricas', 'bi-hammer'),
    ('Parafusos', 'Parafusos e fixadores', 'bi-nut'),
    ('Equipamentos', 'Equipamentos de grande porte', 'bi-gear'),
    ('Materiais Elétricos', 'Materiais para instalações elétricas', 'bi-lightning'),
    ('Consumíveis', 'Materiais de consumo', 'bi-droplet'),
    ('EPI', 'Equipamentos de Proteção Individual', 'bi-shield');

-- Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE physical_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança (ajustar conforme necessário)
-- Exemplo: permitir leitura para todos os usuários autenticados
CREATE POLICY "Enable read access for authenticated users" ON products
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON products
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON products
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Repetir políticas similares para outras tabelas conforme necessário

COMMENT ON TABLE products IS 'Tabela de produtos do almoxarifado';
COMMENT ON TABLE movements IS 'Registro de todas as movimentações de entrada e saída';
COMMENT ON TABLE physical_items IS 'Controle individual de itens físicos emprestáveis';
COMMENT ON TABLE loans IS 'Registro de empréstimos de itens físicos';