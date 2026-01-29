# Deployment Guide: Render.com

Since this application relies on Python scripts to generate data, the data file (`public/n5_kanji_data.json`) must be committed to your repository before deploying.

## 1. Prepare for Deployment

1.  **Stop the running server** (Ctrl+C).
2.  **Verify the Data**: Ensure `public/n5_kanji_data.json` exists and is up to date (we just generated it).
3.  **Initialize Git** (if not already done):
    ```bash
    git init
    git add .
    git commit -m "Ready for deployment"
    ```
    *Note: The `.gitignore` file I created ensures `node_modules` are ignored but your data is included.*

## 2. Push to GitHub

1.  Create a new repository on [GitHub](https://github.com/new).
2.  Follow the instructions to push your code:
    ```bash
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/kanji-memory-engine.git
    git push -u origin main
    ```

## 3. Deploy on Render

1.  Go to [Render Dashboard](https://dashboard.render.com/).
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository.
4.  Configure the settings:
    - **Name**: `kanji-memory-engine`
    - **Runtime**: `Node`
    - **Build Command**: `npm install && npm run build`
    - **Start Command**: `npm start`
5.  Click **Create Web Service**.

## Troubleshooting
- **Missing Data?** If the app loads but lists are empty, check if `public/n5_kanji_data.json` is in your GitHub repo.
- **Build Fails?** Ensure `setup_data.bat` is NOT in the build command (it requires Python). We are using the pre-generated JSON.
