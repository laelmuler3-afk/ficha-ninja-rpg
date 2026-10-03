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

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        nomes = [nome.lower() for nome, _valor in attrs]
        duplicados = sorted({nome for nome in nomes if nomes.count(nome) > 1})
        if duplicados:
            falhar(f"HTML inválido: <{tag}> possui atributo(s) duplicado(s): {', '.join(duplicados)}")

        for atributo, valor in attrs:
            if atributo.lower() in ("src", "href") and valor:
                if "<" in valor or ">" in valor or '"' in valor:
                    falhar(f"HTML inválido: valor suspeito em {atributo} de <{tag}>: {valor}")
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
    for numero, linha in enumerate(html.splitlines(), start=1):
        if '<link rel="stylesheet"' in linha and not re.search(r'href="[^"]+"\s*/?>\s*$', linha.strip()):
            falhar(f"HTML inválido: tag de stylesheet malformada na linha {numero}: {linha.strip()}")
    parser = ReferenciasHTML()
    parser.feed(html)
    for referencia in parser.referencias:
        arquivo = caminho_local(referencia)
        if arquivo and not arquivo.exists():
            falhar(f"Recurso referenciado no HTML não existe: {referencia}")

    sw = (ROOT / "service-worker.js").read_text(encoding="utf-8")
    for relativo in re.findall(r"`\./([^`?]+)\?v=\$\{APP_VERSION\}`", sw):
        if relativo.startswith("${JS_ROOT}/"):
            nome = relativo.split("/", 1)[1]
            for pasta in ("js", "js-legacy"):
                if not (ROOT / pasta / nome).exists():
                    falhar(f"Recurso do APP_SHELL não existe: {pasta}/{nome}")
            continue
        if relativo == "${QR_LOCAL_PATH}":
            for nome in ("vendor/qrcode-local.js", "vendor/qrcode-local-legacy.js"):
                if not (ROOT / nome).exists():
                    falhar(f"Recurso do APP_SHELL não existe: {nome}")
            continue
        if not (ROOT / relativo).exists():
            falhar(f"Recurso do APP_SHELL não existe: {relativo}")


def verificar_versoes() -> None:
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    sw = (ROOT / "service-worker.js").read_text(encoding="utf-8")
    versao_json = json.loads((ROOT / "version.json").read_text(encoding="utf-8"))["version"]
    html_match = re.search(r'data-app-version="([^"]+)"', html)
    sw_match = re.search(r'const APP_VERSION\s*=\s*"([^"]+)"', sw)
    sw_legacy_path = ROOT / "service-worker-legacy.js"
    sw_legacy = sw_legacy_path.read_text(encoding="utf-8") if sw_legacy_path.exists() else ""
    sw_legacy_match = re.search(r'(?:const|var) APP_VERSION\s*=\s*"([^"]+)"', sw_legacy)
    versoes = {
        "index.html": html_match.group(1) if html_match else "",
        "service-worker.js": sw_match.group(1) if sw_match else "",
        "service-worker-legacy.js": sw_legacy_match.group(1) if sw_legacy_match else "",
        "version.json": str(versao_json),
    }
    if len(set(versoes.values())) != 1 or not all(versoes.values()):
        falhar(f"Versões desalinhadas: {versoes}")



def verificar_build_legado() -> None:
    manifest_path = ROOT / "js-legacy" / "manifest.json"
    if not manifest_path.exists():
        falhar("Build legado ausente: js-legacy/manifest.json")
        return
    try:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    except Exception as erro:  # noqa: BLE001
        falhar(f"Manifesto do build legado inválido — {erro}")
        return

    versao = str(json.loads((ROOT / "version.json").read_text(encoding="utf-8")).get("version", ""))
    if str(manifest.get("version", "")) != versao:
        falhar(f"Build legado está em versão diferente: {manifest.get('version')} != {versao}")

    fontes = manifest.get("sources", {}) if isinstance(manifest.get("sources"), dict) else {}
    esperadas = {f"js/{arquivo.name}" for arquivo in (ROOT / "js").glob("*.js")}
    esperadas.update({"vendor/qrcode-local.js", "service-worker.js"})
    faltantes = sorted(esperadas - set(fontes))
    extras = sorted(set(fontes) - esperadas)
    if faltantes:
        falhar("Build legado não cobre: " + ", ".join(faltantes))
    if extras:
        falhar("Manifesto legado contém fontes inesperadas: " + ", ".join(extras))

    for relativo, registro in fontes.items():
        src = ROOT / relativo
        if relativo.startswith("js/"):
            out = ROOT / "js-legacy" / Path(relativo).name
        elif relativo == "vendor/qrcode-local.js":
            out = ROOT / "vendor/qrcode-local-legacy.js"
        elif relativo == "service-worker.js":
            out = ROOT / "service-worker-legacy.js"
        else:
            continue
        if not src.exists() or not out.exists():
            falhar(f"Par fonte/build legado ausente: {relativo}")
            continue
        src_hash = hashlib.sha256(src.read_bytes()).hexdigest()
        out_hash = hashlib.sha256(out.read_bytes()).hexdigest()
        if src_hash != str(registro.get("sourceSha256", "")):
            falhar(f"Build legado desatualizado para {relativo}; rode npm run build:legacy")
        if out_hash != str(registro.get("outputSha256", "")):
            falhar(f"Saída legado alterada sem rebuild: {out.relative_to(ROOT)}")

        texto = out.read_text(encoding="utf-8", errors="ignore")
        if "?." in texto or "??" in texto:
            falhar(f"Sintaxe moderna residual no build legado: {out.relative_to(ROOT)}")

    polyfills = ROOT / "js-legacy" / "00-polyfills.js"
    if not polyfills.exists():
        falhar("Polyfills do modo legado ausentes: js-legacy/00-polyfills.js")

    html = (ROOT / "index.html").read_text(encoding="utf-8")
    if "SHINOBI_LEGACY_MODE" not in html or "js-legacy/00-polyfills.js" not in html:
        falhar("index.html não contém o seletor automático do build legado.")
    if "css/legacy-compat.css" not in html:
        falhar("index.html não carrega os fallbacks visuais legados.")

    sw_legacy = ROOT / "service-worker-legacy.js"
    if sw_legacy.exists():
        match = re.search(r'APP_VERSION\s*=\s*["\']([^"\']+)["\']', sw_legacy.read_text(encoding="utf-8", errors="ignore"))
        if not match or match.group(1) != versao:
            falhar("service-worker-legacy.js está com versão desalinhada.")

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
    verificar_build_legado()
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
