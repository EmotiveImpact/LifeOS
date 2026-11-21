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
- **Expo SQLite 58.0.18, Expo SecureStore 58.0.3, Expo Crypto 58.0.8 — MIT.** Copyright (c) 2015-present 650 Industries, Inc. (aka Expo). https://github.com/expo/expo . MIT licence texts are included in each installed package's `LICENSE` file. SQLite/SQLCipher platform dependency notices must also be retained in native distributions.
- **Drizzle ORM 0.45.4 — Apache-2.0.** Drizzle Team. https://github.com/drizzle-team/drizzle-orm . Licence: https://github.com/drizzle-team/drizzle-orm/blob/main/LICENSE . Used as a dependency for the typed SQLite schema and native migration/ORM boundary, not copied source.

## Expo Development Client 58.0.21 (MIT)
Copyright (c) 2015-present 650 Industries, Inc. (aka Expo). https://github.com/expo/expo . SDK-pinned development tooling for a custom local native build; not an external application service. Licence retained in the installed package.

## Brain and attachment foundation
- **Expo Asset 58.0.21, Expo Document Picker 58.0.5, Expo Image Picker 58.0.10, Expo File System 58.0.14 — MIT.** Copyright (c) 2015-present 650 Industries, Inc. (aka Expo). https://github.com/expo/expo . Exact SDK pins and integrity are in `apps/mobile/package-lock.json`; licences remain in the installed packages.
- **Google ML Kit Text Recognition 16.0.1 (Android native dependency).** Used for the on-device OCR pipeline specified in SPEC §2.2, not copied source. Distributed under Google's ML Kit SDK terms: https://developers.google.com/ml-kit/terms . Preserve SDK notices in native distributions. Its model is bundled, not a cloud OCR call.

## API server (Phase 21)
Dependencies of `apps/api`, not copied source. Exact pins and integrity are in `vendor/REFERENCES.lock.md`; each licence text ships in its installed package.
- **Better Auth 1.7.25 — MIT.** Copyright (c) 2024 - present, Bereket Engida. https://github.com/better-auth/better-auth
- **Drizzle ORM 0.45.4 — Apache-2.0** (as above) and **Drizzle Kit 0.31.11 — MIT** (development only). Drizzle Team. https://github.com/drizzle-team/drizzle-orm
- **Neon serverless driver 1.2.1 — MIT.** Copyright (c) 2022 - 2025 Neon Inc. https://github.com/neondatabase/serverless
- **Zod 4.6.7 — MIT.** Copyright (c) 2025 Colin McDonnell. https://github.com/colinhacks/zod

## Libraries
Add each installed MIT / Apache-2.0 library here with its copyright line when it's added to `package.json` (Phase 1b onwards).

## Food (Phase 27)
- **React Native VisionCamera 5.2.4 (MIT).** Copyright (c) Marc Rousavy. https://github.com/mrousavy/react-native-vision-camera . The iPhone camera for barcodes. Installed as a dependency, not copied source.
- **React Native Nitro Image 0.15.2 (MIT).** Copyright (c) Marc Rousavy. https://github.com/mrousavy/react-native-nitro-image . Required by VisionCamera, and used to make meal and label photos small before they're sent.
- **Open Food Facts: data under the Open Database Licence (ODbL) 1.0, product images under CC BY-SA.** https://world.openfoodfacts.org . Product names and nutrition are looked up by barcode at the moment you scan and are not copied into life's code or database. Every screen that shows them credits Open Food Facts and the licence.

## The day engine (Phase 29)
- **expo-notifications 58.1.9, expo-background-task 58.0.13, expo-task-manager 58.0.14, expo-calendar 58.0.8 and expo-device 58.0.5 (MIT).** Copyright (c) 2015-present 650 Industries, Inc. (aka Expo). https://github.com/expo/expo . Local nudges, background work, reading busy times from the phone's calendars, and telling a phone from a simulator for push tokens. Installed as dependencies, not copied source.

## Quality (Phase 30)
- **Sentry React Native SDK 8.28.0 (MIT).** Copyright (c) Functional Software, Inc. dba Sentry. https://github.com/getsentry/sentry-react-native . Crash reports, started only when the build carries the owner's DSN and the person hasn't switched them off. Installed as a dependency with its own Sentry JavaScript and native SDK dependencies (MIT), not copied source.
