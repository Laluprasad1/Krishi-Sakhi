import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'ml';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.features': 'Features',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.chat': 'Chat Support',
    
    // Hero Section
    'hero.title': 'Empowering Farmers Through Digital Connection',
    'hero.subtitle': 'Connect with agricultural cooperatives, access resources, and grow your farming business with our comprehensive platform.',
    'hero.cta': 'Start Your Journey',
    'hero.back': '← Back to Home',
    
    // Features Section
    'features.title': 'Why Choose Krishi Sahakari Connect?',
    'features.subtitle': 'Discover the powerful features that make farming collaboration easier and more profitable.',
    
    'features.cooperative.title': 'Cooperative Network',
    'features.cooperative.description': 'Connect with local agricultural cooperatives and join a community of farmers working together for mutual success.',
    
    'features.resources.title': 'Resource Sharing',
    'features.resources.description': 'Access shared agricultural resources, equipment, and knowledge to optimize your farming operations.',
    
    'features.market.title': 'Market Access',
    'features.market.description': 'Get better prices for your produce through collective bargaining and direct market connections.',
    
    'features.support.title': '24/7 Support',
    'features.support.description': 'Round-the-clock assistance and expert guidance to help you make informed farming decisions.',
    
    'features.financial.title': 'Financial Services',
    'features.financial.description': 'Access micro-loans, insurance, and financial planning services tailored for agricultural needs.',
    
    'features.training.title': 'Training Programs',
    'features.training.description': 'Participate in skill development programs and learn modern farming techniques from experts.',
    
    // Chat Interface
    'chat.title': 'Chat with Krishi Sahakari Assistant',
    'chat.subtitle': 'Ask questions about farming, cooperatives, or get guidance on agricultural practices.',
    'chat.placeholder': 'Type your message here...',
    'chat.send': 'Send',
    'chat.welcome': 'Welcome! How can I help you with your farming needs today?',
    
    // Authentication
    'auth.login': 'Login',
    'auth.signup': 'Sign Up',
    'auth.logout': 'Logout',
    'auth.loginWithGoogle': 'Continue with Google',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.name': 'Full Name',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.dontHaveAccount': "Don't have an account?",
    'auth.alreadyHaveAccount': 'Already have an account?',
    'auth.verifyEmail': 'Verify Your Email',
    'auth.verificationSent': 'Verification email sent! Please check your inbox.',
    'auth.resendVerification': 'Resend Verification Email',
    'auth.emailNotVerified': 'Please verify your email address to continue.',
    
    // Auth Errors
    'auth.error.userNotFound': 'No user found with this email address.',
    'auth.error.wrongPassword': 'Incorrect password. Please try again.',
    'auth.error.emailInUse': 'This email is already registered. Please sign in instead.',
    'auth.error.weakPassword': 'Password should be at least 6 characters long.',
    'auth.error.invalidEmail': 'Please enter a valid email address.',
    'auth.error.tooManyRequests': 'Too many failed attempts. Please try again later.',
    'auth.error.networkError': 'Network error. Please check your internet connection.',
    'auth.error.popupClosed': 'Sign-in popup was closed. Please try again.',
    
    // About Section
    'about.title': 'About Krishi Sahakari Connect',
    'about.subtitle': 'Empowering farmers through technology-driven cooperative solutions for sustainable agriculture and community growth.',
    'about.content.heading': 'Transforming Agriculture Through Digital Innovation',
    'about.content.description1': 'Krishi Sahakari Connect is a comprehensive digital platform designed to bridge the gap between farmers and agricultural cooperatives. Our mission is to create a sustainable ecosystem where farmers can access resources, knowledge, and markets more efficiently.',
    'about.content.description2': 'With cutting-edge technology and deep understanding of agricultural challenges, we provide tools that enhance productivity, reduce costs, and improve the overall farming experience. Join thousands of farmers who are already transforming their agricultural practices.',
    'about.content.feature1': 'AI-powered crop management and yield prediction',
    'about.content.feature2': 'Real-time market prices and weather updates',
    'about.content.feature3': 'Direct access to government schemes and subsidies',
    'about.stats.farmers': 'Active Farmers',
    'about.stats.crops': 'Crop Varieties Supported',
    'about.stats.yield': 'Average Yield Increase',
    'about.stats.awards': 'Industry Awards',
    'about.values.title': 'Our Core Values',
    'about.values.subtitle': 'The principles that guide everything we do for the farming community.',
    'about.values.mission.title': 'Our Mission',
    'about.values.mission.description': 'To democratize access to agricultural resources and knowledge, empowering every farmer to achieve sustainable prosperity.',
    'about.values.vision.title': 'Our Vision',
    'about.values.vision.description': 'A world where technology serves agriculture, creating resilient farming communities and food security for all.',
    'about.values.community.title': 'Community First',
    'about.values.community.description': 'We believe in the power of collective growth, where every farmer\'s success contributes to the entire community\'s prosperity.',

    // Contact Section
    'contact.title': 'Get In Touch With Us',
    'contact.subtitle': 'Have questions or need support? We\'re here to help you succeed in your farming journey.',
    'contact.info.title': 'Contact Information',
    'contact.info.description': 'Reach out to us through any of the following channels. Our team is always ready to assist you.',
    'contact.info.email.title': 'Email Support',
    'contact.info.email.description': 'Send us your queries anytime',
    'contact.info.phone.title': 'Phone Support',
    'contact.info.phone.description': 'Talk to our experts directly',
    'contact.info.address.title': 'Office Address',
    'contact.info.address.description': 'Visit us at our headquarters',
    'contact.info.hours.title': 'Business Hours',
    'contact.info.hours.description': 'When we\'re available to help',
    'contact.form.title': 'Send us a Message',
    'contact.form.description': 'Fill out the form below and we\'ll get back to you as soon as possible.',
    'contact.form.name': 'Full Name',
    'contact.form.namePlaceholder': 'Enter your full name',
    'contact.form.email': 'Email Address',
    'contact.form.emailPlaceholder': 'Enter your email address',
    'contact.form.subject': 'Subject',
    'contact.form.subjectPlaceholder': 'What is this regarding?',
    'contact.form.message': 'Message',
    'contact.form.messagePlaceholder': 'Tell us how we can help you...',
    'contact.form.send': 'Send Message',
    'contact.form.sending': 'Sending...',
    'contact.form.success': 'Thank you! Your message has been sent successfully.',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Something went wrong. Please try again.',
    'common.success': 'Success!',
    'common.cancel': 'Cancel',
    'common.continue': 'Continue',
  },
  ml: {
    // Navigation
    'nav.home': 'ഹോം',
    'nav.features': 'സവിശേഷതകൾ',
    'nav.about': 'കുറിച്ച്',
    'nav.contact': 'ബന്ധപ്പെടുക',
    'nav.chat': 'ചാറ്റ് സപ്പോർട്ട്',
    
    // Hero Section
    'hero.title': 'ഡിജിറ്റൽ കണക്ഷനിലൂടെ കർഷകരെ ശാക്തീകരിക്കുന്നു',
    'hero.subtitle': 'കാർഷിക സഹകരണ സംഘങ്ങളുമായി ബന്ധപ്പെടുക, വിഭവങ്ങൾ ലഭിക്കുക, ഞങ്ങളുടെ സമഗ്ര പ്ലാറ്റ്‌ഫോം ഉപയോഗിച്ച് നിങ്ങളുടെ കാർഷിക ബിസിനസ് വളർത്തുക.',
    'hero.cta': 'നിങ്ങളുടെ യാത്ര ആരംഭിക്കുക',
    'hero.back': '← ഹോമിലേക്ക് മടങ്ങുക',
    
    // Features Section
    'features.title': 'എന്തുകൊണ്ട് കൃഷി സഹകാരി കണക്റ്റ് തിരഞ്ഞെടുക്കണം?',
    'features.subtitle': 'കാർഷിക സഹകരണം എളുപ്പവും കൂടുതൽ ലാഭകരവുമാക്കുന്ന ശക്തമായ സവിശേഷതകൾ കണ്ടെത്തുക.',
    
    'features.cooperative.title': 'സഹകരണ ശൃംഖല',
    'features.cooperative.description': 'പ്രാദേശിക കാർഷിക സഹകരണ സംഘങ്ങളുമായി ബന്ധപ്പെടുകയും പരസ്പര വിജയത്തിനായി ഒരുമിച്ച് പ്രവർത്തിക്കുന്ന കർഷകരുടെ സമൂഹത്തിൽ ചേരുകയും ചെയ്യുക.',
    
    'features.resources.title': 'വിഭവ പങ്കിടൽ',
    'features.resources.description': 'നിങ്ങളുടെ കാർഷിക പ്രവർത്തനങ്ങൾ ഒപ്റ്റിമൈസ് ചെയ്യുന്നതിന് പങ്കിട്ട കാർഷിക വിഭവങ്ങൾ, ഉപകരണങ്ങൾ, അറിവ് എന്നിവ ആക്സസ് ചെയ്യുക.',
    
    'features.market.title': 'വിപണി പ്രവേശനം',
    'features.market.description': 'കൂട്ടായ വിലപേശലിലൂടെയും നേരിട്ടുള്ള മാർക്കറ്റ് കണക്ഷനുകളിലൂടെയും നിങ്ങളുടെ ഉൽപ്പന്നങ്ങൾക്ക് മികച്ച വിലകൾ നേടുക.',
    
    'features.support.title': '24/7 സപ്പോർട്ട്',
    'features.support.description': 'വിവേകപൂർണ്ണമായ കാർഷിക തീരുമാനങ്ങൾ എടുക്കാൻ നിങ്ങളെ സഹായിക്കുന്നതിന് മുഴുവൻ സമയ സഹായവും വിദഗ്ധ മാർഗ്ഗദർശനവും.',
    
    'features.financial.title': 'സാമ്പത്തിക സേവനങ്ങൾ',
    'features.financial.description': 'കാർഷിക ആവശ്യങ്ങൾക്കായി രൂപകൽപ്പന ചെയ്ത മൈക്രോ-ലോണുകൾ, ഇൻഷുറൻസ്, സാമ്പത്തിക ആസൂത്രണ സേവനങ്ങൾ ആക്സസ് ചെയ്യുക.',
    
    'features.training.title': 'പരിശീലന പരിപാടികൾ',
    'features.training.description': 'വൈദഗ്ധ്യ വികസന പരിപാടികളിൽ പങ്കെടുക്കുകയും വിദഗ്ധരിൽ നിന്ന് ആധുനിക കാർഷിക സാങ്കേതിക വിദ്യകൾ പഠിക്കുകയും ചെയ്യുക.',
    
    // Chat Interface
    'chat.title': 'കൃഷി സഹകാരി അസിസ്റ്റന്റുമായി ചാറ്റ് ചെയ്യുക',
    'chat.subtitle': 'കൃഷി, സഹകരണസംഘങ്ങൾ എന്നിവയെക്കുറിച്ച് ചോദ്യങ്ങൾ ചോദിക്കുക അല്ലെങ്കിൽ കാർഷിക സമ്പ്രദായങ്ങളിൽ മാർഗ്ഗദർശനം നേടുക.',
    'chat.placeholder': 'നിങ്ങളുടെ സന്ദേശം ഇവിടെ ടൈപ്പ് ചെയ്യുക...',
    'chat.send': 'അയയ്ക്കുക',
    'chat.welcome': 'സ്വാഗതം! ഇന്ന് നിങ്ങളുടെ കാർഷിക ആവശ്യങ്ങളിൽ എനിക്ക് എങ്ങനെ സഹായിക്കാനാകും?',
    
    // Authentication
    'auth.login': 'പ്രവേശിക്കുക',
    'auth.signup': 'രജിസ്റ്റർ ചെയ്യുക',
    'auth.logout': 'പുറത്തുകടക്കുക',
    'auth.loginWithGoogle': 'Google ഉപയോഗിച്ച് തുടരുക',
    'auth.email': 'ഇമെയിൽ',
    'auth.password': 'പാസ്‌വേഡ്',
    'auth.confirmPassword': 'പാസ്‌വേഡ് സ്ഥിരീകരിക്കുക',
    'auth.name': 'പൂർണ്ണ നാമം',
    'auth.forgotPassword': 'പാസ്‌വേഡ് മറന്നോ?',
    'auth.dontHaveAccount': 'അക്കൗണ്ട് ഇല്ലേ?',
    'auth.alreadyHaveAccount': 'ഇതിനകം അക്കൗണ്ട് ഉണ്ടോ?',
    'auth.verifyEmail': 'നിങ്ങളുടെ ഇമെയിൽ സ്ഥിരീകരിക്കുക',
    'auth.verificationSent': 'സ്ഥിരീകരണ ഇമെയിൽ അയച്ചു! നിങ്ങളുടെ ഇൻബോക്സ് പരിശോധിക്കുക.',
    'auth.resendVerification': 'സ്ഥിരീകരണ ഇമെയിൽ വീണ്ടും അയയ്ക്കുക',
    'auth.emailNotVerified': 'തുടരുന്നതിന് ദയവായി നിങ്ങളുടെ ഇമെയിൽ വിലാസം സ്ഥിരീകരിക്കുക.',
    
    // Auth Errors
    'auth.error.userNotFound': 'ഈ ഇമെയിൽ വിലാസത്തിൽ ഒരു ഉപയോക്താവിനെയും കണ്ടെത്തിയില്ല.',
    'auth.error.wrongPassword': 'തെറ്റായ പാസ്‌വേഡ്. ദയവായി വീണ്ടും ശ്രമിക്കുക.',
    'auth.error.emailInUse': 'ഈ ഇമെയിൽ ഇതിനകം രജിസ്റ്റർ ചെയ്തിട്ടുണ്ട്. ദയവായി പ്രവേശിക്കുക.',
    'auth.error.weakPassword': 'പാസ്‌വേഡ് കുറഞ്ഞത് 6 അക്ഷരങ്ങൾ ആയിരിക്കണം.',
    'auth.error.invalidEmail': 'സാധുവായ ഇമെയിൽ വിലാസം നൽകുക.',
    'auth.error.tooManyRequests': 'വളരെയധികം പരാജയപ്പെട്ട ശ്രമങ്ങൾ. പിന്നീട് വീണ്ടും ശ്രമിക്കുക.',
    'auth.error.networkError': 'നെറ്റ്‌വർക്ക് പിശക്. നിങ്ങളുടെ ഇന്റർനെറ്റ് കണക്ഷൻ പരിശോധിക്കുക.',
    'auth.error.popupClosed': 'സൈൻ-ഇൻ പോപ്പ്അപ്പ് അടച്ചു. വീണ്ടും ശ്രമിക്കുക.',
    
    // About Section
    'about.title': 'കൃഷി സഹകാരി കണക്റ്റിനെ കുറിച്ച്',
    'about.subtitle': 'സുസ്ഥിര കൃഷിക്കും കമ്മ്യൂണിറ്റി വളർച്ചയ്ക്കും വേണ്ടിയുള്ള സാങ്കേതികവിദ്യാധിഷ്ഠിത സഹകരണ പരിഹാരങ്ങളിലൂടെ കർഷകരെ ശാക്തീകരിക്കുന്നു.',
    'about.content.heading': 'ഡിജിറ്റൽ നവീകരണത്തിലൂടെ കൃഷിയെ പരിവർത്തനം ചെയ്യുന്നു',
    'about.content.description1': 'കൃഷി സഹകാരി കണക്റ്റ് കർഷകരും കാർഷിക സഹകരണ സംഘങ്ങളും തമ്മിലുള്ള വിടവ് നികത്താൻ രൂപകൽപ്പന ചെയ്ത ഒരു സമഗ്ര ഡിജിറ്റൽ പ്ലാറ്റ്ഫോമാണ്. കർഷകർക്ക് വിഭവങ്ങൾ, അറിവ്, വിപണികൾ എന്നിവ കൂടുതൽ കാര്യക്षമമായി ലഭിക്കുന്ന സുസ്ഥിര ആവാസവ്യവസ്ഥ സൃഷ്ടിക്കുകയാണ് ഞങ്ങളുടെ ലക്ഷ്യം.',
    'about.content.description2': 'അത്യാധുനിക സാങ്കേതികവിദ്യയും കാർഷിക വെല്ലുവിളികളെക്കുറിച്ചുള്ള ആഴത്തിലുള്ള ധാരണയും ഉപയോഗിച്ച്, ഉൽപ്പാദനക്ഷമता വർദ്ധിപ്പിക്കുകയും ചെലവ് കുറയ്ക്കുകയും മൊത്തത്തിലുള്ള കാർഷിക അനുഭവം മെച്ചപ്പെടുത്തുകയും ചെയ്യുന്ന ഉപകരണങ്ങൾ ഞങ്ങൾ നൽകുന്നു. അവരുടെ കാർഷിക സമ്പ്രദായങ്ങൾ ഇതിനകം പരിവർത്തനം ചെയ്യുന്ന ആയിരക്കണക്കിന് കർഷകരോടൊപ്പം ചേരുക.',
    'about.content.feature1': 'AI-പവർഡ് ക്രോപ്പ് മാനേജ്മെന്റും വിളവ് പ്രവചനം',
    'about.content.feature2': 'തത്സമയ മാർക്കറ്റ് വിലകളും കാലാവസ്ഥാ അപ്‌ഡേറ്റുകളും',
    'about.content.feature3': 'സർക്കാർ പദ്ധതികളിലേക്കും സബ്‌സിഡികളിലേക്കും നേരിട്ടുള്ള പ്രവേശനം',
    'about.stats.farmers': 'സജീവ കർഷകർ',
    'about.stats.crops': 'പിന്തുണയ്ക്കുന്ന വിള ഇനങ്ങൾ',
    'about.stats.yield': 'ശരാശരി വിള വർദ്ധനവ്',
    'about.stats.awards': 'ഇൻഡസ്ട്രി അവാർഡുകൾ',
    'about.values.title': 'ഞങ്ങളുടെ മൂലമൂല്യങ്ങൾ',
    'about.values.subtitle': 'കാർഷിക സമൂഹത്തിനായി ഞങ്ങൾ ചെയ്യുന്ന എല്ലാത്തിനും മാർഗ്ഗദർശനം നൽകുന്ന തത്വങ്ങൾ.',
    'about.values.mission.title': 'ഞങ്ങളുടെ ദൗത്യം',
    'about.values.mission.description': 'കാർഷിക വിഭവങ്ങളിലേക്കും അറിവിലേക്കുമുള്ള പ്രവേശനം ജനാധിപത്യവൽക്കരിക്കുക, ഓരോ കർഷകനെയും സുസ്ഥിര സമൃദ്ധി കൈവരിക്കാൻ ശാക്തീകരിക്കുക.',
    'about.values.vision.title': 'ഞങ്ങളുടെ കാഴ്ചപ്പാട്',
    'about.values.vision.description': 'സാങ്കേതികവിദ്യ കൃഷിയെ സേവിക്കുന്ന, പ്രതിരോധശേഷിയുള്ള കാർഷിക സമൂഹങ്ങളും എല്ലാവർക്കുമുള്ള ഭക്ഷ്യസുരക്ഷയും സൃഷ്ടിക്കുന്ന ഒരു ലോകം.',
    'about.values.community.title': 'കമ്മ്യൂണിറ്റി പ്രഥമം',
    'about.values.community.description': 'കൂട്ടായ വളർച്ചയുടെ ശക്തിയിൽ ഞങ്ങൾ വിശ്വസിക്കുന്നു, അവിടെ ഓരോ കർഷകന്റെയും വിജയം മുഴുവൻ സമൂഹത്തിന്റെയും സമൃദ്ധിക്ക് സംഭാവന നൽകുന്നു.',

    // Contact Section
    'contact.title': 'ഞങ്ങളുമായി ബന്ധപ്പെടുക',
    'contact.subtitle': 'ചോദ്യങ്ങളോ സഹായമോ വേണോ? നിങ്ങളുടെ കാർഷിക യാത്രയിൽ വിജയിക്കാൻ ഞങ്ങൾ ഇവിടെയുണ്ട്.',
    'contact.info.title': 'ബന്ധപ്പെടാനുള്ള വിവരങ്ങൾ',
    'contact.info.description': 'ഇനിപ്പറയുന്ന ഏതെങ്കിലും ചാനലുകളിലൂടെ ഞങ്ങളെ ബന്ധപ്പെടുക. നിങ്ങളെ സഹായിക്കാൻ ഞങ്ങളുടെ ടീം എപ്പോഴും തയ്യാറാണ്.',
    'contact.info.email.title': 'ഇമെയിൽ സപ്പോർട്ട്',
    'contact.info.email.description': 'എപ്പോൾ വേണമെങ്കിലും ഞങ്ങൾക്ക് നിങ്ങളുടെ ചോദ്യങ്ങൾ അയയ്ക്കുക',
    'contact.info.phone.title': 'ഫോൺ സപ്പോർട്ട്',
    'contact.info.phone.description': 'ഞങ്ങളുടെ വിദഗ്ധരുമായി നേരിട്ട് സംസാരിക്കുക',
    'contact.info.address.title': 'ഓഫീസ് വിലാസം',
    'contact.info.address.description': 'ഞങ്ങളുടെ ആസ്ഥാനത്ത് ഞങ്ങളെ സന്ദർശിക്കുക',
    'contact.info.hours.title': 'ബിസിനസ് സമയം',
    'contact.info.hours.description': 'ഞങ്ങൾ സഹായിക്കാൻ ലഭ്യമാകുമ്പോൾ',
    'contact.form.title': 'ഞങ്ങൾക്ക് ഒരു സന്ദേശം അയയ്ക്കുക',
    'contact.form.description': 'ചുവടെയുള്ള ഫോം പൂരിപ്പിക്കുക, കഴിയുന്നത്ര വേഗം ഞങ്ങൾ നിങ്ങളെ ബന്ധപ്പെടും.',
    'contact.form.name': 'പൂർണ്ണ നാമം',
    'contact.form.namePlaceholder': 'നിങ്ങളുടെ പൂർണ്ണ നാമം നൽകുക',
    'contact.form.email': 'ഇമെയിൽ വിലാസം',
    'contact.form.emailPlaceholder': 'നിങ്ങളുടെ ഇമെയിൽ വിലാസം നൽകുക',
    'contact.form.subject': 'വിഷയം',
    'contact.form.subjectPlaceholder': 'ഇത് എന്താണ് സംബന്ധിച്ച്?',
    'contact.form.message': 'സന്ദേശം',
    'contact.form.messagePlaceholder': 'എങ്ങനെ ഞങ്ങൾക്ക് നിങ്ങളെ സഹായിക്കാൻ കഴിയുമെന്ന് പറയൂ...',
    'contact.form.send': 'സന്ദേശം അയയ്ക്കുക',
    'contact.form.sending': 'അയയ്ക്കുന്നു...',
    'contact.form.success': 'നന്ദി! നിങ്ങളുടെ സന്ദേശം വിജയകരമായി അയച്ചു.',

    // Common
    'common.loading': 'ലോഡ് ചെയ്യുന്നു...',
    'common.error': 'എന്തോ കുഴപ്പം സംഭവിച്ചു. ദയവായി വീണ്ടും ശ്രമിക്കുക.',
    'common.success': 'വിജയം!',
    'common.cancel': 'റദ്ദാക്കുക',
    'common.continue': 'തുടരുക',
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
