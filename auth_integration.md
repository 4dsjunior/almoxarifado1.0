# 🔐 Integração com Supabase Auth

## Configuração do Supabase Auth

### 1. **No Painel do Supabase**

1. Acesse **Authentication** > **Providers**
2. Habilite **Email** como provider
3. Configure as URLs de redirecionamento:
   ```
   Site URL: http://localhost:5000
   Redirect URLs: http://localhost:5000/auth/callback
   ```

### 2. **Criar Trigger para Sincronizar Usuários**

Execute no SQL Editor do Supabase:

```sql
-- Função para criar usuário na tabela users quando alguém se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para executar a função quando um novo usuário é criado
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar usuário quando o perfil é modificado
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS trigger AS $$
BEGIN
  UPDATE public.users
  SET 
    email = NEW.email,
    name = COALESCE(NEW.raw_user_meta_data->>'full_name', name),
    updated_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar usuário
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE OF email, raw_user_meta_data ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();
```

### 3. **Políticas RLS Atualizadas**

```sql
-- Permitir que usuários vejam seus próprios dados
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Admins podem ver todos os usuários
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Produtos - todos autenticados podem ver
CREATE POLICY "Authenticated users can view products" ON products
  FOR SELECT USING (auth.role() = 'authenticated');

-- Produtos - apenas admin e manager podem inserir/atualizar
CREATE POLICY "Admin and managers can insert products" ON products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admin and managers can update products" ON products
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  );

-- Movimentações - todos podem ver suas próprias
CREATE POLICY "Users can view own movements" ON movements
  FOR SELECT USING (user_id = auth.uid());

-- Movimentações - operadores podem criar
CREATE POLICY "Operators can create movements" ON movements
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager', 'operator')
    )
  );
```

### 4. **Criar Usuário Admin Inicial**

```sql
-- Depois de criar sua conta pelo sistema, execute isto para torná-la admin:
UPDATE users 
SET role = 'admin' 
WHERE email = 'seu-email@exemplo.com';
```

## 📝 Fluxo de Autenticação

### 1. **Login**
```python
# Já implementado em app.py
@app.route('/api/login', methods=['POST'])
def handle_login():
    # Usa Supabase Auth
    response = supabase.auth.sign_in_with_password({
        "email": email, 
        "password": password
    })
```

### 2. **Registro de Novo Usuário**
```python
# Adicionar em app.py
@app.route('/api/register', methods=['POST'])
def handle_register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    full_name = data.get('full_name')

    try:
        response = supabase.auth.sign_up({
            "email": email,
            "password": password,
            "options": {
                "data": {
                    "full_name": full_name
                }
            }
        })
        
        if response.user:
            return jsonify({
                "message": "Registro realizado! Verifique seu email.",
                "user": response.user.model_dump()
            }), 201
        else:
            return jsonify({"message": "Erro no registro"}), 400
            
    except Exception as e:
        print(f"Register error: {e}")
        return jsonify({"message": str(e)}), 500
```

### 3. **Recuperação de Senha**
```python
# Adicionar em app.py
@app.route('/api/forgot-password', methods=['POST'])
def handle_forgot_password():
    data = request.get_json()
    email = data.get('email')

    try:
        response = supabase.auth.reset_password_email(
            email,
            {
                "redirect_to": "http://localhost:5000/reset-password"
            }
        )
        
        return jsonify({
            "message": "Email de recuperação enviado!"
        }), 200
        
    except Exception as e:
        print(f"Password reset error: {e}")
        return jsonify({"message": str(e)}), 500
```

### 4. **Middleware de Autenticação Melhorado**
```python
# Melhorar o decorator em app.py
def login_required(allowed_roles=None):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            access_token = request.cookies.get('access_token')
            if not access_token:
                return jsonify({"message": "Authentication required"}), 401
                
            try:
                # Verificar o token
                user = supabase.auth.get_user(access_token)
                if not user:
                    return jsonify({"message": "Invalid token"}), 401
                
                # Verificar roles se especificado
                if allowed_roles:
                    user_data = supabase.table('users').select('role').eq('id', user.id).single().execute()
                    if user_data.data['role'] not in allowed_roles:
                        return jsonify({"message": "Insufficient permissions"}), 403
                
                # Adicionar user ao request
                request.current_user = user
                return f(*args, **kwargs)
                
            except Exception as e:
                print(f"Auth error: {e}")
                return jsonify({"message": "Authentication failed"}), 401
                
        return decorated_function
    return decorator

# Uso:
@app.route('/api/admin/users')
@login_required(allowed_roles=['admin'])
def admin_users():
    # Apenas admins podem acessar
    pass
```

## 🔑 Variáveis de Ambiente Completas

```env
# .env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-chave-anon-publica
SUPABASE_SERVICE_KEY=sua-chave-service (apenas para operações admin)
FLASK_SECRET_KEY=uma-chave-secreta-aleatoria
FLASK_ENV=development
```

## 🎯 Testando a Autenticação

1. **Criar conta de teste**:
   - Acesse http://localhost:5000/login
   - Clique em "Criar conta"
   - Use um email válido

2. **Verificar email** (desenvolvimento):
   - No Supabase Dashboard > Auth > Users
   - Veja os emails enviados em "Email Logs"

3. **Fazer login**:
   - Use as credenciais criadas
   - Verifique se o cookie foi definido

4. **Testar permissões**:
   - Tente acessar diferentes rotas
   - Verifique se as restrições funcionam

---

**Sistema de autenticação completo e integrado!** 🔐