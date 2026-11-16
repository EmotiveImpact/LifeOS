# Third-party notices

life includes code ported from these open-source projects. Each ported file starts with a header naming its source file and commit (see `vendor/REFERENCES.lock.md`).

## Atria (MIT)
Copyright (c) 2026 adidshaft. https://github.com/adidshaft/atria
Full licence: `vendor/atria/LICENSE`. Ported: health metric logic (HRV, baselines, recovery drivers, strain, sleep budget and planner, hypnogram, quiescent sleep, walk bouts, journal insights, metric confidence and provenance).

## Cal-AI (MIT)
https://github.com/ovishkh/Cal-AI
Full licence: `vendor/calai/LICENSE`. Used: nutrition data shapes and prompt ideas.

## Fenny (owner’s code)
Teaching language, all 30 drawing devices, all 208 drawn objects and the hand-drawn canvas adapter are ported from the owner’s Feynman app, pinned at `fc32865ed16f`, and adapted to the v17 board and life tokens. Ports live in `apps/mobile/src/learn/scene/`. No imports from `vendor/`.

## React Native Skia 2.14.0 (MIT)
Copyright 2026-present, William Candillon. Copyright 2021-2026, Shopify Inc. https://github.com/Shopify/react-native-skia
Installed at the Expo-pinned version for the full Fenny drawing renderer.

## React Native Web 0.21.4 (MIT; local preview)
Copyright (c) Nicolas Gallagher. Copyright (c) Meta Platforms, Inc. and affiliates. https://github.com/necolas/react-native-web
Development-only adapter for the user-approved localhost Expo preview.

## CanvasKit WASM 0.41.0 (BSD-3-Clause; local web renderer)
Copyright (c) 2011 Google Inc. All rights reserved. https://skia.org/
The installed Skia dependency supplies the CanvasKit runtime; its WASM is served locally for preview, never from a CDN. Full licence texts for these additions are included in `apps/mobile/public/THIRD_PARTY_LICENSES.txt`.

## Libraries
Add each installed MIT / Apache-2.0 library here with its copyright line when it's added to `package.json` (Phase 1b onwards).
