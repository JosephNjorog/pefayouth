import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { features, cellGroups } from '@/data/publicPageData';
import churchHero from '@/assets/church-hero.jpg';

import youthCommunityImg from '@/assets/youth-community.jpg';
import eventsRetreatsImg from '@/assets/events-retreats.jpg';
import sermonsMediaImg from '@/assets/sermons-media.jpg';
import growFaithImg from '@/assets/grow-faith.jpg';
import fishersImg from '@/assets/fishers-of-men.jpg';
import oneMoreSoulImg from '@/assets/one-more-soul.jpg';
import byGraceImg from '@/assets/by-grace.jpg';
import youthsImg from '@/assets/youths-group.jpg';

const featureImages: Record<string, string> = {
  'youth-community': youthCommunityImg,
  'events-retreats': eventsRetreatsImg,
  'sermons-media': sermonsMediaImg,
  'grow-in-faith': growFaithImg,
};

const groupImages: Record<string, string> = {
  'youths': youthsImg,
  'fishers-of-men': fishersImg,
  'one-more-soul': oneMoreSoulImg,
  'by-grace': byGraceImg,
};

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={churchHero} alt="Youth worship" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-church-teal-dark/90 via-church-teal-dark/70 to-church-teal-dark/50" />
        </div>
        <div className="relative container max-w-6xl mx-auto px-4 py-24 sm:py-32 lg:py-40">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >
            <Badge className="bg-accent/20 text-accent border-accent/30 mb-4 text-xs">
              Welcome to PEFA Youth
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground leading-tight mb-4">
              Empowering Youth Through{' '}
              <span className="text-accent">Faith & Fellowship</span>
            </h1>
            <p className="text-base sm:text-lg text-primary-foreground/80 leading-relaxed mb-8 max-w-xl">
              A vibrant community of young believers growing together in Christ. Join us for worship, events, and life-changing experiences.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm gradient-gold text-accent-foreground shadow-gold hover:shadow-lg transition-all"
              >
                Learn About Us <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-primary-foreground/10 text-primary-foreground border border-primary-foreground/20 hover:bg-primary-foreground/20 transition-all"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What We're About - Clickable Cards */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">What We're About</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Building the next generation of leaders through faith, community, and purpose.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={`/about/${feature.slug}`}>
                  <Card className="h-full text-center border-border/50 hover:shadow-church transition-all group cursor-pointer overflow-hidden">
                    <div className="h-36 overflow-hidden">
                      <img
                        src={featureImages[feature.slug]}
                        alt={feature.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="pt-5">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 -mt-8 relative z-10 border-2 border-background">
                        <feature.icon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{feature.description}</p>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-primary mt-3 group-hover:underline">
                        Learn more <ArrowRight className="w-3 h-3" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cell Groups */}
      <section className="py-16 sm:py-20 bg-muted/50">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Our Cell Groups</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              We grow together in smaller families within the larger body. Find your home in one of our vibrant cell groups.
            </p>
          </div>

          {/* Youths - Featured Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <Link to={`/cell-groups/${cellGroups[0].slug}`}>
              <Card className="overflow-hidden hover:shadow-church transition-all group cursor-pointer">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="h-56 md:h-auto overflow-hidden">
                    <img
                      src={groupImages[cellGroups[0].slug]}
                      alt={cellGroups[0].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="flex flex-col justify-center py-8">
                    <Badge className="bg-primary/10 text-primary border-primary/20 w-fit mb-3 text-xs">
                      {cellGroups[0].tagline}
                    </Badge>
                    <h3 className="text-xl sm:text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {cellGroups[0].title}
                    </h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {cellGroups[0].description}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:underline">
                      Discover Youths <ArrowRight className="w-4 h-4" />
                    </span>
                  </CardContent>
                </div>
              </Card>
            </Link>
          </motion.div>

          {/* Other Cell Groups */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {cellGroups.slice(1).map((group, i) => (
              <motion.div
                key={group.slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={`/cell-groups/${group.slug}`}>
                  <Card className="h-full hover:shadow-church transition-all group cursor-pointer overflow-hidden">
                    <div className="h-40 overflow-hidden">
                      <img
                        src={groupImages[group.slug]}
                        alt={group.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="pt-5">
                      <Badge variant="secondary" className="text-xs mb-2">{group.tagline}</Badge>
                      <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{group.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{group.description}</p>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-primary mt-3 group-hover:underline">
                        Learn more <ArrowRight className="w-3 h-3" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 gradient-hero">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-primary-foreground mb-4">Ready to Join Our Community?</h2>
            <p className="text-primary-foreground/80 max-w-lg mx-auto mb-8">
              Sign in to access your member dashboard, register for events, and connect with fellow youth.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm gradient-gold text-accent-foreground shadow-gold hover:shadow-lg transition-all"
            >
              Sign In Now <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
