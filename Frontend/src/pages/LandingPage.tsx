import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const LandingPage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate a loading state
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse-gentle">
          <div className="h-12 w-48 bg-primary/20 rounded-lg mb-8"></div>
          <div className="h-4 w-72 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-hidden">
      {/* Top Nav */}
      <header className="w-full flex justify-end p-6">
        <Button asChild variant="outline" size="sm" className="text-base px-4 py-2">
          <Link to="/login">Login</Link>
        </Button>
      </header>

      {/* Hero Section */}
      <section className="py-2 px-6 flex flex-col items-center justify-start text-center min-h-[80vh]">
        <motion.div
          className="max-w-3xl mx-auto mt-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Home Page Image */}
          <motion.div
            className="mb-2"
            variants={itemVariants}
          >
            <img
              src="/icons/home page.png"
              alt="One Reward Home"
              className="mx-auto max-w-full h-auto max-h-96 object-contain"
            />
          </motion.div>

          {/* Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            variants={itemVariants}
          >
            <Button asChild size="lg" className="text-base px-8 py-6">
              <Link to="/register">Sign Up</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base px-8 py-6">
              <Link to="/login">Login</Link>
            </Button>
          </motion.div>

          {/* Text Content */}
          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-6 tracking-tight"
            variants={itemVariants}
          >
            The Ultimate Loyalty<br />
            <span className="text-primary">Management Platform</span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            A comprehensive suite of apps for restaurants, admins, and customers to manage loyalty programs with ease.
          </motion.p>


        </motion.div>
      </section>
    </div>
  );
};

export default LandingPage;
