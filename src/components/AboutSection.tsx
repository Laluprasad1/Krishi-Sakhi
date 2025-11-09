import { Target, Heart, Users, Award, Leaf, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";

const AboutSection = () => {
  const { t } = useLanguage();

  const stats = [
    { icon: Users, value: "10,000+", label: t('about.stats.farmers') },
    { icon: Leaf, value: "500+", label: t('about.stats.crops') },
    { icon: TrendingUp, value: "85%", label: t('about.stats.yield') },
    { icon: Award, value: "50+", label: t('about.stats.awards') }
  ];

  const values = [
    {
      icon: Target,
      title: t('about.values.mission.title'),
      description: t('about.values.mission.description')
    },
    {
      icon: Heart,
      title: t('about.values.vision.title'),
      description: t('about.values.vision.description')
    },
    {
      icon: Users,
      title: t('about.values.community.title'),
      description: t('about.values.community.description')
    }
  ];

  return (
    <section id="about" className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('about.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t('about.subtitle')}
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12 md:gap-16 items-center mb-16 md:mb-20">
          {/* About Content */}
          <div className="space-y-6">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground">
              {t('about.content.heading')}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {t('about.content.description1')}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {t('about.content.description2')}
            </p>
            <div className="pt-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                <span>{t('about.content.feature1')}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                <span>{t('about.content.feature2')}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                <span>{t('about.content.feature3')}</span>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4 md:gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="farming-card text-center">
                <CardContent className="p-4 md:p-6">
                  <stat.icon className="h-8 w-8 md:h-10 md:w-10 text-primary mx-auto mb-3" />
                  <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Values Section */}
        <div className="space-y-8">
          <div className="text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              {t('about.values.title')}
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('about.values.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {values.map((value, index) => (
              <Card key={index} className="farming-card text-center">
                <CardContent className="p-6">
                  <value.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-foreground mb-3">
                    {value.title}
                  </h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
