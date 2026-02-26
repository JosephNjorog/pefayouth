import { motion } from 'framer-motion';
import { Heart, Eye, Target, BookOpen, Users, Handshake, Sparkles, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const coreValues = [
  { icon: BookOpen, title: 'Word-Centered', description: 'We anchor every activity and decision in the truth of God\'s Word.' },
  { icon: Users, title: 'Community', description: 'We believe in doing life together — growing, serving, and worshipping as one body.' },
  { icon: Heart, title: 'Love & Grace', description: 'We welcome everyone with open arms, creating a safe space for all youth to belong.' },
  { icon: Handshake, title: 'Service', description: 'We serve our community and the world with humility, compassion, and generosity.' },
  { icon: Sparkles, title: 'Excellence', description: 'We honor God by giving our best in worship, leadership, and every area of ministry.' },
  { icon: Shield, title: 'Integrity', description: 'We live transparently and accountably, reflecting Christ in all we do.' },
];

const leadershipTeam = [
  { name: 'Pastor Daniel Mutua', role: 'Senior Youth Pastor', description: 'Leading our youth ministry with vision and passion for over 10 years.' },
  { name: 'Rev. Mary Wambui', role: 'Associate Pastor', description: 'Guiding spiritual growth and discipleship programs for young believers.' },
  { name: 'Bishop James Karanja', role: 'Founding Pastor', description: 'The visionary behind YouthConnect, championing youth empowerment since 2015.' },
];

const About = () => {
  return (
    <div>
      {/* Hero */}
      <section className="gradient-hero py-16 sm:py-24">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">About YouthConnect</h1>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              We are a vibrant community of young believers passionate about knowing God, growing in faith, and making a difference in the world around us.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Who We Are</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  YouthConnect is the youth ministry arm of our church, dedicated to raising a generation that knows Christ and walks in His purpose. Founded in 2015, we have grown from a small group of 20 young people to a thriving community of over 200 members.
                </p>
                <p>
                  We meet every Sunday for worship, have weekly fellowship gatherings on Fridays, and organize life-changing retreats and camps throughout the year. Our cell groups provide intimate spaces for discipleship and accountability.
                </p>
                <p>
                  Through our community outreach programs, we serve the underprivileged in Nairobi and beyond, putting our faith into action. Every member is encouraged to discover their gifts and use them to serve God and the community.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              <Card className="bg-primary/5 border-primary/10">
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-primary">200+</p>
                  <p className="text-sm text-muted-foreground mt-1">Active Members</p>
                </CardContent>
              </Card>
              <Card className="bg-accent/5 border-accent/10">
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-accent">8</p>
                  <p className="text-sm text-muted-foreground mt-1">Cell Groups</p>
                </CardContent>
              </Card>
              <Card className="bg-accent/5 border-accent/10">
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-accent">5</p>
                  <p className="text-sm text-muted-foreground mt-1">Ministry Teams</p>
                </CardContent>
              </Card>
              <Card className="bg-primary/5 border-primary/10">
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-primary">10+</p>
                  <p className="text-sm text-muted-foreground mt-1">Years of Impact</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 sm:py-20 bg-muted/50">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-primary/20 shadow-church">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center mb-4">
                    <Target className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Our Mission</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    To empower young people to discover and fulfill their God-given purpose through authentic worship, discipleship, community, and service. We are committed to raising leaders who will transform their generation and beyond.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Card className="h-full border-accent/20 shadow-gold">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-2xl gradient-gold flex items-center justify-center mb-4">
                    <Eye className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Our Vision</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    To be the most vibrant and impactful youth ministry in the region — a place where every young person encounters God, finds belonging, and is equipped to be a light in their schools, workplaces, and communities.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Our Core Values</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              These values guide everything we do as a youth community.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreValues.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="h-full hover:shadow-church transition-shadow">
                  <CardContent className="pt-6">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                      <value.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-16 sm:py-20 bg-muted/50">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Our Leadership</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Meet the team shepherding our youth community.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {leadershipTeam.map((leader, i) => (
              <motion.div
                key={leader.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="text-center hover:shadow-church transition-shadow">
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
                      <span className="text-lg font-bold text-primary-foreground">
                        {leader.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <h3 className="font-semibold">{leader.name}</h3>
                    <p className="text-xs text-primary font-medium mt-0.5">{leader.role}</p>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{leader.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
