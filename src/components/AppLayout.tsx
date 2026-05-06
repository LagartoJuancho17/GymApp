import React, { useState } from 'react';
import { Home, Dumbbell, BarChart2, PlusCircle, User } from 'lucide-react';
import { Dashboard } from './Dashboard';
import { RoutinesScreen } from './RoutinesScreen';
import { StatsScreen } from './StatsScreen';
import { ProfileScreen } from './ProfileScreen';
import { OnboardingScreen } from './OnboardingScreen';
import { LoginScreen } from './LoginScreen';
import { AppProvider, useAppContext } from '../store';
import { Toaster, toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

import { GlobalActiveTrainingWidget } from './GlobalActiveTrainingWidget';

export type ScreenType = 'home' | 'routines' | 'stats' | 'profile';

function AppContent() {
  const [activeScreen, setActiveScreen] = useState<ScreenType>('home');
  const { user, isLoadingAuth, hasCompletedOnboarding } = useAppContext();

  if (isLoadingAuth) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gym-dark text-white">
        <div className="w-10 h-10 border-4 border-gym-lime border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400">Conectando...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  if (!hasCompletedOnboarding) {
    return <OnboardingScreen />;
  }

  // Animation variants
  const fadeInVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -15 },
  };

  const handleNavClick = (screen: ScreenType) => {
    if (navigator.vibrate) navigator.vibrate(30);
    setActiveScreen(screen);
  };

  return (
    <>
      <Toaster theme="dark" position="top-center" />
      {/* Dynamic Display */}
      <div className="flex-1 overflow-hidden relative flex flex-col hide-scrollbar bg-gym-dark">
        <AnimatePresence mode="wait">
          {activeScreen === 'home' && (
            <motion.div key="home" variants={fadeInVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }} className="flex-1 overflow-hidden relative flex flex-col hide-scrollbar">
              <Dashboard />
            </motion.div>
          )}
          {activeScreen === 'routines' && (
            <motion.div key="routines" variants={fadeInVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }} className="flex-1 overflow-hidden relative flex flex-col hide-scrollbar">
              <RoutinesScreen />
            </motion.div>
          )}
          {activeScreen === 'stats' && (
            <motion.div key="stats" variants={fadeInVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }} className="flex-1 overflow-hidden relative flex flex-col hide-scrollbar">
              <StatsScreen />
            </motion.div>
          )}
          {activeScreen === 'profile' && (
            <motion.div key="profile" variants={fadeInVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }} className="flex-1 overflow-hidden relative flex flex-col hide-scrollbar">
              <ProfileScreen />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Floating Bottom Navigation */}
      <div className="bg-gym-dark pt-2 pb-6 px-6 z-50 relative">
        <nav className="bg-[#1C1C24] rounded-[30px] px-6 py-4 flex justify-between items-center border border-white/10 shadow-2xl">
          <button 
            onClick={() => handleNavClick('home')}
            className={`relative transition-colors ${activeScreen === 'home' ? 'text-white' : 'text-gray-500 hover:text-white'}`}
          >
            {activeScreen === 'home' && <motion.div layoutId="nav-glow" className="absolute inset-0 w-10 h-10 bg-gym-lime -z-10 rounded-full opacity-40 blur-md"></motion.div>}
            <Home size={28} strokeWidth={activeScreen === 'home' ? 2.5 : 2} />
          </button>
          <button 
            onClick={() => handleNavClick('routines')}
            className={`relative transition-colors ${activeScreen === 'routines' ? 'text-white' : 'text-gray-500 hover:text-white'}`}
          >
            {activeScreen === 'routines' && <motion.div layoutId="nav-glow" className="absolute inset-0 w-10 h-10 bg-gym-purple -z-10 rounded-full opacity-40 blur-md"></motion.div>}
            <Dumbbell size={28} strokeWidth={activeScreen === 'routines' ? 2.5 : 2} />
          </button>
          <button 
            onClick={() => handleNavClick('stats')}
            className={`relative transition-colors ${activeScreen === 'stats' ? 'text-white' : 'text-gray-500 hover:text-white'}`}
          >
            {activeScreen === 'stats' && <motion.div layoutId="nav-glow" className="absolute inset-0 w-10 h-10 bg-gym-lime -z-10 rounded-full opacity-40 blur-md"></motion.div>}
            <BarChart2 size={28} strokeWidth={activeScreen === 'stats' ? 2.5 : 2} />
          </button>
          <button 
            onClick={() => handleNavClick('profile')}
            className={`relative transition-colors ${activeScreen === 'profile' ? 'text-white' : 'text-gray-500 hover:text-white'}`}
          >
            {activeScreen === 'profile' && <motion.div layoutId="nav-glow" className="absolute inset-0 w-10 h-10 bg-gym-purple -z-10 rounded-full opacity-40 blur-md"></motion.div>}
            <User size={28} strokeWidth={activeScreen === 'profile' ? 2.5 : 2} />
          </button>
        </nav>
      </div>
      <GlobalActiveTrainingWidget />
    </>
  );
}

export function AppLayout() {
  return (
    <AppProvider>
      <div className="w-full max-w-[414px] h-[100dvh] bg-gym-dark relative flex flex-col shadow-2xl overflow-hidden mx-auto sm:border-x sm:border-neutral-900">
        <AppContent />
      </div>
    </AppProvider>
  );
}
