import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { features } from '@/data/publicPageData';

const featureImages: Record<string, string> = {
  'youth-community': '/images/herobg.jpg',
  'events-retreats': 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&q=80',
  'sermons-media':   'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=1200&q=80',
  'grow-in-faith':   '/images/IMG_20250209_131746.jpg',
};

const FeatureDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const feature = features.find((f) => f.slug === slug);

  if (!feature) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
          <Link to="/" className="text-primary hover:underline">Go back home</Link>
        </div>
      </div>
    );
  }

  const Icon = feature.icon;
  const heroImage = featureImages[feature.slug];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt={feature.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-church-teal-dark/90 via-church-teal-dark/75 to-church-teal-dark/50" />
        </div>
        <div className="relative container max-w-6xl mx-auto px-4 py-20 sm:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-primary-foreground/70 hover:text-primary-foreground mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl gradient-gold flex items-center justify-center">
                <Icon className="w-6 h-6 text-accent-foreground" />
              </div>
              <Badge className="bg-accent/20 text-accent border-accent/30 text-xs">{feature.title}</Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground leading-tight mb-4">
              {feature.title}
            </h1>
            <p className="text-base sm:text-lg text-primary-foreground/80 leading-relaxed">
              {feature.heroDescription}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold mb-6">What to Expect</h2>
              <div className="space-y-4">
                {feature.highlights.map((highlight, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <p className="text-muted-foreground">{highlight}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="border-border/50 overflow-hidden">
                <img src={heroImage} alt={feature.title} className="w-full h-56 object-cover" />
                <CardContent className="pt-6">
                  <blockquote className="italic text-muted-foreground border-l-4 border-primary pl-4 text-sm leading-relaxed">
                    {feature.quote}
                  </blockquote>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 gradient-hero">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-primary-foreground mb-4">Want to Be Part of This?</h2>
            <p className="text-primary-foreground/80 max-w-lg mx-auto mb-8">
              Create your free account to get connected, join activities, and stay updated.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm gradient-gold text-accent-foreground shadow-gold hover:shadow-lg transition-all"
              >
                Join Us <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm bg-primary-foreground/10 text-primary-foreground border border-primary-foreground/20 hover:bg-primary-foreground/20 transition-all"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default FeatureDetail;
