import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TelegramIcon from '@mui/icons-material/Telegram';
import { useSiteConfig } from '../context/SiteConfigContext';
import { StripeService } from '../services/StripeService';

interface PromoOfferBannerProps {
  telegramLink?: string; // full URL override
  telegramUsername?: string; // e.g., mychannel or myuser
  prefilledMessage?: string; // custom interest message
}

const getRandomInt = (min: number, max: number) => {
  const lower = Math.ceil(min);
  const upper = Math.floor(max);
  return Math.floor(Math.random() * (upper - lower + 1)) + lower;
};

const PromoOfferBanner = ({ telegramLink, telegramUsername, prefilledMessage }: PromoOfferBannerProps) => {
  const [onlineNow, setOnlineNow] = useState<number>(() => getRandomInt(0, 100));
  const [isStripeLoading, setIsStripeLoading] = useState(false);
  const { stripePublishableKey } = useSiteConfig();

  // Stable base so the number of customers looks consistent during a session
  const baseHappyCustomers = useMemo(() => getRandomInt(700, 1300), []);

  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineNow(prev => {
        const delta = getRandomInt(-5, 6);
        const next = prev + delta;
        return Math.min(100, Math.max(0, next));
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const happyCustomers = `${baseHappyCustomers}+`;

  const interestMessage = prefilledMessage || "Hi! I'm interested in the $85 offer including all content. Could you guide me on how to pay?";
  const computedTelegramHref = (() => {
    try {
      if (telegramLink) return telegramLink;
      if (telegramUsername) {
        // Open chat with username and try to pass text
        return `https://t.me/${telegramUsername}?text=${encodeURIComponent(interestMessage)}`;
      }
      // Fallback: share with prefilled text (user selects chat)
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      return `https://t.me/share/url?url=${encodeURIComponent(origin)}&text=${encodeURIComponent(interestMessage)}`;
    } catch {
      return 'https://t.me/';
    }
  })();

  // Handle Stripe payment for $85 offer
  const handleStripePayment = async () => {
    if (!stripePublishableKey) {
      alert('Stripe configuration is missing. Please contact support.');
      return;
    }
    
    try {
      setIsStripeLoading(true);
      
      // Initialize Stripe
      await StripeService.initStripe(stripePublishableKey);
      
      // Generate a random product name for privacy
      const productNames = [
        "Premium Content Package",
        "Digital Media Collection",
        "Exclusive Content Bundle",
        "Premium Access Package"
      ];
      const randomProductName = productNames[Math.floor(Math.random() * productNames.length)];
      
      // Build success and cancel URLs
      const successUrl = `${window.location.origin}/?payment_success=true&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${window.location.origin}/?payment_canceled=true`;
      
      // Create checkout session
      const sessionId = await StripeService.createCheckoutSession(
        85, // $85 price
        'usd',
        randomProductName,
        successUrl,
        cancelUrl
      );
      
      // Redirect to checkout
      await StripeService.redirectToCheckout(sessionId);
      
    } catch (error) {
      console.error('Error processing Stripe payment:', error);
      alert('Failed to initialize payment. Please try again.');
    } finally {
      setIsStripeLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', mb: 4, px: { xs: 2, sm: 3 } }}>
      <Box
        sx={{
          position: 'relative',
          maxWidth: 1100,
          mx: 'auto',
          borderRadius: 3,
          p: { xs: 3, sm: 5 },
          color: 'white',
          background: 'linear-gradient(135deg, #FF0F50, #D10D42, #FF3871)',
          backgroundSize: '200% 200%',
          animation: 'gradientMove 12s ease infinite',
          boxShadow: '0 12px 40px rgba(255, 15, 80, 0.25)',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.15)',
          '@keyframes gradientMove': {
            '0%': { backgroundPosition: '0% 50%' },
            '50%': { backgroundPosition: '100% 50%' },
            '100%': { backgroundPosition: '0% 50%' }
          }
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            right: -60,
            top: -60,
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)'
          }}
        />

        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            textAlign: 'center',
            textShadow: '2px 2px 8px rgba(0,0,0,0.35)',
            mb: 1,
            fontSize: { xs: '1.8rem', sm: '2.4rem', md: '3rem' },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1
          }}
        >
          🎉 SPECIAL OFFER 🎉
        </Typography>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            textAlign: 'center',
            mb: 2,
            fontSize: { xs: '1.3rem', sm: '1.8rem', md: '2rem' }
          }}
        >
          ALL CONTENT FOR ONLY $85
        </Typography>

        <Typography sx={{ textAlign: 'center', opacity: 0.95, mb: 3 }}>
          Get access to our entire premium collection at an unbeatable price!
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Typography
            sx={{
              textAlign: 'center',
              fontWeight: 700,
              background: 'rgba(255, 193, 7, 0.2)',
              color: '#FFC107',
              display: 'inline-block',
              px: 2,
              py: 1,
              borderRadius: 1.5,
              border: '1px solid rgba(255, 193, 7, 0.4)'
            }}
          >
            📦 EVERYTHING YOU SEE ON THIS SITE INCLUDED! 📦
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Button
            href={computedTelegramHref}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<TelegramIcon />}
            variant="contained"
            sx={{
              bgcolor: '#1E90FF',
              color: 'white',
              fontWeight: 800,
              px: 3,
              py: 1.2,
              borderRadius: 999,
              boxShadow: '0 6px 18px rgba(30,144,255,0.35)',
              transition: 'transform .2s ease, box-shadow .2s ease',
              '&:hover': { bgcolor: '#187bcd', transform: 'translateY(-2px)', boxShadow: '0 10px 24px rgba(30,144,255,0.45)' }
            }}
          >
            Come to Negociate
          </Button>
          
          <Button
            variant="contained"
            onClick={handleStripePayment}
            disabled={isStripeLoading || !stripePublishableKey}
            sx={{
              bgcolor: '#635bff',
              color: 'white',
              fontWeight: 800,
              px: 3,
              py: 1.2,
              borderRadius: 999,
              boxShadow: '0 6px 18px rgba(99, 91, 255, 0.35)',
              transition: 'transform .2s ease, box-shadow .2s ease',
              '&:hover': { bgcolor: '#4b45c6', transform: 'translateY(-2px)', boxShadow: '0 10px 24px rgba(99, 91, 255, 0.45)' }
            }}
          >
            {isStripeLoading ? 'Processing...' : 'Pay $85'}
          </Button>
        </Box>

        <Typography sx={{ textAlign: 'center', fontSize: '0.9rem', opacity: 0.8, mb: 3 }}>
          Instant delivery after payment
        </Typography>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 2,
            flexWrap: 'wrap'
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 0.5,
              borderRadius: 999,
              backgroundColor: 'rgba(0,0,0,0.25)',
              border: '1px solid rgba(255,255,255,0.25)'
            }}
          >
            <Typography sx={{ fontWeight: 700, color: 'white' }}>{happyCustomers} Happy Customers</Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 0.5,
              borderRadius: 999,
              backgroundColor: 'rgba(0,0,0,0.25)',
              border: '1px solid rgba(255,255,255,0.25)'
            }}
          >
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ff4d4f', animation: 'pulseDot 1.2s ease-in-out infinite' }} />
            <Typography sx={{ fontWeight: 700, color: 'white' }}>{onlineNow} online</Typography>
          </Box>
        </Box>

        <Box sx={{ '@keyframes pulseDot': { '0%': { opacity: 1 }, '50%': { opacity: 0.5 }, '100%': { opacity: 1 } } }} />
      </Box>
    </Box>
  );
};

export default PromoOfferBanner;


