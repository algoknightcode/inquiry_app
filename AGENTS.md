# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

# Responsive & Device-Optimized UI Component Guidelines

When writing or modifying the UI of any component, ensure it is fully responsive and optimized for multiple screen sizes (small phones, large phones, tablets, landscape/portrait):

1. **Responsive Fonts**: Avoid fixed font sizes. Scale fonts dynamically based on the device screen width (e.g., utilizing `useWindowDimensions()` or scale factor helpers).
2. **Responsive Component & Avatar Sizes**: Avoid fixed dimensions (e.g., `w-12 h-12`) for avatars, icons, and logos. Adjust these sizes dynamically for tablets and smaller phones.
3. **Adaptive Paddings & Margins**: Avoid fixed paddings/margins. Adjust spacing based on screen size (e.g., larger padding on tablets, compact padding on smaller devices).
4. **Flexible Heights**: Do not rely on fixed heights (e.g., `h-14`) for wrappers, list items, or marquees. Make heights content-driven or dynamically scaled.
5. **Flexible Sizing & Widths**: Avoid arbitrary fixed minimum widths (e.g., `min-w-[100px]`). Use flexible sizing like `flex-1` or percentage-based widths where appropriate.
6. **Tablet & Landscape Optimization**: Check device screen dimensions (`useWindowDimensions()`) to detect tablets and orientation changes, tailoring the layout structure accordingly (e.g., displaying multi-column grids on wider screens).
7. **Centralized Responsive Constants**: Wherever possible, store and import responsive layout tokens (typography, spacing, sizing constants) rather than hardcoding arbitrary pixel values throughout the UI files.

# CRITICAL MANDATE: Screen Optimization & Responsiveness

Every single UI component, page, layout, or container created or modified in this project **MUST** be fully optimized and tested to be completely responsive across all screen form factors (small phones, large phones, tablets, and landscape/portrait orientations). Never assume a fixed layout or screen size. Always ensure layouts use fluid/flex configurations, leverage `useWindowDimensions()` to scale content dynamically, and use proper horizontal and vertical safe area offsets to prevent shifting or cutting off elements.

