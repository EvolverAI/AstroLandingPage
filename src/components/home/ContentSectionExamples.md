# ContentSection Component Usage Examples

The `ContentSection` component is a reusable component that can replace `AboutSection`, `BrainstormingSection`, and `ContactSection`. Here are examples of how to use it:

## Basic Usage

```astro
---
import ContentSection from '../global/ContentHeaderSection.astro';
---

<ContentSection 
  sectionId="about"
  content="Your content here..."
  backgroundImage="/img/your-background.jpg"
/>
```

## About Section Example

```astro
<ContentSection 
  sectionId="about"
  sectionType="about"
  content="At EvolverAI, we specialize in developing smart, innovative solutions..."
  backgroundImage="/img/evolverai-web-company-bg.jpg"
  minHeight="600px"
  backgroundOpacity="bg-opacity-10"
  contentOpacity="bg-opacity-75"
  maxWidth="max-w-lg"
  textAlign="text-right"
  contentPosition="justify-end"
  companyName="Evolver"
  companyNameHighlight="AI"
/>
```

## Contact Section Example (with heading and button)

```astro
<ContentSection 
  sectionId="contact"
  sectionType="contact"
  heading="Contact Us"
  content="Have questions or want to learn more? Reach out to us..."
  buttonText="Get in Touch"
  buttonAction="window.location.href='/contact';"
  backgroundImage="/img/evolverai-web-contact-bg.jpg"
  maxWidth="max-w-md"
  textAlign="text-right"
  contentPosition="justify-end"
/>
```

## Custom Styling Example

```astro
<ContentSection 
  sectionId="custom"
  content="Your custom content..."
  backgroundImage="/img/custom-bg.jpg"
  minHeight="800px"
  backgroundOpacity="bg-opacity-20"
  contentOpacity="bg-opacity-90"
  maxWidth="max-w-2xl"
  textAlign="text-center"
  contentPosition="justify-center"
/>
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `sectionId` | `string` | Required | HTML id for the section |
| `sectionType` | `string` | `sectionId` | Used for localization lookup |
| `content` | `string` | Required | Main text content |
| `heading` | `string` | Optional | Section heading (h2) |
| `buttonText` | `string` | Optional | Button text |
| `buttonAction` | `string` | Optional | Button onclick action |
| `backgroundImage` | `string` | Required | Background image URL |
| `minHeight` | `string` | `"600px"` | Minimum section height |
| `backgroundOpacity` | `string` | `"bg-opacity-10"` | Overlay opacity |
| `contentOpacity` | `string` | `"bg-opacity-75"` | Content box opacity |
| `maxWidth` | `string` | `"max-w-lg"` | Content box max width |
| `textAlign` | `string` | `"text-right"` | Text alignment |
| `contentPosition` | `string` | `"justify-end"` | Content box position |
| `companyName` | `string` | `"Evolver"` | Company name for highlighting |
| `companyNameHighlight` | `string` | `"AI"` | Part to highlight in blue |
| `language` | `string` | `"en"` | Language for localization |
| `environment` | `string` | `"production"` | Environment setting |

## Benefits of This Refactor

1. **DRY Principle**: No code duplication across similar sections
2. **Consistency**: All sections follow the same structure and styling patterns
3. **Maintainability**: Changes to the layout only need to be made in one place
4. **Flexibility**: Easy to create new sections with different content and styling
5. **Localization**: Built-in support for multiple languages
6. **Content Management**: Integrates with Astro Content Collections
7. **Developer Experience**: Debug mode shows section information during development
