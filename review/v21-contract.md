# v21 — orchestrator contract

Board-only; original app files and v17/v18/v19/v20 artifacts stay untouched. No commits, pushes, dependencies, new features, research, or agents from subagents. Owner requests all screens considered and visibly better, not generic restyling or a stack of empty wrappers.

## Baseline and shell
- Build from v19 (which contains v17 library and root-feed work), NOT v20 layered overrides.
- Main owns the only screen layout normalizer: status/header, bounded scroll viewport, footer/native navigation. Domain passes run AFTER normalization.
- Ordinary screen exposes `scr.querySelector('.v21-body')`: the existing content scroll viewport. It may contain original `.pad.col` containers, but these have their inherited absolute position/paddingTop cleared by main.
- `scr.querySelector('.v21-header')` and `.v21-footer` must NEVER be moved, restyled or resized by domain passes. No `.status`, `.tb`, `.pinned` CSS.
- Main preserves camera/immersive/native preview geometry; screens with `data-v21-mode="preserve"` receive only specifically safe changes. Do not change canvas, SVG chart, drawing-kit, picker/control geometry.
- Need full-bleed photography: preserve existing `.t-cover`, `.t-band`, `.ph-img` layers and contextual whitespace. Do not round an entire background band or create duplicate headers.

## Domain API
Each file registers `window.__V21Passes.push({id:'money|body|personal|shell', keys:[...all assigned keys], reviewed:{key:'specific decision per key'}, apply:function(sc,scr){ return {changes:[],retained:[],reviewed:true}; }});`.
- Real data and original text matter: preserve all fields, amounts, images, safety/source copy, buttons, data attributes, native input IDs and listeners.
- MOVE nodes or adjust classes/styles. Do not use `innerHTML` replacement on existing content; authored small visible section labels can be appended. Avoid duplicating records/statuses.
- Wrapper alone is not a design improvement. Make content priority, spacing, purpose and visual grouping actually better. Prefer fewer boxes, generous controlled reading space, meaningful small section titles, no card-inside-card excess.
- Literal finite screen-key decisions, not regex-classify arbitrary text. Use 10–16 representative high-value screens for individually composed DOM changes; review all other keys and explicitly preserve those already coherent.
- Controls remain 44pt targets. Headline/details hierarchy stays consistent. Original editorial two-tone language stays.
- No new palette/fonts/scales. Existing tokens: 20 side gutter; 4/8/12/16/20/24/32 gaps; 12/14/20 radii; Inter variants 13/18 callout,15/22 body,16/21 title,20/26 headline,24/31 statement,30/34 page title,32/36 and56/58 numerals. Neutral fills, ink primary button, ember only for signal; NO borders, dividers, blur, mesh or section bounce.
- Scope CSS to `.v21-money|body|personal|shell`, prefer direct child classes and variables. NO blanket `.t-title1` / `.t-body` overrides on all descendants, no broad `.li width100%`, no transforms.
- Return actual design decisions, and any geometry problem main needs to fix; do not claim screenshots were checked if not rendered.

## Read efficiently
Do not read the giant HTML board or full JSON catalogs. Use Node to list keys/titles, then inspect bounded `html` snippets for assigned screens. Existing catalog files have no base64 images. Main will render and check the combined board. No browser navigation from subagents; shared browser belongs to main.
