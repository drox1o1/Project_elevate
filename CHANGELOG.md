# Changelog

All notable changes to DUKU Labs are recorded here. The current state is also
shown on the site at [/open-source](https://labs.duku.design/open-source).

## Open source — 2026-07

DUKU Labs is now **MIT-licensed and fully open source**.

### Added
- `LICENSE` (MIT) and open-source metadata in `package.json` (`private: false`,
  `license`, `author`, `repository`, `keywords`).
- A new `/open-source` page documenting the license, what it lets you do, the
  identify step and this changelog.
- An **identify step** before the MCP connection and component install commands
  are revealed: visitors provide their email, company and role (owner, designer,
  developer, …). Captured via `IdentifyGate` and `POST /api/leads`, and stored
  in `localStorage` so it's asked once per device.

### Changed
- **Removed the Pro/Team paywall.** The registry endpoint (`/r/[name]`) and the
  MCP server (`/mcp`) now serve every component's full source openly — no
  `DUKU_LICENSE_KEYS`, no `Authorization: Bearer` license key, no gated source.
- `/api/leads` now captures `email`, `company` and `role` (validated), plus an
  optional `intent` recording which action triggered the gate.
- `/pricing` now permanently redirects to `/open-source`; the paid pricing tiers
  were removed.
- Site copy (hero, footer, connect, access form) updated from "free while in
  beta" / Pro-tier framing to open-source / MIT framing.

### Notes
- The `tier` field on registry items is retained only as an informational label;
  it no longer restricts access to source.
