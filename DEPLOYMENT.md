# KetoOS Deployment Guide

This guide covers different deployment scenarios for KetoOS, from simple static hosting to full production deployments with build tools.

## 🚀 Quick Start (No Build Tools)

### For Simple Static Hosting
1. **Download the project** from GitHub
2. **Upload all files** to your web server
3. **Ensure `index.html`** is served as the default page
4. **That's it!** The app will work immediately

### Local Testing
```bash
# Using Python (if available)
python -m http.server 8000

# Using Node.js (if available)
npx serve .

# Using PHP (if available)
php -S localhost:8000
```

## 🔧 Advanced Setup (With Build Tools)

### Prerequisites
- Node.js 18.0.0 or higher
- npm 9.0.0 or higher

### Development Environment
1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   # Copy the local environment template
   cp env.local .env.local
   # Edit .env.local with your local settings
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open browser** to `http://localhost:3000`

### Production Build
1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy the `dist/` folder** to your web server

## 🌐 Platform-Specific Deployment

### Vercel Deployment
1. **Connect your GitHub repository** to Vercel
2. **Set environment variables** in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add variables from `env.production.template`
3. **Deploy automatically** on git push

### Netlify Deployment
1. **Connect your repository** to Netlify
2. **Set build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Set environment variables** in Netlify dashboard
4. **Deploy**

### GitHub Pages
1. **Enable GitHub Pages** in repository settings
2. **Set source** to "GitHub Actions"
3. **Create workflow** (see `.github/workflows/deploy.yml`)
4. **Push to trigger deployment**

### Traditional Web Hosting
1. **Build the project:**
   ```bash
   npm run build
   ```
2. **Upload `dist/` contents** to your web server
3. **Configure server** to serve `index.html` for all routes

## ⚙️ Environment Variables

### Local Development
Create `.env.local` with these settings:
```env
VITE_APP_NAME=KetoOS
VITE_APP_ENVIRONMENT=development
VITE_ENABLE_SOUND_EFFECTS=true
VITE_ENABLE_BOOT_ANIMATION=true
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
```

### Production
Set these in your hosting platform:
```env
VITE_APP_NAME=KetoOS
VITE_APP_ENVIRONMENT=production
VITE_ENABLE_SOUND_EFFECTS=true
VITE_ENABLE_BOOT_ANIMATION=true
VITE_DEBUG_MODE=false
VITE_LOG_LEVEL=error
```

## 🔍 Troubleshooting

### Common Issues

#### "npm not found"
- **Solution**: Install Node.js from [nodejs.org](https://nodejs.org/)
- **Alternative**: Use the no-build-tools version

#### "Module not found" errors
- **Solution**: Run `npm install` to install dependencies
- **Check**: Ensure all files are present in the project

#### Environment variables not working
- **Check**: Variables must start with `VITE_`
- **Verify**: Restart development server after changes
- **Production**: Ensure variables are set in hosting platform

#### Build fails
- **Check**: Node.js version (requires 18+)
- **Verify**: All dependencies are installed
- **Debug**: Check console for specific error messages

### Performance Optimization
- **Enable gzip compression** on your web server
- **Set proper cache headers** for static assets
- **Use CDN** for faster global delivery
- **Optimize images** if adding custom wallpapers

## 📋 Deployment Checklist

### Before Deployment
- [ ] Test locally with `npm run dev`
- [ ] Build successfully with `npm run build`
- [ ] Test production build locally
- [ ] Set environment variables
- [ ] Configure domain and SSL (if applicable)

### After Deployment
- [ ] Verify all features work correctly
- [ ] Test on different browsers
- [ ] Check mobile responsiveness
- [ ] Monitor performance
- [ ] Set up error tracking (optional)

## 🛠️ Customization

### Adding Custom Wallpapers
1. Add images to `public/wallpapers/`
2. Update configuration in environment variables
3. Rebuild and deploy

### Modifying Features
1. Edit environment variables to enable/disable features
2. Modify `js/config.js` for additional options
3. Rebuild and deploy

### Branding Changes
1. Update `VITE_APP_NAME` in environment variables
2. Modify title in `index.html`
3. Update favicon and other branding elements

## 📞 Support

If you encounter deployment issues:
1. Check the troubleshooting section above
2. Review browser console for errors
3. Verify all files are present
4. Test with a simple static server first
5. Open an issue on GitHub with details

---

**Happy Deploying!** 🚀
