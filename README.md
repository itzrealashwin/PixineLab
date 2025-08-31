# Pixine Lab - AI Thumbnail Generator

**Pixine Lab** is an AI-powered thumbnail generator designed to help content creators produce professional, high-CTR thumbnails for YouTube, Shorts, Udemy courses, and other social media platforms.

---

## Features

* AI-powered thumbnail generation using custom prompts.
* Optional image upload for reference or background.
* Customizable settings: **Mood, Style, Ratio, and Placement**.
* Prompt optimization using **Prompt Rewrite**.
* Supports multiple platforms: YouTube, Shorts, Udemy, Instagram, and more.
* Generates multiple variations for **A/B testing**.

---

## Goals

* Simplify the thumbnail creation process for content creators.
* Enable high-quality, click-worthy thumbnails without graphic design skills.
* Provide AI-assisted optimization for better engagement.
* Support multi-platform content with flexible formats and ratios.

---

## Use Cases

* **YouTube Videos & Shorts**: Generate engaging thumbnails to improve click-through rates.
* **Online Courses (Udemy, Skillshare, etc.)**: Create course thumbnails that attract learners.
* **Social Media Content**: Instagram, Facebook, and other platforms for promotional visuals.
* **Marketing & Advertising**: Quickly produce visual content for campaigns.
* **A/B Testing**: Generate multiple variations to determine the most effective thumbnail.

---

## Project Setup & Installation

### Prerequisites

* Node.js v22 or higher
* npm or yarn installed
* Git installed

### Clone Repository

```bash
git clone https://github.com/itzrealashwin/PixineLab.git
cd PixineLab
```

### Install Dependencies

```bash
npm install
# or
yarn install
```

### Environment Variables

Create a `.env.local` file in the root directory and add the following variables:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

GOOGLE_API_KEY=
```

### Development Server

```bash
npm run dev
# or
yarn dev
```

* Open [http://localhost:3000](http://localhost:3000) to see the app in the browser.

### Build & Production

```bash
npm run build
npm start
# or
yarn build
yarn start
```

* The app will start in production mode.

---

## Brief Workflow

1. **Login**: Users log in using Clerk authentication.
2. **Upload Image (Optional)**: Upload a reference/background image.
3. **Enter Prompt**: Provide a description or video title.
4. **Configure Settings**: Mood, style, aspect ratio, and placement.
5. **Generate Prompt Rewrite**: AI optimizes the prompt.
6. **Confirm or Modify**: User reviews and approves the prompt.
7. **Generate Thumbnail**: AI produces high-quality thumbnail images.

---

## Tech Stack

* **Framework & Hosting**: Next.js 15, Vercel
* **Frontend**: React 19, TailwindCSS 4, next-themes, clsx, tailwind-merge
* **UI & Accessibility**: Radix UI, Lucide React icons, Geist UI, Sonner
* **AI Integration**: Google Gen AI Nano (`@google/genai`), Gemini SDK (`@google/generative-ai`), OpenAI SDK
* **Media & File Handling**: Cloudinary, JSZip, React Dropzone
* **Validation & Type Safety**: Zod
* **Development Tools**: ESLint, PostCSS, Turbopack

---

## Contact

For feedback or support:

* **Email:** [maliashwin2005@gmail.com](mailto:maliashwin2005@gmail.com)
* **GitHub:** [https://github.com/<your-username>](https://github.com/itzrealashwin)

---

> **Note:** Pixine Lab relies on AI models and requires API keys for OpenAI and Google Gen AI services.
