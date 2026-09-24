# Pars AI preview

Entry point: `index.js` loads `src/ParsApp.js`. The previous screen implementation remains in `App.js` as a reference.

## Included

- Persian/English UI, adjustable to phone width.
- Demo OTP (`1234`, including Persian digits) and guest access. No SMS in demo mode.
- Curated catalog of 13 tool websites, six categories, search and working detail links.
- Website-logo thumbnails fetched remotely, with a letter fallback when unavailable. They are site logos, not generated samples or independently verified official marketing assets.
- Public Hugging Face models API with download sorting, category/search parameters, timeout, cancellation and saved-response fallback. This is a model catalog, not a guarantee of free inference or a directory of all commercial AI apps.
- Eight prompt templates, configurable local prompt builder, selectable text, browser copy / native share.
- Persistent favorites, saved prompts and language.
- Local category-based guide, explicitly labeled. It does not impersonate an online language model.

## Limits before release

The public API and logo hosts need network access. Accessibility from Iranian networks and long-term service availability are not guaranteed. Public network requests could not be verified in the implementation environment because TLS connections failed.

The existing backend integrations remain available in `api/` and `src/api.js`, but the free preview uses local templates and discovery rather than a paid model. Real SMS, paid AI inference, subscriptions, store billing, production hosting and Android device testing are separate release requirements; this is not a store-ready production build.

The catalog does not publish invented review ratings or prices. Users should check each provider's licensing and pricing on its site.

## Run

From the project directory: `npx expo start --web --clear`.
Build web: `npx expo export --platform web`.
Build Android JS bundle: `npx expo export --platform android` (not an APK).

References: https://huggingface.co/docs/hub/api and https://huggingface.co/models .
