# CPR Training Business Web Application Design Guidelines

## Design Approach
**Reference-Based Approach**: Drawing inspiration from professional healthcare training platforms and AHA's official design standards. The design prioritizes trust, professionalism, and accessibility while maintaining simplicity for diverse user groups.

## Core Design Elements

### Color Palette
**Primary Colors:**
- Deep Red: 0 75% 35% (AHA-inspired emergency medical red)
- Clean White: 0 0% 100%
- Professional Navy: 220 50% 20%

**Supporting Colors:**
- Light Gray: 220 10% 95% (backgrounds)
- Medium Gray: 220 15% 60% (text)
- Success Green: 140 60% 40% (confirmations)

### Typography
**Font Stack:** Inter or Roboto via Google Fonts
- Headings: 600-700 weight
- Body text: 400 weight
- Small text/captions: 300 weight
- Button text: 500 weight

### Layout System
**Spacing Units:** Tailwind units of 2, 4, 6, and 8 (p-4, m-6, h-8, etc.)
- Consistent 4-unit base for most spacing
- 8-unit spacing for major section breaks
- 2-unit spacing for tight elements

### Component Library

**Navigation:**
- Clean header with business logo and AHA affiliation badge
- Clear navigation: Home, Classes, Calendar, Login, Contact
- Mobile hamburger menu with slide-out drawer

**Forms:**
- Rounded corners (rounded-lg)
- Clear labels and validation states
- Primary button styling with deep red background
- Secondary outline buttons with navy borders

**Cards:**
- Subtle shadows (shadow-md)
- White backgrounds with light gray borders
- Consistent padding (p-6)

**Data Displays:**
- Clean tables with alternating row colors
- Calendar grid with clear date visibility
- Client dashboard with card-based layout

**Overlays:**
- Modal dialogs for registration forms
- Success/error notifications (toast style)
- Loading states with subtle animations

## Page-Specific Considerations

### Public Pages
- Professional hero section with CPR training imagery
- Trust indicators (AHA certification badges)
- Clear class information hierarchy
- Prominent registration CTAs

### Admin Dashboard
- Sidebar navigation for admin functions
- Data-dense tables with search/filter capabilities
- Form-heavy interfaces for client management
- Clear action buttons (edit, delete, add)

### Calendar Interface
- Month/week view toggles
- Class availability indicators
- Click-to-register functionality
- Mobile-optimized touch targets

## Images
**Hero Image:** Large hero image showing professional CPR training in progress - instructor demonstrating on mannequin with students observing. Should convey professionalism and medical authority.

**Supporting Images:**
- AHA certification badges/logos in header and footer
- Class-specific images (BLS vs Heartsaver scenarios)
- Instructor profile photo for credibility
- Equipment/training environment photos

**Image Placement:**
- Hero: Full-width banner on homepage
- Class pages: Feature images showing relevant training scenarios
- About section: Professional headshot and credentials
- No decorative images - all images serve functional purposes

## Accessibility & Responsiveness
- High contrast ratios for text readability
- Touch-friendly button sizes (minimum 44px)
- Keyboard navigation support
- Screen reader compatibility
- Progressive disclosure for complex forms
- Consistent dark mode implementation

## Key Design Principles
1. **Medical Authority**: Visual cues that establish credibility and AHA compliance
2. **Simplicity**: Clear navigation paths for both tech-savvy and novice users
3. **Trust Building**: Professional imagery and clear credential display
4. **Efficiency**: Streamlined registration and payment processes
5. **Accessibility**: Universal design for all users and devices