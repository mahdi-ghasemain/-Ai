# Pars AI: economical assistant

The Studio is available in the Assistant tab. Its showcase contains prepared
images, a still video concept, code and campaign copy. Preview mode does not
call a model and always labels these as prepared examples.

## Server settings

Paid AI is OFF by default, independently of the frontend demo login.
Configure these only on the server:

```dotenv
AI_PAID_ENABLED=false
AI_SEARCH_ENABLED=false
GLOBAL_MONTHLY_CREDITS=100
FREE_MONTHLY_QUOTA=5
MAX_OUTPUT_TOKENS=800
OPENAI_MODEL=gpt-5.6-luna
OPENAI_IMAGE_MODEL=gpt-image-1-mini
```

After provisioning the provider, backend and real authentication, an operator
can set AI_PAID_ENABLED=true. This starts paid provider usage.
Never put provider keys in EXPO_PUBLIC variables or the Android app.

## What a credit means

- Text, code and a video storyboard: 1 credit per successful request.
- One low-quality image: 5 credits.
- Plans have finite monthly credits: free 5, starter 30, creator 100, studio 300.
- Paid research is separately disabled by default.
- The global monthly ceiling is shared by all users of this database.
- Reservations happen atomically BEFORE any model call.
- On failure, user credits are returned. The global attempt reservation is kept:
  a timed-out provider may still charge for work it completed.
- Automatic provider retries are disabled.
- There is no automatic paid upgrade, card charge, or subscription checkout.

Credits limit request volume; they are NOT a guaranteed dollar spending limit.
Provider models, token prices, input length and account policies affect cost.
Set a provider-side spending cap as well, where supported. Use one persistent
database for this deployment; separate databases have separate global limits.
Text responses are capped at 800 output tokens by default and history at six
short turns. Long responses may be incomplete; users can request continuation.

## Current scope

The live adapter uses OpenAI Responses and Images. It does not claim access to
every AI brand. Real video rendering and audio generation are not enabled.
The video showcase is a still concept image, clearly labelled.
Production billing, payment verification, renewable subscriptions, provider
access eligibility, and publishing still require setup before selling access.

## Verification

Run from api/: `python -m unittest test_economy -v`.
These tests use fake providers and isolated databases; no paid calls are made.
