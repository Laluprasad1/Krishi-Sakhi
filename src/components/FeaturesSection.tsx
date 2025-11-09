import { Users, Share2, ShoppingCart, Headphones, CreditCard, GraduationCap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const getFeatures = (t: (key: string) => string) => [
  {
    icon: Users,
    title: t('features.cooperative.title'),
    description: t('features.cooperative.description')
  },
  {
    icon: Share2,
    title: t('features.resources.title'),
    description: t('features.resources.description')
  },
  {
    icon: ShoppingCart,
    title: t('features.market.title'),
    description: t('features.market.description')
  },
  {
    icon: Headphones,
    title: t('features.support.title'),
    description: t('features.support.description')
  },
  {
    icon: CreditCard,
    title: t('features.financial.title'),
    description: t('features.financial.description')
  },
  {
    icon: GraduationCap,
    title: t('features.training.title'),
    description: t('features.training.description')
  }
];

const FeaturesSection = () => {
  const { t } = useLanguage();
  const features = getFeatures(t);

  return (
    <section id="features" className="py-20 bg-farming-gradient">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('features.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('features.subtitle')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="farming-card hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="farming-card inline-block">
            <p className="text-foreground mb-4">
              Ready to transform your farming experience?
            </p>
            <button className="farming-button-primary px-8 py-3 rounded-lg font-medium">
              Start Using Krishi Sakhi
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;