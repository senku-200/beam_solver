# Beam Solver

A modern, interactive web application for structural analysis of beams with real-time visualization of shear force and bending moment diagrams.

## Features

- **Interactive Beam Design**: Create and configure beams with custom dimensions and units
- **Multiple Load Types**: Support for point loads, angled loads, distributed loads (UDL/UVL), and moment loads
- **Real-time Analysis**: Instant calculation of reactions, shear forces, and bending moments
- **Visual Diagrams**: Interactive SVG diagrams showing beam geometry, loads, and analysis results
- **Responsive Design**: Modern UI built with Tailwind CSS and Framer Motion
- **Type Safety**: Full TypeScript implementation for robust development


## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React
- **Build Tool**: Next.js with App Router

## Prerequisites

- Node.js 18.17 or later
- npm 9+ or yarn 1.22+

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd beam-solver
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your configuration if needed.

## Development

### Running in Development Mode
```bash
npm run dev
```
The application will be available at `http://localhost:3000`

### Building for Production
```bash
npm run build
```

### Starting Production Server
```bash
npm start
```

### Linting
```bash
npm run lint
```

## Production Deployment

### Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Environment Variables**: Set any required environment variables in the Vercel dashboard

### Docker Deployment

1. **Build Docker image**
   ```bash
   docker build -t beam-solver .
   ```

2. **Run container**
   ```bash
   docker run -p 3000:3000 beam-solver
   ```

### Traditional Server Deployment

1. **Build the application**
   ```bash
   npm run build
   npm run start
   ```

2. **Use a process manager like PM2**
   ```bash
   npm install -g pm2
   pm2 start npm --name "beam-solver" -- start
   pm2 save
   pm2 startup
   ```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/             # React components
│   ├── BeamDiagram.tsx    # Main beam visualization
│   ├── LoadsSection.tsx   # Load configuration UI
│   ├── AnalysisResults.tsx # Results display
│   └── ...                # Other components
├── types/                  # TypeScript type definitions
│   └── beam.ts            # Beam analysis types
├── utils/                  # Utility functions
│   └── beamCalculations.ts # Core analysis logic
└── lib/                    # Library configurations
```

## Core Functionality

### Beam Analysis Engine
The application performs structural analysis using:
- **Equilibrium Equations**: Sum of forces and moments
- **Shear Force Calculation**: Integration of distributed loads
- **Bending Moment Calculation**: Integration of shear force
- **Reaction Forces**: Support reactions based on boundary conditions

### Load Types Supported
- **Point Loads**: Concentrated forces at specific positions
- **Angled Loads**: Forces applied at specific angles
- **Uniformly Distributed Loads (UDL)**: Constant intensity over a span
- **Uniformly Varying Loads (UVL)**: Linearly varying intensity
- **Moment Loads**: Applied couples or moments

## Performance Optimization

- **Static Generation**: Pages are pre-rendered for optimal performance
- **Code Splitting**: Automatic code splitting by Next.js
- **Image Optimization**: Built-in image optimization
- **Bundle Analysis**: Use `npm run build` to analyze bundle size

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Troubleshooting

### Build Issues
- Ensure Node.js version is 18.17+
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Runtime Issues
- Check browser console for errors
- Verify environment variables are set correctly
- Ensure all required ports are available

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly: `npm run build && npm run lint`
5. Commit: `git commit -m 'Add feature'`
6. Push: `git push origin feature-name`
7. Submit a pull request

## Support

For technical support or questions:
- Create an issue in the repository
- Check existing issues for solutions
- Review the code documentation

## Version History

- **v0.1.0**: Initial release with core beam analysis functionality
  - Interactive beam design
  - Multiple load type support
  - Real-time analysis
  - Visual diagrams

---

Built with ❤️ using modern web technologies for structural engineers and students.
