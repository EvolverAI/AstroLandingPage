# ProductSection Component Documentation

## Overview

The `ProductSection` component is a reusable component for creating product showcase sections with flexible image/text layouts. It replaces the individual `ProductWFMSection` and `ProductElysiaSection` components with a single, configurable component.

## Component Location

```
src/components/global/ProductSection.astro
```

## Key Features

✅ **Flexible Layout**: Image can be positioned left or right  
✅ **Multiple Visual Types**: Supports images, icons, or fallback visuals  
✅ **Feature Lists**: Built-in support for feature lists with icons  
✅ **Responsive Design**: Mobile-first responsive layout  
✅ **Customizable Styling**: Colors, buttons, and spacing options  
✅ **Localization Ready**: Content Collections integration  
✅ **Type Safe**: Full TypeScript support  

## Basic Usage

```astro
---
import ProductSection from '../global/ProductSection.astro';

const sectionProps = {
  sectionId: "my-product",
  title: "My Product",
  subtitle: "Amazing Solution",
  description: "Product description here...",
  imagePosition: "right"
};
---

<ProductSection {...sectionProps} />
```

## Props Reference

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `sectionId` | `string` | HTML id for the section |
| `title` | `string` | Main section title |
| `subtitle` | `string` | Product/feature subtitle |
| `description` | `string` | Product description text |

### Layout Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `imagePosition` | `string` | `"right"` | `"left"` or `"right"` |
| `backgroundColor` | `string` | `"bg-custom-slate"` | Background color class |
| `textColor` | `string` | `"text-gray-300"` | Text color class |

### Visual Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `image` | `string` | Optional | Image path (e.g., "/img/logo.png") |
| `imageAlt` | `string` | `""` | Image alt text |
| `imageClasses` | `string` | `"max-w-md mx-auto"` | CSS classes for image |
| `useIconInstead` | `boolean` | `false` | Use icon instead of image |
| `iconName` | `string` | `"smart_toy"` | Material Icons name |
| `iconGradient` | `string` | `"from-purple-600 to-blue-600"` | Gradient classes |

### Content Props

| Prop | Type | Description |
|------|------|-------------|
| `features` | `FeatureItem[]` | Array of features to display |
| `buttonText` | `string` | Button text |
| `buttonUrl` | `string` | Button URL |
| `buttonColor` | `string` | Button color classes |

### FeatureItem Interface

```typescript
interface FeatureItem {
  text: string;
  icon?: string;        // Material Icons name
  iconColor?: string;   // CSS color class
}
```

## Examples

### Image on Right (Default Layout)

```astro
---
import ProductSection from '../global/ProductSection.astro';

const features = [
  {
    text: "Intelligent Scheduling & Resource Allocation",
    icon: "check_circle",
    iconColor: "text-green-400"
  },
  {
    text: "Real-time Performance Analytics",
    icon: "check_circle", 
    iconColor: "text-green-400"
  }
];

const sectionProps = {
  sectionId: "product_wfm",
  title: "Workforce Management Solutions",
  subtitle: "Infinite Workforce",
  description: "Revolutionary workforce management platform that optimizes scheduling...",
  features: features,
  buttonText: "Explore WFM Solutions",
  buttonUrl: "/wfm",
  buttonColor: "bg-blue-600 hover:bg-blue-700",
  image: "/img/InfiniteWorkforceLogo.png",
  imageAlt: "Infinite Workforce Logo",
  imagePosition: "right" // Text left, image right
};
---

<ProductSection {...sectionProps} />
```

### Icon on Left

```astro
---
const sectionProps = {
  sectionId: "product_elysia",
  title: "Elysia AI Assistant", 
  subtitle: "Intelligent AI Assistant",
  description: "Meet Elysia, your intelligent AI assistant...",
  features: [
    {
      text: "Natural Language Processing",
      icon: "psychology",
      iconColor: "text-purple-400"
    },
    {
      text: "Advanced Conversational AI",
      icon: "chat",
      iconColor: "text-purple-400"
    }
  ],
  buttonText: "Discover Elysia",
  buttonUrl: "/elysia",
  buttonColor: "bg-purple-600 hover:bg-purple-700",
  useIconInstead: true,
  iconName: "smart_toy",
  iconGradient: "from-purple-600 to-blue-600",
  imagePosition: "left" // Icon left, text right
};
---

<ProductSection {...sectionProps} />
```

### Minimal Configuration

```astro
---
const sectionProps = {
  sectionId: "simple-product",
  title: "Simple Product",
  subtitle: "Basic Solution",
  description: "A simple product without features or buttons.",
  imagePosition: "right"
};
---

<ProductSection {...sectionProps} />
```

## Layout Behavior

### Image Position: "right" (Default)
```
[Text Content]    [Image/Icon]
- Title           - Logo/Icon
- Subtitle        - Visual
- Description     
- Features
- Button
```

### Image Position: "left"
```
[Image/Icon]      [Text Content]
- Logo/Icon       - Title
- Visual          - Subtitle
                  - Description
                  - Features  
                  - Button
```

## Visual Types

### 1. Image
```astro
<ProductSection 
  image="/img/logo.png"
  imageAlt="Company Logo"
  imageClasses="max-w-sm"
/>
```

### 2. Icon with Gradient
```astro
<ProductSection 
  useIconInstead={true}
  iconName="smart_toy"
  iconGradient="from-blue-500 to-purple-600"
/>
```

### 3. Fallback (when no image or icon)
Automatically shows a placeholder icon.

## Responsive Behavior

- **Mobile**: Single column, image/icon above text
- **Tablet & Desktop**: Two-column grid with configured positioning
- **Image Sizing**: Responsive with max-width constraints

## Customization Options

### Colors
```astro
<ProductSection 
  backgroundColor="bg-gray-900"
  textColor="text-gray-100"
  buttonColor="bg-green-600 hover:bg-green-700"
/>
```

### Features with Custom Icons
```astro
const features = [
  { text: "Feature 1", icon: "star", iconColor: "text-yellow-400" },
  { text: "Feature 2", icon: "favorite", iconColor: "text-red-400" },
  { text: "Feature 3", icon: "thumb_up", iconColor: "text-blue-400" }
];
```

## Migration Guide

### From ProductWFMSection

**Before**:
```astro
<section id="product_wfm" class="relative bg-custom-slate py-12">
  <div class="container mx-auto px-4">
    <h2 class="text-3xl font-noto-sans mb-8 text-center text-white">Workforce Management Solutions</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      <div>
        <h3 class="text-2xl font-semibold text-blue-400 mb-4">Infinite Workforce</h3>
        <!-- More content... -->
      </div>
      <div class="text-center">
        <img src="/img/InfiniteWorkforceLogo.png" alt="Infinite Workforce Logo" class="max-w-md mx-auto">
      </div>
    </div>
  </div>
</section>
```

**After**:
```astro
<ProductSection 
  sectionId="product_wfm"
  title="Workforce Management Solutions"
  subtitle="Infinite Workforce"
  description="Revolutionary workforce management platform..."
  image="/img/InfiniteWorkforceLogo.png"
  imagePosition="right"
  features={wfmFeatures}
  buttonText="Explore WFM Solutions"
  buttonUrl="/wfm"
/>
```

## Content Collections Integration

The component supports localization through Astro Content Collections:

```yaml
# src/content/languages/en.yaml
sections:
  product_wfm:
    title: "Workforce Management Solutions"
    subtitle: "Infinite Workforce"
    description: "Revolutionary workforce management platform..."
    buttonText: "Explore WFM Solutions"
    features:
      - text: "Intelligent Scheduling"
        icon: "check_circle"
        iconColor: "text-green-400"
```

## Benefits

✅ **DRY Principle**: Eliminates code duplication  
✅ **Consistency**: Uniform styling and behavior  
✅ **Flexibility**: Easy to create new product sections  
✅ **Maintainability**: Single component to update  
✅ **Responsive**: Built-in mobile optimization  
✅ **Accessible**: Proper semantic HTML structure  
✅ **Customizable**: Extensive styling options  

## Debug Mode

In development, shows debug information including:
- Section configuration
- Image/icon settings
- Feature count
- Language settings
