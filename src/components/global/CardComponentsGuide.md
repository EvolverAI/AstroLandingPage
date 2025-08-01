# Card Components System Documentation

## Overview

The card components system provides a modular and reusable way to create sections with cards. This system replaces the duplicated code in `FeaturesSection`, `AiCoursesSection`, and `ServicesSection` with two reusable components:

- **`Card.astro`**: Individual card component
- **`CardsSection.astro`**: Section container for multiple cards

## Components Location

```
src/components/global/
├── Card.astro           # Individual card component
├── CardsSection.astro   # Section with multiple cards
```

## Card Component

### Basic Usage

```astro
---
import Card from '../global/Card.astro';
---

<Card 
  title="My Card Title"
  description="Card description text"
  icon="star"
  theme="dark"
/>
```

### Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | Required | Card title |
| `description` | `string` | Required | Card description text |
| `icon` | `string \| object` | Optional | Material Icons icon name or icon object |
| `features` | `string[]` | Optional | List of features to display |
| `linkText` | `string` | Optional | Link button text |
| `linkUrl` | `string` | Optional | Link URL |
| `theme` | `string` | `"dark"` | `"dark"` or `"light"` |
| `iconColor` | `string` | Auto | Custom icon color class |
| `customClasses` | `string` | `""` | Additional CSS classes |
| `centerContent` | `boolean` | `true` | Center align content |

### Icon Alignment Options

The Card component supports three icon alignment options:

**`alignment: "top"` (Default)**
- Icon displayed centered above the title
- Best for standard feature cards and service listings

**`alignment: "left"`  
- Small icon displayed inline with the title on the left
- Good for compact lists and navigation-style cards

**`alignment: "left-big"`
- Large icon in a circular blue background on the left
- Content (title, description) displayed on the right
- Perfect for hero cards and prominent feature highlights

### Icon Configuration

Icons can be configured in multiple ways:

```astro
<!-- Simple string icon -->
<Card icon="star" />

<!-- Object with alignment -->
<Card 
  icon={{ 
    type: "insights", 
    alignment: "left-big",
    color: "#ffffff" 
  }} 
/>
```

```yaml
# In YAML configuration
cards:
  - title: "Feature Title"
    icon:
      type: "insights"
      alignment: "left-big"
```

### Theme Differences

**Dark Theme (`theme="dark"`)**:
- Dark background (`bg-slate-800`)
- White text
- Blue icon color (`text-blue-400`)
- Simple text links

**Light Theme (`theme="light"`)**:
- White background with shadow
- Dark text
- Blue icon color (`text-blue-600`)
- Button-style links

## CardsSection Component

### Basic Usage

```astro
---
import CardsSection from '../global/CardsSection.astro';

const cards = [
  {
    title: "Card 1",
    description: "Description for card 1",
    icon: "star"
  },
  {
    title: "Card 2", 
    description: "Description for card 2",
    icon: "favorite"
  }
];
---

<CardsSection 
  sectionId="my-section"
  title="My Section Title"
  cards={cards}
/>
```

### Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `sectionId` | `string` | Required | HTML id for the section |
| `sectionType` | `string` | `sectionId` | Used for localization |
| `title` | `string` | Required | Section title |
| `description` | `string` | Optional | Section description |
| `cards` | `CardData[]` | Required | Array of card data |
| `columns` | `string` | `"3"` | Number of columns |
| `responsiveColumns` | `object` | Auto | Custom responsive grid |
| `theme` | `string` | `"dark"` | Section theme |
| `backgroundColor` | `string` | `"bg-custom-slate"` | Background color class |
| `cardTheme` | `string` | Inherit | Theme for cards |
| `iconColor` | `string` | Auto | Icon color for all cards |
| `centerCards` | `boolean` | `true` | Center card content |
| `customClasses` | `string` | `""` | Additional CSS classes |
| `language` | `string` | `"en"` | Language for localization |
| `environment` | `string` | `"production"` | Environment setting |

### CardData Interface

```typescript
interface CardData {
  title: string;
  description: string;
  icon?: string | { 
    type: string; 
    color?: string; 
    alignment?: "top" | "left" | "left-big" 
  };
  features?: string[];
  linkText?: string;
  linkUrl?: string;
  buttonText?: string;
  buttonUrl?: string;
  buttonColor?: string;
}
```

## Examples

### Features Section Style (Dark Cards)

```astro
---
import CardsSection from '../global/CardsSection.astro';

const featuresCards = [
  {
    title: "AI Innovation",
    description: "Cutting-edge AI solutions tailored to your business needs.",
    icon: "auto_awesome"
  },
  {
    title: "Expert Support", 
    description: "24/7 support from our team of AI specialists.",
    icon: "support"
  },
  {
    title: "Scalable Solutions",
    description: "Solutions that grow with your business requirements.",
    icon: "trending_up"
  }
];
---

<CardsSection 
  sectionId="features"
  title="Our Features"
  cards={featuresCards}
  columns="3"
  theme="dark"
  cardTheme="dark"
  iconColor="text-blue-400"
/>
```

### Services Section Style (Light Cards)

```astro
---
import CardsSection from '../global/CardsSection.astro';

const servicesCards = [
  {
    title: "Custom Solutions",
    description: "Tailored systems for your business.",
    icon: "check_circle",
    linkText: "Learn More",
    linkUrl: "/services"
  },
  {
    title: "Data Analytics",
    description: "Transform data into insights.",
    icon: "insights"
  }
];
---

<CardsSection 
  sectionId="services"
  title="Our Services"
  description="What we offer to help your business grow"
  cards={servicesCards}
  columns="4"
  responsiveColumns={{
    mobile: "1",
    tablet: "2",
    desktop: "4"
  }}
  theme="dark"
  cardTheme="light"
/>
```

### Custom Responsive Grid

```astro
<CardsSection 
  sectionId="custom"
  title="Custom Layout"
  cards={cards}
  responsiveColumns={{
    mobile: "1",    // 1 column on mobile
    tablet: "2",    // 2 columns on tablet
    desktop: "3"    // 3 columns on desktop
  }}
/>
```

### Hero-Style Cards with Left-Big Icons

```astro
---
import CardsSection from '../global/CardsSection.astro';

const heroCards = [
  {
    title: "Next-Generation AI Technology",
    description: "At the heart of our platform is sophisticated artificial intelligence that learns and adapts to your organization's unique requirements.",
    icon: {
      type: "insights",
      alignment: "left-big"
    }
  }
];
---

<CardsSection 
  sectionId="hero-features"
  title="Revolutionary Technology"
  cards={heroCards}
  responsiveColumns={{
    mobile: "1",
    tablet: "1", 
    desktop: "1"
  }}
  theme="dark"
  cardTheme="dark"
/>
```

## Migration Guide

### From Old Components

**Before (FeaturesSection.astro)**:
```astro
<section id="features" class="relative bg-custom-slate py-12">
  <div class="container mx-auto px-4">
    <h2 class="text-3xl font-noto-sans mb-8 text-center text-white">Our Features</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="bg-slate-800 p-6 rounded-lg text-center">
        <span class="material-icons text-blue-400 text-4xl mb-4 block">auto_awesome</span>
        <h3 class="text-xl font-semibold text-white mb-2">AI Innovation</h3>
        <p class="text-gray-300">Cutting-edge AI solutions...</p>
      </div>
      <!-- More cards... -->
    </div>
  </div>
</section>
```

**After**:
```astro
---
import CardsSection from '../global/CardsSection.astro';

const cards = [
  {
    title: "AI Innovation",
    description: "Cutting-edge AI solutions...",
    icon: "auto_awesome"
  }
  // More cards...
];
---

<CardsSection 
  sectionId="features"
  title="Our Features"
  cards={cards}
  columns="3"
  theme="dark"
  cardTheme="dark"
  iconColor="text-blue-400"
/>
```

## Content Collections Integration

The `CardsSection` component automatically integrates with Astro Content Collections for localization:

```yaml
# src/content/languages/en.yaml
sections:
  features:
    title: "Our Features"
    cards:
      - title: "AI Innovation"
        description: "Cutting-edge AI solutions..."
```

## Benefits

✅ **DRY Principle**: No duplicated HTML structure  
✅ **Consistency**: All card sections follow the same patterns  
✅ **Maintainability**: Update styling in one place  
✅ **Flexibility**: Easy to create new card sections  
✅ **Type Safety**: Full TypeScript support  
✅ **Responsive**: Built-in responsive grid system  
✅ **Themes**: Dark and light card themes  
✅ **Localization**: Automatic content collection integration  
✅ **Customization**: Extensive styling options  

## Debug Mode

In development mode, each section shows debug information:

```javascript
{
  "sectionId": "features",
  "sectionType": "features", 
  "title": "Our Features",
  "cardsCount": 3,
  "theme": "dark",
  "cardTheme": "dark",
  "language": "en"
}
```

This helps with troubleshooting and understanding the component configuration.
