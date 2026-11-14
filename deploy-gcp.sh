#!/usr/bin/env bash
set -e

PROJECT_ID="magdehack"
REGION="europe-west3" # Frankfurt (closest to Magdeburg, Germany)
SERVICE_NAME="bruecke"

echo "=== 1. Setting active GCP project to $PROJECT_ID ==="
gcloud config set project "$PROJECT_ID"

echo "=== 2. Enabling required Google Cloud APIs (Run, Cloud Build, Artifact Registry) ==="
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com --project "$PROJECT_ID"

echo "=== 3. Building container & deploying to Google Cloud Run ==="
gcloud run deploy "$SERVICE_NAME" \
  --source . \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 5 \
  --set-env-vars NEXT_PUBLIC_SUPABASE_URL="https://naujwtrmugyorrlnpkyd.supabase.co",NEXT_PUBLIC_SUPABASE_ANON_KEY="sb_publishable_j3URaA1jq3vny5M-7gan5A_5ZxOC8cp",SUPABASE_SERVICE_ROLE_KEY="sb_secret_hUKD7bof23p6mSNxXRghpw_0_6PLa7E",GROQ_API_KEY="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",GROQ_MODEL="openai/gpt-oss-120b",ELEVENLABS_API_KEY="sk_567e77b599ed0cb4ebc6b3e10e6fb7e5f93c42c272747dc2",ELEVENLABS_VOICE_ID="pFZP5JQG7iQjIQuC4Bku"

echo "=== SUCCESS! Your app is now live on Google Cloud Run! ==="
