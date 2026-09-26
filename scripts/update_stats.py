"""
Met à jour data.json avec les stats live (GitHub) + stats manuelles (HTB, Root-Me).

- GitHub : API publique, aucune auth requise (60 req/h suffit largement)
- HTB    : si HTB_TOKEN est présent, on fetch l'API v4. Sinon on garde
           les valeurs déjà écrites dans data.json.
- Root-Me: pas d'API publique gratuite, on garde les valeurs manuelles.

Lancé par .github/workflows/update-stats.yml toutes les 6h et sur push.
"""

import json
import os
import sys
import urllib.request
import urllib.error
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_FILE = ROOT / "data.json"

GH_USER = "pepperhot"
HTB_USER_ID = 2773432  # pepperschool
ROOTME_USER = "pepperhot"


def fetch(url: str, headers: dict | None = None, timeout: int = 15):
    req = urllib.request.Request(url, headers=headers or {})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def load_existing() -> dict:
    if DATA_FILE.exists():
        try:
            return json.loads(DATA_FILE.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            pass
    return {}


def update_github(data: dict) -> None:
    headers = {"User-Agent": "portfolio-stats-updater", "Accept": "application/vnd.github+json"}
    token = os.environ.get("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"

    try:
        user = fetch(f"https://api.github.com/users/{GH_USER}", headers=headers)
        repos = fetch(f"https://api.github.com/users/{GH_USER}/repos?per_page=100&sort=updated", headers=headers)
    except Exception as e:
        print(f"[GitHub] fetch failed: {e}", file=sys.stderr)
        return

    langs: dict[str, int] = {}
    stars = 0
    for r in repos:
        if r.get("fork"):
            continue
        lang = r.get("language")
        if lang:
            langs[lang] = langs.get(lang, 0) + 1
        stars += r.get("stargazers_count", 0)

    top_langs = sorted(langs.items(), key=lambda kv: kv[1], reverse=True)[:6]

    latest = None
    if repos:
        first = repos[0]
        latest = {
            "name": first.get("name"),
            "url": first.get("html_url"),
            "description": first.get("description") or "",
            "updated": first.get("pushed_at"),
        }

    data["github"] = {
        "user": GH_USER,
        "url": f"https://github.com/{GH_USER}",
        "public_repos": user.get("public_repos", 0),
        "followers": user.get("followers", 0),
        "following": user.get("following", 0),
        "stars": stars,
        "languages": [{"name": n, "count": c} for n, c in top_langs],
        "latest": latest,
    }
    print(f"[GitHub] {data['github']['public_repos']} repos, {stars} stars, {len(top_langs)} langs")


def update_htb(data: dict) -> None:
    token = os.environ.get("HTB_TOKEN")
    if not token:
        print("[HTB] pas de HTB_TOKEN, on garde les stats existantes")
        return

    headers = {
        "Authorization": f"Bearer {token}",
        "User-Agent": "portfolio-stats-updater",
        "Accept": "application/json",
    }
    try:
        profile = fetch(f"https://labs.hackthebox.com/api/v4/user/profile/basic/{HTB_USER_ID}", headers=headers)
        progress = fetch(f"https://labs.hackthebox.com/api/v4/user/profile/progress/{HTB_USER_ID}", headers=headers)
    except Exception as e:
        print(f"[HTB] fetch failed: {e}", file=sys.stderr)
        return

    p = profile.get("profile", {})
    prog = progress.get("profile", {})

    data["htb"] = {
        "user": p.get("name", "pepperschool"),
        "url": f"https://app.hackthebox.com/users/{HTB_USER_ID}",
        "user_id": HTB_USER_ID,
        "rank": p.get("rank", data.get("htb", {}).get("rank")),
        "rank_text": p.get("rank_text"),
        "level": prog.get("current_rank_progress", data.get("htb", {}).get("level")),
        "country": p.get("country_name", "France"),
        "points": p.get("points", 0),
        "user_owns": p.get("user_owns", 0),
        "system_owns": p.get("system_owns", 0),
        "respects": p.get("respects", 0),
        "team": (p.get("team") or {}).get("name"),
    }
    print(f"[HTB] rank={data['htb']['rank']} owns={data['htb']['user_owns']}u/{data['htb']['system_owns']}s")


def update_rootme(data: dict) -> None:
    # Root-Me n'expose pas d'API gratuite pour un profil public.
    # On garde les valeurs manuelles déjà présentes dans data.json ;
    # on ne touche qu'aux champs manquants pour ne pas écraser les stats.
    existing = data.get("rootme", {})
    existing.setdefault("user", ROOTME_USER)
    existing.setdefault("url", f"https://www.root-me.org/{ROOTME_USER}")
    existing.setdefault("note", "Mise à jour manuelle — pas d'API publique.")
    data["rootme"] = existing


def main() -> int:
    data = load_existing()
    update_github(data)
    update_htb(data)
    update_rootme(data)
    data["updated_at"] = datetime.now(timezone.utc).isoformat(timespec="seconds")

    DATA_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"[OK] {DATA_FILE.name} écrit ({DATA_FILE.stat().st_size} octets)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
