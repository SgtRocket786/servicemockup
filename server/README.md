# Server (Express + MongoDB) for Services Website Template

This folder contains a minimal Express server with:

- /api/posts - CRUD using Mongoose
- /api/uploads - multipart upload endpoint (stores files in `server/uploads`) and returns public URLs

Quick start (local):

1. Copy `.env.example` to `.env` and set `MONGO_URI` and optionally `PORT` and `BASE_URL`.
2. Install dependencies:

```powershell
cd server
npm install
```

3. Start the server:

```powershell
npm run dev
```

4. In the admin UI (`html/admin/index.html`) set `window.API_BASE = 'http://localhost:5000'` (or your `BASE_URL`) so the admin will POST files and posts to the API.

Notes:

- Uploaded files are stored in `server/uploads` and served at `http://<host>:<port>/uploads/<filename>`.
- For production, consider using cloud storage (S3/Cloudinary) and securing the API with auth.
