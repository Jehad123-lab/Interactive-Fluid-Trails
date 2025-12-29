
# Interactive Fluid Trails

An immersive, full-screen fluid dynamics simulation that responds to mouse movements, creating beautiful, ephemeral trails. Built with React, Three.js, and GLSL shaders.

This project demonstrates a performant method for creating GPU-accelerated fluid effects on the web by using a ping-pong buffer technique with WebGL render targets. The simulation state is stored in a texture, which is passed back into the shader on the next frame to create a sense of persistence and decay.

## How to Run

1.  No installation is needed.
2.  Serve the project root directory using a simple local web server (e.g., `npx serve`).
3.  Open the provided URL in your browser.

The application relies on an external `importmap` (`external_importmap.js`) to load all dependencies like React and Three.js directly from a CDN. This file is loaded in `index.html` and removes the need for a `node_modules` folder or any build step.

## Directory Tree

```
.
├── assets/
│   ├── 3d_model/
│   ├── icon/
│   ├── illustration/
│   ├── image/
│   ├── typeface/
│   └── video/
├── components/
│   ├── Core/
│   │   └── FluidCanvas/
│   │       └── FluidCanvas.tsx
│   └── Page/
│       └── HomePage.tsx
├── theme/
│   └── Theme.tsx
├── App.tsx
├── bugReport.md
├── external_importmap.js
├── index.html
├── index.tsx
├── metadata.json
├── noteBook.md
└── README.md
```