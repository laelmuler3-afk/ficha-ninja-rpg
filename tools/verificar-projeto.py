#!/usr/bin/env python3
"""Verificações estáticas mínimas para a Ficha Ninja RPG."""
from __future__ import annotations

import hashlib
import json
import re
import subprocess
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
ERROS: list[str] = []
AVISOS: list[str] = []


def falhar(mensagem: str) -> None:
    ERROS.append(mensagem)


class ReferenciasHTML(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.referencias: list[str] = []

    def handle_starttag(self, _tag: str, attrs: list[tuple[str, str | None]]) -> None:
        dados = dict(attrs)
        for atributo in ("src", "href"):
            valor = dados.get(atributo)
            if valor:
                self.referencias.append(valor)


def verificar_javascript() -> None:
    for arquivo in sorted(ROOT.rglob("*.js")):
        processo = subprocess.run(
            ["node", "--check", str(arquivo)],
            text=True,
            capture_output=True,
            check=False,
        )
        if processo.returncode:
            falhar(f"JavaScript inválido: {arquivo.relative_to(ROOT)}\n{processo.stderr.strip()}")


def verificar_json() -> None:
    for arquivo in sorted(ROOT.rglob("*.json")):
        try:
            json.loads(arquivo.read_text(encoding="utf-8"))
        except Exception as erro:  # noqa: BLE001
            falhar(f"JSON inválido: {arquivo.relative_to(ROOT)} — {erro}")


def caminho_local(valor: str) -> Path | None:
    if valor.startswith(("#", "data:", "mailto:", "tel:")):
        return None
    partes = urlsplit(valor)
    if partes.scheme or partes.netloc:
        return None
    caminho = partes.path.lstrip("./")
    return ROOT / caminho if caminho else None


def verificar_referencias() -> None:
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    parser = ReferenciasHTML()
    parser.feed(html)
    for referencia in parser.referencias:
        arquivo = caminho_local(referencia)
        if arquivo and not arquivo.exists():
            falhar(f"Recurso referenciado no HTML não existe: {referencia}")

    sw = (ROOT / "service-worker.js").read_text(encoding="utf-8")
    for relativo in re.findall(r"`\./([^`?]+)\?v=\$\{APP_VERSION\}`", sw):
        if not (ROOT / relativo).exists():
            falhar(f"Recurso do APP_SHELL não existe: {relativo}")


def verificar_versoes() -> None:
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    sw = (ROOT / "service-worker.js").read_text(encoding="utf-8")
    versao_json = json.loads((ROOT / "version.json").read_text(encoding="utf-8"))["version"]
    html_match = re.search(r'data-app-version="([^"]+)"', html)
    sw_match = re.search(r'const APP_VERSION\s*=\s*"([^"]+)"', sw)
    versoes = {
        "index.html": html_match.group(1) if html_match else "",
        "service-worker.js": sw_match.group(1) if sw_match else "",
        "version.json": str(versao_json),
    }
    if len(set(versoes.values())) != 1 or not all(versoes.values()):
        falhar(f"Versões desalinhadas: {versoes}")


def verificar_dados() -> None:
    catalogo = json.loads((ROOT / "data/catalogo-jutsus.json").read_text(encoding="utf-8"))
    efeitos = json.loads((ROOT / "data/efeitos-jutsus.json").read_text(encoding="utf-8"))
    progressao = json.loads((ROOT / "data/progressao-ninja.json").read_text(encoding="utf-8"))

    jutsus = catalogo.get("jutsus", catalogo if isinstance(catalogo, list) else [])
    lista_efeitos = efeitos.get("jutsus", efeitos if isinstance(efeitos, list) else [])
    nomes_catalogo = [str(item.get("nome", "")).strip() for item in jutsus]
    nomes_efeitos = [str(item.get("nome", "")).strip() for item in lista_efeitos]

    if len(nomes_catalogo) != len(set(nomes_catalogo)):
        falhar("Há nomes de jutsus duplicados no catálogo.")
    if len(nomes_efeitos) != len(set(nomes_efeitos)):
        falhar("Há nomes de jutsus duplicados no arquivo de efeitos.")
    if set(nomes_catalogo) != set(nomes_efeitos):
        falhar("Catálogo de jutsus e arquivo de efeitos não estão em correspondência 1:1.")

    niveis = progressao.get("levels", [])
    numeros = sorted(int(item.get("level")) for item in niveis)
    if numeros != list(range(0, 21)):
        falhar(f"A progressão deveria conter os níveis 0 a 20 sem lacunas; encontrado: {numeros}")


def verificar_padroes_de_risco() -> None:
    for arquivo in sorted((ROOT / "js").glob("*.js")):
        texto = arquivo.read_text(encoding="utf-8", errors="ignore")
        if re.search(r'onclick=.*\$\{[^}]*escap', texto):
            falhar(f"Interpolação escapada em contexto JavaScript inline: {arquivo.relative_to(ROOT)}")


def verificar_duplicatas_exatas() -> None:
    grupos: dict[tuple[int, str], list[Path]] = {}
    for arquivo in ROOT.rglob("*"):
        if not arquivo.is_file() or ".git" in arquivo.parts:
            continue
        conteudo = arquivo.read_bytes()
        chave = (len(conteudo), hashlib.sha256(conteudo).hexdigest())
        grupos.setdefault(chave, []).append(arquivo)
    for arquivos in grupos.values():
        if len(arquivos) > 1:
            relativos = ", ".join(str(p.relative_to(ROOT)) for p in arquivos)
            AVISOS.append(f"Arquivos idênticos: {relativos}")


def main() -> int:
    verificar_javascript()
    verificar_json()
    verificar_referencias()
    verificar_versoes()
    verificar_dados()
    verificar_padroes_de_risco()
    verificar_duplicatas_exatas()

    for aviso in AVISOS:
        print(f"AVISO: {aviso}")
    if ERROS:
        for erro in ERROS:
            print(f"ERRO: {erro}", file=sys.stderr)
        print(f"\nFalha: {len(ERROS)} problema(s) encontrado(s).", file=sys.stderr)
        return 1
    print("Verificação concluída: JavaScript, JSON, recursos, versões e dados estão consistentes.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
