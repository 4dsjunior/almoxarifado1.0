#!/usr/bin/env python
"""
Script para rodar o ambiente de desenvolvimento com Flask e Vite integrados.
Este script resolve problemas de CORS e garante que os assets sejam servidos corretamente.
"""

import os
import sys
import subprocess
import time
import signal
from threading import Thread

def run_flask():
    """Roda o servidor Flask"""
    print("🚀 Iniciando servidor Flask...")
    os.environ['FLASK_ENV'] = 'development'
    os.environ['FLASK_DEBUG'] = '1'
    subprocess.run([sys.executable, 'app.py'])

def run_vite():
    """Roda o servidor Vite"""
    print("⚡ Iniciando servidor Vite...")
    subprocess.run(['npm', 'run', 'dev'], shell=True)

def signal_handler(sig, frame):
    """Trata o sinal de interrupção (Ctrl+C)"""
    print('\n👋 Encerrando servidores...')
    sys.exit(0)

def main():
    """Função principal"""
    print("Sistema de Almoxarifado - Modo Desenvolvimento")
    print("=" * 50)
    
    # Verifica se as dependências estão instaladas
    try:
        import flask
        import dotenv
    except ImportError:
        print("❌ Erro: Dependências Python não instaladas.")
        print("   Execute: pip install -r requirements.txt")
        sys.exit(1)
    
    # Verifica se o node_modules existe
    if not os.path.exists('node_modules'):
        print("❌ Erro: Dependências Node.js não instaladas.")
        print("   Execute: npm install")
        sys.exit(1)
    
    # Registra o handler para Ctrl+C
    signal.signal(signal.SIGINT, signal_handler)
    
    # Cria threads para rodar Flask e Vite
    flask_thread = Thread(target=run_flask)
    vite_thread = Thread(target=run_vite)
    
    # Inicia as threads
    flask_thread.start()
    time.sleep(2)  # Aguarda Flask iniciar
    vite_thread.start()
    
    print("Servidores iniciados!")
    print("📌 Flask: http://localhost:5000")
    print("📌 Vite: http://localhost:5173")
    print("\nAcesse: http://localhost:5000")
    print("   (Pressione Ctrl+C para parar)")
    
    # Mantém o script rodando
    try:
        flask_thread.join()
        vite_thread.join()
    except KeyboardInterrupt:
        pass

if __name__ == '__main__':
    main()
