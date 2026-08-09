import { HeroLanding } from "@/components/ui/hero-1";
import type { HeroLandingProps } from "@/components/ui/hero-1";

export default function Demo() {
  // Example with all customization props
  const heroProps: HeroLandingProps = {
    // Logo and branding
    logo: {
      src: "https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=violet&shade=500",
      alt: "Acme Corp Logo",
      companyName: "Acme Corp",
    },

    // Navigation
    navigation: [
      { name: "Solutions", href: "/solutions" },
      { name: "Pricing", href: "/pricing" },
      { name: "Resources", href: "/resources" },
      { name: "About", href: "/about" },
      { name: "Contact", href: "/contact" },
    ],
    loginText: "Sign In",
    loginHref: "/login",

    // Hero content
    title: "Transform Your Business with AI-Powered Solutions",
    description:
      "Revolutionize your workflow with our cutting-edge artificial intelligence platform",

    // Announcement banner
    announcementBanner: {
      text: "🎉 New feature release!",
      linkText: "Check out our AI Assistant",
      linkHref: "/features/ai-assistant",
    },

    // Call to action buttons
    callToActions: [
      {
        text: "Start Free Trial",
        href: "/signup",
        variant: "primary",
      },
      {
        text: "Watch Demo",
        href: "/demo",
        variant: "secondary",
      },
    ],

    // Styling options
    titleSize: "large",
    gradientColors: {
      from: "oklch(0.7 0.15 280)", // Purple
      to: "oklch(0.6 0.2 320)", // Magenta
    },

    // Additional customization
    className: "min-h-screen",
  };

  return (
    <div>
      <HeroLanding {...heroProps} />
    </div>
  );
}
