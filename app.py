import os
from flask import Flask, render_template, jsonify, request, url_for
import json
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder='static/dist', static_url_path='/static/dist')

# Supabase Configuration
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Helper to read Vite's manifest file.
def get_vite_assets():
    assets = {}
    manifest_path = os.path.join(app.static_folder, '.vite', 'manifest.json')
    if not os.path.exists(manifest_path):
        print("manifest.json not found. Run 'npm run build'.")
        return {}
        
    with open(manifest_path, 'r') as f:
        manifest = json.load(f)
        
    assets = {
        key: url_for('static', filename=value['file'])
        for key, value in manifest.items() if 'file' in value
    }
    return assets

@app.context_processor
def inject_vite_assets():
    """Injects Vite assets into all templates."""
    return {'vite_assets': get_vite_assets()}


@app.route('/api/login', methods=['POST'])
def handle_login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    try:
        response = supabase.auth.sign_in_with_password({"email": email, "password": password})
        
        if response.user:
            # Store the access token in an HttpOnly cookie
            resp = jsonify({"message": "Login successful", "user": response.user.model_dump()})
            resp.set_cookie('access_token', response.session.access_token, httponly=True, secure=True, samesite='Lax')
            return resp, 200
        else:
            return jsonify({"message": "Invalid credentials"}), 401
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({"message": "An error occurred during login"}), 500

@app.route('/api/logout', methods=['POST'])
def handle_logout():
    try:
        # Invalidate the session on the Supabase side
        supabase.auth.sign_out()
        
        # Clear the HttpOnly cookie
        resp = jsonify({"message": "Logout successful"})
        resp.set_cookie('access_token', '', expires=0, httponly=True, secure=True, samesite='Lax')
        return resp, 200
    except Exception as e:
        print(f"Logout error: {e}")
        return jsonify({"message": "An error occurred during logout"}), 500


from functools import wraps

# Decorator for protected routes
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        access_token = request.cookies.get('access_token')
        if not access_token:
            return jsonify({"message": "Authentication required"}), 401
        try:
            # Set the session for the current request
            supabase.auth.set_session(access_token)
            return f(*args, **kwargs)
        except Exception as e:
            print(f"Authentication error: {e}")
            return jsonify({"message": "Invalid or expired token"}), 401
    return decorated_function


# --- HTML Routes ---

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/produtos')
def produtos():
    return render_template('produtos.html')

@app.route('/movimentacoes')
def movimentacoes():
    return render_template('movimentacoes.html')

# Add other HTML routes as needed...
@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/itens-fisicos')
def itens_fisicos():
    return render_template('itens-fisicos.html')

@app.route('/retiradas')
def retiradas():
    return render_template('retirada-nova.html')

@app.route('/devolucoes')
def devolucoes():
    return render_template('devolucao-nova.html')

@app.route('/categorias')
def categorias():
    return render_template('categorias.html')

@app.route('/fornecedores')
def fornecedores():
    return render_template('fornecedores.html')

@app.route('/relatorios')
def relatorios():
    return render_template('relatorios.html')

@app.route('/configuracoes')
def configuracoes():
    return render_template('configuracoes.html')

@app.route('/produto-novo')
def produto_novo():
    return render_template('produto-novo.html')

@app.route('/item-detalhes')
def item_detalhes():
    return render_template('item-detalhes.html')


# --- API Routes ---

@app.route('/api/products', methods=['GET'])
@login_required
def get_products():
    search = request.args.get('search', '').lower()
    category = request.args.get('category', '')
    status = request.args.get('status', '')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    try:
        query = supabase.table('products').select('*', count='exact')

        if search:
            query = query.ilike('name', f'%{search}%')

        if category:
            query = query.eq('category', category)

        # TODO: Implement status filtering based on stock and minStock
        # This would require a more complex query or a view in Supabase

        # Pagination
        offset = (page - 1) * per_page
        limit = per_page
        
        response = query.range(offset, offset + limit - 1).execute()
        
        products = response.data
        total_count = response.count

        return jsonify({
            'products': products,
            'total': total_count,
            'page': page,
            'per_page': per_page
        })
    except Exception as e:
        print(f"Error fetching products: {e}")
        return jsonify({"error": "Failed to fetch products"}), 500

@app.route('/api/products/<string:product_id>', methods=['DELETE'])
@login_required
def delete_product(product_id):
    try:
        response = supabase.table('products').delete().eq('id', product_id).execute()
        if response.data:
            return jsonify({"message": "Product deleted"}), 200
        else:
            return jsonify({"error": "Product not found"}), 404
    except Exception as e:
        print(f"Error deleting product: {e}")
        return jsonify({"error": "Failed to delete product"}), 500

@app.route('/api/movements', methods=['GET'])
@login_required
def get_movements():
    product_name = request.args.get('product', '').lower()

    try:
        query = supabase.table('movements').select('*', count='exact')

        if product_name:
            query = query.ilike('productName', f'%{product_name}%')

        # TODO: Add other filters (type, start_date, end_date)

        response = query.execute()
        movements = response.data
        total_count = response.count

        return jsonify({
            'movements': movements,
            'total': total_count
        })
    except Exception as e:
        print(f"Error fetching movements: {e}")
        return jsonify({"error": "Failed to fetch movements"}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)