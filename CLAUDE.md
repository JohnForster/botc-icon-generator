# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an icon generator web application that transforms black and white vector-style images into stylized icons using textured backgrounds. Built with Preact and Vite, using HTML5 Canvas for image processing.

### Features
- Drag & drop file upload for SVG and PNG images
- Automatic SVG to PNG conversion
- Configurable white border addition
- Color texture replacement (Evil/red, Good/blue, Fabled/gold backgrounds)
- Grayscale conversion for non-B&W images
- PNG download functionality

## Development Commands

- `pnpm dev` - Start development server with hot module replacement
- `pnpm build` - Build for production (runs TypeScript compiler then Vite build)
- `pnpm preview` - Preview the production build locally

## Architecture

### Tech Stack
- **Frontend Framework**: Preact (React-like library with smaller bundle size)
- **Build Tool**: Vite (using rolldown-vite variant for performance)
- **Language**: TypeScript
- **Package Manager**: pnpm

### Project Structure
- `src/main.tsx` - Application entry point, renders the App component
- `src/app.tsx` - Main application component (currently default counter example)
- `src/app.css` - Component-specific styles
- `src/index.css` - Global styles
- `public/` - Static assets including background images (blue, gold, red, white webp files)

### TypeScript Configuration
The project uses a composite TypeScript setup with separate configs:
- `tsconfig.json` - References both app and node configs
- `tsconfig.app.json` - Application code configuration
- `tsconfig.node.json` - Node.js/build tool configuration

### Image Processing Pipeline
The app processes images in this sequence:
1. **File Upload**: Accepts SVG/PNG files via drag & drop or file picker
2. **SVG Conversion**: SVG files are converted to PNG using HTML5 Canvas
3. **Grayscale Conversion**: Non-B&W images are converted to grayscale
4. **Border Addition**: Configurable white border is added around the image
5. **Texture Application**: 
   - Black areas are replaced with selected color texture (Evil/red, Good/blue, Fabled/gold)
   - White areas are replaced with white texture
   - For grayscale images, original image is used as base layer to prevent transparency issues
6. **Output**: Final image is displayed and downloadable as PNG

### Key Dependencies
- `preact`: React alternative with smaller bundle size

### Key Notes
- Uses Preact instead of React for smaller bundle size
- The project uses `rolldown-vite` instead of standard Vite for improved performance
- Class attributes use `class` instead of `className` (Preact convention)
- Texture images are located in `/public/background-{color}.webp`
- All image processing happens client-side using HTML5 Canvas and ImageData APIs