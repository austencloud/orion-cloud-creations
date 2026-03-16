# OCC Admin — Setup Guide

## Prerequisites

- Node.js 18+
- Firebase account
- Cloudflare account (for R2)

## Step 1: Firebase Project

1. Go to https://console.firebase.google.com
2. Click "Add project" → name it `orion-cloud-creations`
3. Disable Google Analytics (not needed)
4. Once created, go to Project Settings → General → "Your apps"
5. Click the web icon (</>) to add a web app
6. Name it "OCC Admin"
7. Copy the `firebaseConfig` values

## Step 2: Firestore Database

1. In Firebase console, go to Build → Firestore Database
2. Click "Create database"
3. Choose "Start in test mode" (we'll add rules later)
4. Select a region close to you (us-central1 or us-east1)

## Step 3: Cloudflare R2

1. Go to https://dash.cloudflare.com → R2
2. Create a bucket named `occ-media`
3. Enable public access (Settings → Public access → Allow)
4. Note the public URL (e.g., https://pub-xxxxx.r2.dev)
5. Create an API token with R2 read/write permissions (for uploads)

## Step 4: Environment Variables

Copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env
```

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=orion-cloud-creations.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=orion-cloud-creations
VITE_FIREBASE_STORAGE_BUCKET=orion-cloud-creations.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
```

## Step 5: Install & Run

```bash
cd F:\occ-admin
npm install
npm run dev
```

App runs on http://localhost:5180

## Step 6: Upload Photos to R2

Before seeding, upload the photos to R2. From the PHOTOS directory:

```bash
# Using rclone (recommended):
rclone copy F:\orion-cloud-creations\PHOTOS\thumbnails\ r2:occ-media/thumbnails/
rclone copy F:\orion-cloud-creations\PHOTOS\ r2:occ-media/originals/ --include "*.{jpg,JPG,jpeg,JPEG,png,PNG}"

# Or using wrangler:
# npx wrangler r2 object put occ-media/thumbnails/filename.jpg --file=path/to/file.jpg
```

## Step 7: Seed the Database

1. Visit http://localhost:5180/seed
2. The page auto-detects photo-catalog.json from the OCC project
3. Click "Seed Tags" to create all tag definitions
4. Click "Seed Items" to create all media item entries
5. All items are marked "needs review" — use the Media page to verify/correct tags

## Step 8: Start Tagging

Visit http://localhost:5180/media to view, tag, and manage your photo inventory.
