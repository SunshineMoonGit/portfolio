"""
vault/notes/*.md → vault/public/notes/*.md
frontmatter 변환: description → summary, slug/category/date 추가
"""
import os
import re
import shutil
from pathlib import Path

VAULT_DIR = Path(__file__).parent.parent / "vault"
SRC_DIR = VAULT_DIR / "notes"
DST_DIR = VAULT_DIR / "public" / "notes"

# 태그 기반 카테고리 매핑 (첫 번째 매칭 사용)
TAG_TO_CATEGORY = {
    "python": "backend",
    "데이터베이스": "backend",
    "git": "git",
    "rebase": "git",
    "worktree": "git",
    "보안": "security",
    "인증": "security",
    "SSO": "security",
    "Keycloak": "security",
    "쿠키": "security",
    "아키텍처": "architecture",
    "네트워크": "network",
    "DNS": "network",
    "프록시": "network",
    "CORS": "network",
    "프로토콜": "network",
    "upstream": "network",
    "downstream": "network",
    "hop": "network",
    "인프라": "infra",
    "nginx": "infra",
    "dns": "infra",
    "ssl": "infra",
    "docker": "infra",
    "서버": "infra",
    "개발환경": "devops",
    "테스트": "devops",
}

DEFAULT_DATE = "2026-04-04"


def filename_to_slug(filename: str) -> str:
    stem = Path(filename).stem
    slug = stem.lower()
    slug = re.sub(r"[^a-z0-9가-힣\-]", "-", slug)
    slug = re.sub(r"-+", "-", slug).strip("-")
    return slug


def infer_category(tags: list[str]) -> str:
    for tag in tags:
        if tag in TAG_TO_CATEGORY:
            return TAG_TO_CATEGORY[tag]
    return "general"


def parse_frontmatter(text: str):
    """Return (meta_dict, body) or (None, text) if no frontmatter."""
    if not text.startswith("---"):
        return {}, text

    end = text.find("---", 3)
    if end == -1:
        return {}, text

    raw = text[3:end].strip()
    body = text[end + 3:].lstrip("\n")

    meta = {}
    for line in raw.splitlines():
        if ":" in line:
            key, _, val = line.partition(":")
            key = key.strip()
            val = val.strip()
            if val.startswith("[") and val.endswith("]"):
                items = [v.strip().strip('"') for v in val[1:-1].split(",") if v.strip()]
                meta[key] = items
            else:
                meta[key] = val.strip('"')
    return meta, body


def build_frontmatter(meta: dict) -> str:
    lines = ["---"]
    for key, val in meta.items():
        if isinstance(val, list):
            items = ", ".join(f'"{v}"' for v in val)
            lines.append(f"{key}: [{items}]")
        else:
            lines.append(f'{key}: "{val}"')
    lines.append("---")
    return "\n".join(lines)


def migrate_file(src: Path, dst_dir: Path):
    text = src.read_text(encoding="utf-8")
    meta, body = parse_frontmatter(text)

    slug = filename_to_slug(src.name)
    tags = meta.get("tags", [])
    if isinstance(tags, str):
        tags = [tags]

    new_meta = {
        "title": meta.get("title", slug),
        "slug": slug,
        "category": infer_category(tags),
        "tags": tags,
        "summary": meta.get("description", meta.get("summary", "")),
        "date": meta.get("date", DEFAULT_DATE),
    }

    new_text = build_frontmatter(new_meta) + "\n\n" + body
    dst = dst_dir / src.name
    dst.write_text(new_text, encoding="utf-8")
    return slug, new_meta["category"]


def main():
    DST_DIR.mkdir(parents=True, exist_ok=True)

    migrated = []
    for src in sorted(SRC_DIR.glob("*.md")):
        if src.name.startswith("_"):
            print(f"skip  {src.name}")
            continue
        slug, category = migrate_file(src, DST_DIR)
        migrated.append((src.name, slug, category))
        print(f"ok    {src.name} → slug={slug}, category={category}")

    print(f"\n총 {len(migrated)}개 파일 마이그레이션 완료")
    print(f"출력 경로: {DST_DIR}")


if __name__ == "__main__":
    main()
