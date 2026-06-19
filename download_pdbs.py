#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para descargar todos los PDB files de RCSB
"""
import os
import requests
from pathlib import Path

# Crear directorio si no existe
pdb_dir = Path("public/pdb")
pdb_dir.mkdir(parents=True, exist_ok=True)

# Lista de todos los PDB IDs del juego
pdb_ids = [
    # SARS-CoV-2
    '6VXX',  # Spike
    '6LU7',  # Main protease
    '7BTF',  # RNA polymerase
    '6M3M',  # N protein

    # Influenza H1N1
    '1HGG',  # Hemagglutinin
    '1NSC',  # Neuraminidase
    '1RU7',  # Matrix protein

    # HIV-1
    '1DLO',  # Reverse transcriptase
    '3J34',  # Integrase
    '2F8D',  # Protease
    '2FPK',  # Envelope gp120

    # Dengue
    '1OAN',  # NS3 protease
    '3P22',  # NS5 methyltransferase
    '1R6R',  # Capsid protein

    # Measles
    '4UDE',  # Hemagglutinin
    '5EZV',  # Fusion protein

    # Ebola
    '3CSY',  # Glycoprotein
    '3CIW',  # Polymerase complex

    # Zika
    '5IRE',  # NS3 protease
    '5U04',  # NS5 methyltransferase
]

BASE_URL = "https://files.rcsb.org/download/"

print("Descargando {} estructuras PDB...".format(len(pdb_ids)))
print("Destino: {}\n".format(pdb_dir.absolute()))

success_count = 0
error_count = 0

for pdb_id in pdb_ids:
    pdb_file = pdb_dir / "{}.pdb".format(pdb_id.lower())

    if pdb_file.exists():
        print("[OK] {}: Ya existe localmente".format(pdb_id))
        success_count += 1
        continue

    url = "{}{}.pdb".format(BASE_URL, pdb_id.lower())

    try:
        print("[DOWNLOAD] {}: Descargando...".format(pdb_id), end=" ")
        response = requests.get(url, timeout=30)

        if response.status_code == 200:
            with open(pdb_file, 'w') as f:
                f.write(response.text)
            file_size = len(response.text)
            print("OK ({} bytes)".format(file_size))
            success_count += 1
        else:
            print("HTTP {}".format(response.status_code))
            error_count += 1
    except requests.RequestException as e:
        print("ERROR: {}".format(e))
        error_count += 1
    except Exception as e:
        print("ERROR: {}".format(e))
        error_count += 1

print("\n" + "="*60)
print("RESUMEN:")
print("   Exitosos: {}/{}".format(success_count, len(pdb_ids)))
print("   Errores: {}/{}".format(error_count, len(pdb_ids)))
print("   Directorio: {}".format(pdb_dir.absolute()))
print("="*60)
