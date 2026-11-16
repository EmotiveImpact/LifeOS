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

## Local data foundation dependencies
- **Expo SQLite 58.0.17, Expo SecureStore 58.0.3, Expo Crypto 58.0.8 — MIT.** Copyright (c) 2015-present 650 Industries, Inc. (aka Expo). https://github.com/expo/expo . MIT licence texts are included in each installed package's `LICENSE` file. SQLite/SQLCipher platform dependency notices must also be retained in native distributions.
- **Drizzle ORM 0.45.4 — Apache-2.0.** Drizzle Team. https://github.com/drizzle-team/drizzle-orm . Licence: https://github.com/drizzle-team/drizzle-orm/blob/main/LICENSE . Used as a dependency for the typed SQLite schema and native migration/ORM boundary, not copied source.

## Libraries
Add each installed MIT / Apache-2.0 library here with its copyright line when it's added to `package.json` (Phase 1b onwards).
