#!/usr/bin/env python
"""
Script de verificação para garantir que o sistema está configurado corretamente.
Execute: python test_checklist.py
"""

import os
import sys
import json
from colorama import init, Fore, Style

# Inicializa colorama para Windows
init()

def print_header(text):
    print(f"\n{Fore.CYAN}{'='*60}{Style.RESET_ALL}")
    print(f"{Fore.CYAN}{text}{Style.RESET_ALL}")
    print(f"{Fore.CYAN}{'='*60}{Style.RESET_ALL}")

def print_success(text):
    print(f"{Fore.GREEN}✓ {text}{Style.RESET_ALL}")

def print_error(text):
    print(f"{Fore.RED}✗ {text}{Style.RESET_ALL}")

def print_warning(text):
    print(f"{Fore.YELLOW}⚠ {text}{Style.RESET_ALL}")

def print_info(text):
    print(f"{Fore.BLUE}ℹ {text}{Style.RESET_ALL}")

def check_python_version():
    """Verifica a versão do Python"""
    version = sys.version_info
    if version.major >= 3 and version.minor >= 8:
        print_success(f"Python {version.major}.{version.minor}.{version.micro}")
        return True
    else:
        print_error(f"Python {version.major}.{version.minor}.{version.micro} - Requer 3.8+")
        return False

def check_file_exists(filepath, description):
    """Verifica se um arquivo existe"""
    if os.path.exists(filepath):
        print_success(f"{description}: {filepath}")
        return True
    else:
        print_error(f"{description} não encontrado: {filepath}")
        return False

def check_python_dependencies():
    """Verifica dependências Python"""
    dependencies = {
        'flask': 'Flask',
        'supabase': 'Supabase Client',
        'dotenv': 'Python-dotenv'
    }
    
    all_ok = True
    for module, name in dependencies.items():
        try:
            __import__(module)
            print_success(f"{name} instalado")
        except ImportError:
            print_error(f"{name} não instalado - execute: pip install {module}")
            all_ok = False
    
    return all_ok

def check_node_modules():
    """Verifica se node_modules existe"""
    if os.path.exists('node_modules'):
        print_success("node_modules encontrado")
        
        # Verifica package.json
        if os.path.exists('package.json'):
            with open('package.json', 'r') as f:
                package = json.load(f)
                deps = package.get('dependencies', {})
                dev_deps = package.get('devDependencies', {})
                
                print_info(f"  Dependências: {', '.join(deps.keys())}")
                print_info(f"  Dev deps: {', '.join(dev_deps.keys())}")
        return True
    else:
        print_error("node_modules não encontrado - execute: npm install")
        return False

def check_env_file():
    """Verifica arquivo .env"""
    if os.path.exists('.env'):
        print_success(".env encontrado")
        
        # Verifica variáveis essenciais
        from dotenv import load_dotenv
        load_dotenv()
        
        supabase_url = os.getenv('SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_KEY')
        
        if supabase_url and supabase_key:
            print_success("  SUPABASE_URL configurado")
            print_success("  SUPABASE_KEY configurado")
            return True
        else:
            if not supabase_url:
                print_error("  SUPABASE_URL não configurado")
            if not supabase_key:
                print_error("  SUPABASE_KEY não configurado")
            return False
    else:
        print_error(".env não encontrado - copie .env.example e configure")
        return False

def check_static_files():
    """Verifica arquivos estáticos"""
    files_to_check = [
        ('static/css/style.css', 'CSS principal'),
        ('static/js/main.js', 'JavaScript principal'),
        ('static/js/api.js', 'API module'),
        ('static/js/ui-utils.js', 'UI utilities'),
        ('static/js/produtos.js', 'Produtos module'),
        ('static/js/movimentacoes.js', 'Movimentações module')
    ]
    
    all_ok = True
    for filepath, description in files_to_check:
        if not check_file_exists(filepath, description):
            all_ok = False
    
    return all_ok

def check_templates():
    """Verifica templates principais"""
    templates = [
        'templates/layout.html',
        'templates/login_layout.html',
        'templates/login.html',
        'templates/index.html',
        'templates/produtos.html'
    ]
    
    all_ok = True
    for template in templates:
        if os.path.exists(template):
            print_success(f"Template: {template}")
        else:
            print_error(f"Template não encontrado: {template}")
            all_ok = False
    
    return all_ok

def check_vite_build():
    """Verifica se o build do Vite existe"""
    if os.path.exists('static/dist/manifest.json'):
        print_success("Build de produção encontrado (manifest.json)")
        return True
    else:
        print_warning("Build de produção não encontrado - OK para desenvolvimento")
        print_info("  Para produção, execute: npm run build")
        return True  # Não é erro em desenvolvimento

def run_all_checks():
    """Executa todas as verificações"""
    print_header("VERIFICAÇÃO DO SISTEMA DE ALMOXARIFADO")
    
    checks = [
        ("Python", check_python_version),
        ("Dependências Python", check_python_dependencies),
        ("Node Modules", check_node_modules),
        ("Arquivo .env", check_env_file),
        ("Arquivos Estáticos", check_static_files),
        ("Templates", check_templates),
        ("Vite Build", check_vite_build),
        ("Arquivos Principais", lambda: all([
            check_file_exists('app.py', 'Flask app'),
            check_file_exists('vite.config.js', 'Vite config'),
            check_file_exists('package.json', 'Package.json'),
            check_file_exists('requirements.txt', 'Requirements')
        ]))
    ]
    
    results = []
    for name, check_func in checks:
        print(f"\n{Fore.YELLOW}Verificando {name}...{Style.RESET_ALL}")
        results.append(check_func())
    
    # Resumo
    print_header("RESUMO DA VERIFICAÇÃO")
    
    total_checks = len(results)
    passed_checks = sum(results)
    
    if passed_checks == total_checks:
        print_success(f"Todas as verificações passaram! ({passed_checks}/{total_checks})")
        print_info("\nPróximos passos:")
        print_info("1. Execute: python run_dev.py")
        print_info("2. Acesse: http://localhost:5000")
        print_info("3. Configure o Supabase com o script SQL fornecido")
    else:
        print_error(f"Algumas verificações falharam ({passed_checks}/{total_checks})")
        print_info("\nCorreija os problemas acima antes de continuar.")
    
    # Dicas extras
    print(f"\n{Fore.CYAN}DICAS:{Style.RESET_ALL}")
    print_info("• Use 'python run_dev.py' para desenvolvimento integrado")
    print_info("• Use 'npm run build' antes de fazer deploy")
    print_info("• Verifique o console do navegador para erros JS")
    print_info("• O manifest.json só é necessário em produção")

if __name__ == '__main__':
    try:
        run_all_checks()
    except Exception as e:
        print_error(f"Erro durante verificação: {e}")
        print_info("Instale colorama: pip install colorama")