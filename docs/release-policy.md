# Release-Richtlinie (Tester-Phase)

- **GitHub:** Commits auf `main` – Tester installieren vom Repo (GitHub / npm `github:`).
- **npm:** Nur wenn ein Zwischenstand **stabil** getestet ist – dann gezielt Version taggen (`v*`) und CI-Deploy auslösen.
- **CI (`test-and-release.yml`):** Jeder Push auf `main` führt Lint, Typecheck und Adapter-Tests aus (Linux + Windows). Deploy nach npm **nur** bei Git-Tag `v*`, nicht bei normalen Commits.
- **`common.news`:** Max. **7** Einträge; nur die **aktuelle** Version plus bereits auf **npm** veröffentlichte Versionen (E2004). GitHub-only Versionen gehören in [README.md](../README.md#changelog) / [CHANGELOG_OLD.md](../CHANGELOG_OLD.md), nicht in `io-package.json`.
