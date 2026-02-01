# Secure Documents Migration Plan

## Problem

Currently, all markdown documents (call-content pricing, strategies, personal info) are stored in the public GitHub repo. Anyone with the repo URL can read:
- Call-Content pricing strategy
- Land savings plans (personal finance)
- Partnership emails
- Demo scripts
- Competitor analysis

**This is a security risk.**

---

## Solution Options

### Option 1: Move to Supabase Storage (Recommended)

**Pros:**
- Auth-gated (only logged-in Drew can access)
- Easy to manage (upload/delete via dashboard)
- Already have Supabase setup
- Fast (served from CDN)

**Cons:**
- Need to migrate existing files
- Need to update /documents page to fetch from Supabase

---

### Option 2: Private GitHub Repo + API Access

**Pros:**
- Keep Git version control
- Easy to commit/push from workspace

**Cons:**
- Need GitHub token with repo access
- More complex API calls
- Still in Git (less secure)

---

## Recommended: Option 1 (Supabase Storage)

---

## Migration Steps

### Step 1: Create Supabase Storage Bucket

1. Go to https://supabase.com (your project)
2. Click **Storage** in sidebar
3. Click **New bucket**
4. Fill in:
   - **Name:** `documents`
   - **Public:** ❌ **No** (private)
   - **File size limit:** 50 MB
5. Click **Create bucket**

---

### Step 2: Set Up Storage Policies (Auth-Gated)

Run this SQL in Supabase SQL Editor:

```sql
-- Policy: Only authenticated users can read documents
CREATE POLICY "Authenticated users can read documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

-- Policy: Only authenticated users can upload documents
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

-- Policy: Only authenticated users can delete documents
CREATE POLICY "Authenticated users can delete documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents');

-- Policy: Only authenticated users can update documents
CREATE POLICY "Authenticated users can update documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'documents');
```

**Result:** Only logged-in users can access documents. Public users get `403 Forbidden`.

---

### Step 3: Upload Existing Documents to Supabase

**Option A: Manual Upload (Easiest)**
1. Go to Supabase Storage → documents bucket
2. Click **Upload file**
3. Select all `.md` files from workspace
4. Click **Upload**

**Option B: Scripted Upload (Faster)**

Create `upload-docs.sh`:

```bash
#!/bin/bash
SUPABASE_URL="https://wizcggocfichhlcejsjf.supabase.co"
SUPABASE_KEY="your-service-role-key"

for file in *.md; do
  echo "Uploading $file..."
  curl -X POST "${SUPABASE_URL}/storage/v1/object/documents/$file" \
    -H "Authorization: Bearer ${SUPABASE_KEY}" \
    -H "Content-Type: text/markdown" \
    --data-binary "@$file"
done

echo "✓ All documents uploaded"
```

Run: `chmod +x upload-docs.sh && ./upload-docs.sh`

---

### Step 4: Update /documents Page to Fetch from Supabase

Replace `/app/documents/page.tsx` with this:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<string[]>([])
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchDocuments()
  }, [])

  async function fetchDocuments() {
    const { data, error } = await supabase
      .storage
      .from('documents')
      .list()

    if (error) {
      console.error('Error fetching documents:', error)
    } else {
      const mdFiles = data.filter(f => f.name.endsWith('.md')).map(f => f.name)
      setDocuments(mdFiles)
    }
    setLoading(false)
  }

  async function fetchDocument(filename: string) {
    const { data, error } = await supabase
      .storage
      .from('documents')
      .download(filename)

    if (error) {
      console.error('Error fetching document:', error)
    } else {
      const text = await data.text()
      setContent(text)
      setSelectedDoc(filename)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8">Documents</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Document list */}
        <div className="md:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Files</h2>
          <div className="space-y-2">
            {documents.map(doc => (
              <button
                key={doc}
                onClick={() => fetchDocument(doc)}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  selectedDoc === doc
                    ? 'bg-blue-600'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                {doc}
              </button>
            ))}
          </div>
        </div>

        {/* Document viewer */}
        <div className="md:col-span-3">
          {selectedDoc ? (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">{selectedDoc}</h2>
              <div className="prose prose-invert max-w-none">
                <pre className="whitespace-pre-wrap">{content}</pre>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-center py-20">
              Select a document to view
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

---

### Step 5: Remove Documents from Public Repo

**After confirming documents are in Supabase:**

1. Create `.gitignore` rules:
   ```
   # Secure documents (stored in Supabase)
   call-content-*.md
   land-savings-roadmap.md
   blog-*.md
   *-partnership-*.md
   *-demo-*.md
   ```

2. Remove files from Git:
   ```bash
   git rm call-content-*.md
   git rm land-savings-roadmap.md
   git rm blog-*.md
   git commit -m "Move sensitive documents to Supabase storage"
   git push
   ```

3. Verify files are deleted from GitHub:
   - Go to https://github.com/EarlAiAssistant/earl-dashboard
   - Confirm files are no longer visible

---

### Step 6: Update Document Creation Workflow

**Old workflow:**
1. Earl creates document (`call-content-pricing.md`)
2. Commits to Git
3. Pushes to GitHub
4. File is publicly visible

**New workflow:**
1. Earl creates document
2. Uploads to Supabase storage via API:
   ```typescript
   const { data, error } = await supabase
     .storage
     .from('documents')
     .upload('call-content-pricing.md', fileContent)
   ```
3. Document is auth-gated (only Drew can read)

---

## Security Benefits

### Before (Public Repo)
- ❌ Anyone can read pricing strategy
- ❌ Anyone can see partnership emails
- ❌ Anyone can view financial plans
- ❌ Competitors can see your roadmap

### After (Supabase Storage)
- ✅ Only authenticated users can read
- ✅ Documents are private by default
- ✅ Easy to share (generate signed URLs for specific docs)
- ✅ Version control via Supabase (optional)

---

## Alternative: Hybrid Approach

**Keep some files public, move others private:**

**Public (GitHub):**
- README.md
- AGENTS.md
- SOUL.md
- HEARTBEAT.md
- Helper scripts

**Private (Supabase):**
- call-content-*.md (business sensitive)
- blog-*.md (SEO content, publish later)
- land-savings-roadmap.md (personal finance)
- partnership emails

---

## Migration Checklist

- [ ] Create Supabase storage bucket (`documents`)
- [ ] Set up storage policies (auth-gated)
- [ ] Upload existing .md files to Supabase
- [ ] Update /documents page to fetch from Supabase
- [ ] Test: Can logged-in user view documents?
- [ ] Test: Can public user NOT view documents?
- [ ] Remove sensitive files from Git (git rm)
- [ ] Update .gitignore
- [ ] Push changes
- [ ] Verify files deleted from GitHub

---

## Rollback Plan (If Something Breaks)

1. Documents are still in workspace (local copies)
2. Can re-upload to GitHub if needed
3. Can revert commit: `git revert HEAD && git push`

---

## Timeline

**Estimated time:** 1-2 hours

- 15 min: Create bucket + policies
- 30 min: Upload documents to Supabase
- 30 min: Update /documents page
- 15 min: Test authentication
- 15 min: Remove from Git + verify

---

**Status:** Ready to migrate (requires Drew to execute)

**Priority:** HIGH (sensitive business data is currently public)
