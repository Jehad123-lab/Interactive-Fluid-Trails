
# Developer Notebook

## To Do
- [ ] Add touch support for mobile devices.
- [ ] Implement curl noise shader for more vorticity.

## In Progress
- [x] Implement Meta Prototype UI (Code, Control, Console panels).
- [x] Upgrade fluid simulation to 5-pass Navier-Stokes solver.
- [x] Add "Reveal" mechanic with underlying image.

## Done
- **2024-07-29**: Project initialized. Core architecture laid out according to System Prompt v22.
- **2024-07-29**: Completed initial implementation of the fluid trail effect. The simulation now runs smoothly and responds to mouse input.
- **2024-07-29**: Refactored to use standard module resolution (removed .tsx extensions in imports).
- **2024-07-29**: Major upgrade to physics engine. Implemented advection, divergence, pressure, and gradient subtract shaders. Added Meta Prototype interface for real-time parameter tuning.
