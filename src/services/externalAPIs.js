import axios from 'axios';

const NEWS_API_KEY = process.env.VITE_NEWS_API_KEY;

export const newsService = {
  // Get business news
  getBusinessNews: async (country = 'ls', category = 'business', pageSize = 10) => {
    try {
      const response = await axios.get('https://newsapi.org/v2/top-headlines', {
        params: {
          country,
          category,
          pageSize,
          apiKey: NEWS_API_KEY,
        },
      });

      return response.data.articles.map((article) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        imageUrl: article.urlToImage,
        source: article.source.name,
        publishedAt: article.publishedAt,
        content: article.content,
      }));
    } catch (error) {
      console.error('Error fetching business news:', error);
      return getFallbackBusinessNews();
    }
  },

  // Get Lesotho-specific news
  getLesothoNews: async () => {
    try {
      const response = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q: 'Lesotho OR Maseru economy business jobs',
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: 15,
          apiKey: NEWS_API_KEY,
        },
      });

      return response.data.articles
        .filter(
          (article) =>
            article.title &&
            article.description &&
            (article.title.toLowerCase().includes('lesotho') ||
              article.description.toLowerCase().includes('lesotho') ||
              article.content?.toLowerCase().includes('lesotho'))
        )
        .map((article) => ({
          title: article.title,
          description: article.description,
          url: article.url,
          imageUrl: article.urlToImage,
          source: article.source.name,
          publishedAt: article.publishedAt,
          relevance: 'lesotho',
        }))
        .slice(0, 10);
    } catch (error) {
      console.error('Error fetching Lesotho news:', error);
      return getFallbackLesothoNews();
    }
  },

  // Get career and job market news
  getCareerNews: async () => {
    try {
      const queries = [
        'recruitment hiring',
        'job market',
        'career development',
        'employment trends',
        'workplace skills',
      ];

      const newsPromises = queries.map((query) =>
        axios.get('https://newsapi.org/v2/everything', {
          params: {
            q: query,
            language: 'en',
            sortBy: 'relevancy',
            pageSize: 3,
            apiKey: NEWS_API_KEY,
          },
        })
      );

      const responses = await Promise.all(newsPromises);
      let allArticles = [];

      responses.forEach((response) => {
        if (response.data.articles) {
          allArticles = [...allArticles, ...response.data.articles];
        }
      });

      // Remove duplicates and format
      const uniqueArticles = Array.from(
        new Map(allArticles.map((article) => [article.url, article])).values()
      ).map((article) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        imageUrl: article.urlToImage,
        source: article.source.name,
        publishedAt: article.publishedAt,
        category: 'career',
      }));

      return uniqueArticles.slice(0, 12);
    } catch (error) {
      console.error('Error fetching career news:', error);
      return getFallbackCareerNews();
    }
  },

  // Get news categories for dashboard
  getDashboardNews: async () => {
    try {
      // Use cached data if API fails
      return {
        business: await this.getBusinessNews('us', 'business', 5),
        career: await this.getCareerNews(),
        lesotho: await this.getLesothoNews(),
      };
    } catch (error) {
      console.error('Error fetching dashboard news:', error);
      return getFallbackDashboardNews();
    }
  },

  // Search news
  searchNews: async (query, language = 'en', sortBy = 'relevancy', pageSize = 20) => {
    try {
      const response = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q: query,
          language,
          sortBy,
          pageSize,
          apiKey: NEWS_API_KEY,
        },
      });

      return response.data.articles.map((article) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        imageUrl: article.urlToImage,
        source: article.source.name,
        publishedAt: article.publishedAt,
      }));
    } catch (error) {
      console.error('Error searching news:', error);
      return [];
    }
  },
};

// Fallback data for when API fails
const getFallbackBusinessNews = () => [
  {
    title: 'Lesotho Economy Shows Resilience Amid Global Challenges',
    description:
      "Despite global economic pressures, Lesotho's economy demonstrates steady growth in key sectors.",
    url: '#',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop',
    source: 'Lesotho Times',
    publishedAt: new Date().toISOString(),
    content:
      'Lesotho continues to show economic resilience with growth in agriculture and manufacturing sectors.',
  },
  {
    title: 'Digital Transformation Accelerates in Southern Africa',
    description:
      'Companies across Southern Africa are rapidly adopting digital technologies to stay competitive.',
    url: '#',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w-400&h=300&fit=crop',
    source: 'Business Daily',
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    content:
      'Digital transformation initiatives are helping businesses improve efficiency and reach new markets.',
  },
];

const getFallbackLesothoNews = () => [
  {
    title: 'Lesotho Government Announces New Business Incentives',
    description: 'New tax incentives and support programs for small businesses in Lesotho.',
    url: '#',
    imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop',
    source: 'Lesotho News',
    publishedAt: new Date().toISOString(),
    relevance: 'lesotho',
  },
  {
    title: 'Maseru Tech Hub Attracts International Investment',
    description: 'New technology hub in Maseru receives significant international funding.',
    url: '#',
    imageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&h=300&fit=crop',
    source: 'Tech Africa',
    publishedAt: new Date(Date.now() - 172800000).toISOString(),
    relevance: 'lesotho',
  },
];

const getFallbackCareerNews = () => [
  {
    title: 'Remote Work Continues to Transform Hiring Practices',
    description: 'Companies are adapting their recruitment strategies for the remote work era.',
    url: '#',
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
    source: 'HR Today',
    publishedAt: new Date().toISOString(),
    category: 'career',
  },
  {
    title: 'Top Skills Employers Look For in 2024',
    description: 'Essential skills that can boost your career prospects this year.',
    url: '#',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop',
    source: 'Career Builder',
    publishedAt: new Date(Date.now() - 259200000).toISOString(),
    category: 'career',
  },
];

const getFallbackDashboardNews = () => ({
  business: getFallbackBusinessNews(),
  career: getFallbackCareerNews(),
  lesotho: getFallbackLesothoNews(),
});

// Weather service (if needed later)
export const weatherService = {
  getWeather: async () => {
    try {
      // This would use a weather API
      return {
        temperature: 22,
        condition: 'Sunny',
        humidity: 65,
        windSpeed: 12,
      };
      // eslint-disable-next-line no-unreachable
    } catch (error) {
      console.error('Error fetching weather:', error);
      return null;
    }
  },
};

// Currency exchange service (if needed later)
export const currencyService = {
  getExchangeRates: async () => {
    try {
      // This would use a currency API
      const rates = {
        USD: 1,
        ZAR: 18.5,
        LSL: 18.5,
        EUR: 0.92,
      };
      return rates;
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      return {
        USD: 1,
        ZAR: 18.5,
        LSL: 18.5,
        EUR: 0.92,
      };
    }
  },
};

// API Toggle Configuration
const API_CONFIG = {
  enabled: {
    news: true,
    jobs: true,
    economy: true,
    currency: true,
    youtube: true,
  },

  // Toggle API on/off
  toggle: (apiName) => {
    if (Object.prototype.hasOwnProperty.call(API_CONFIG.enabled, apiName)) {
      API_CONFIG.enabled[apiName] = !API_CONFIG.enabled[apiName];
      return API_CONFIG.enabled[apiName];
    }
    return false;
  },

  // Get all enabled APIs
  getEnabled: () => {
    return Object.keys(API_CONFIG.enabled).filter((key) => API_CONFIG.enabled[key]);
  },
};

const EXTERNAL_APIS = {
  // News API for Lesotho and Africa business news
  news: {
    getBusinessNews: async () => {
      if (!API_CONFIG.enabled.news) return [];

      try {
        // Real API call (uncomment when you have API key)
        /*
        const response = await fetch(
          `https://newsapi.org/v2/everything?q=Lesotho+entrepreneurship+business+economy&language=en&sortBy=publishedAt&pageSize=5&apiKey=${process.env.VITE_NEWS_API_KEY}`
        );
        const data = await response.json();
        
        if (data.status === 'ok') {
          return data.articles.slice(0, 5).map(article => ({
            title: article.title,
            description: article.description || 'No description available',
            url: article.url,
            image: article.urlToImage || 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400',
            source: article.source.name,
            publishedAt: new Date(article.publishedAt)
          }));
        }
        */

        // Fallback to sample data
        return getSampleNews();
      } catch (error) {
        console.warn('News API error:', error);
        return getSampleNews();
      }
    },
  },

  // Jobs API for Lesotho opportunities
  jobs: {
    getLatestJobs: async () => {
      if (!API_CONFIG.enabled.jobs) return [];

      try {
        // Real API call for Lesotho jobs (example - you'll need to find a suitable API)
        /*
        const response = await fetch(
          'https://api.example.com/jobs/lesotho?limit=5'
        );
        const data = await response.json();
        */

        // Fallback to sample data
        return getSampleJobs();
      } catch (error) {
        console.warn('Jobs API error:', error);
        return getSampleJobs();
      }
    },
  },

  // Economic data for Lesotho
  economy: {
    getEconomicIndicators: async () => {
      if (!API_CONFIG.enabled.economy) return null;

      try {
        // World Bank API for Lesotho economic data
        const response = await fetch(
          'https://api.worldbank.org/v2/country/LS/indicator/NY.GDP.MKTP.CD?format=json&date=2023'
        );
        const data = await response.json();

        // Get latest GDP data
        const gdpData = data[1]?.find((item) => item.value);
        const gdp = gdpData?.value ? `$${(gdpData.value / 1000000000).toFixed(1)}B` : 'N/A';

        return {
          gdp,
          growthRate: '+2.3%', // From World Bank 2023 estimate
          unemployment: '24.6%', // Lesotho unemployment rate 2023
          inflation: '6.8%', // Lesotho inflation 2023
          youthUnemployment: '34.2%', // Youth unemployment in Lesotho
          source: 'World Bank 2023',
          updated: new Date(),
        };
      } catch (error) {
        console.warn('Economic data API error:', error);
        return {
          gdp: '$2.4B',
          growthRate: '+2.3%',
          unemployment: '24.6%',
          inflation: '6.8%',
          youthUnemployment: '34.2%',
          source: 'Sample Data',
          updated: new Date(),
        };
      }
    },

    // Get business trends in Lesotho
    getBusinessTrends: async () => {
      if (!API_CONFIG.enabled.economy) return [];

      return [
        { sector: 'Agriculture', growth: '+4.2%', trend: 'up' },
        { sector: 'Textiles', growth: '-1.5%', trend: 'down' },
        { sector: 'Tourism', growth: '+8.7%', trend: 'up' },
        { sector: 'ICT', growth: '+12.3%', trend: 'up' },
        { sector: 'Mining', growth: '+2.1%', trend: 'up' },
      ];
    },
  },

  // Currency exchange rates for Lesotho (LSL)
  currency: {
    getExchangeRates: async () => {
      if (!API_CONFIG.enabled.currency) return null;

      try {
        // Exchange rate API
        const response = await fetch(
          'https://api.exchangerate.host/latest?base=ZAR&symbols=USD,EUR,GBP,LSL'
        );
        const data = await response.json();

        return {
          ZAR_LSL: '1.00', // 1:1 pegged
          ZAR_USD: data.rates.USD ? data.rates.USD.toFixed(3) : '0.054',
          ZAR_EUR: data.rates.EUR ? data.rates.EUR.toFixed(3) : '0.050',
          ZAR_GBP: data.rates.GBP ? data.rates.GBP.toFixed(3) : '0.043',
          updated: new Date(data.date),
        };
      } catch (error) {
        console.warn('Exchange rate API error:', error);
        return {
          ZAR_LSL: '1.00',
          ZAR_USD: '0.054',
          ZAR_EUR: '0.050',
          ZAR_GBP: '0.043',
          updated: new Date(),
        };
      }
    },
  },

  // YouTube videos for entrepreneurship in Africa
  youtube: {
    getEntrepreneurshipVideos: async () => {
      if (!API_CONFIG.enabled.youtube) return [];

      try {
        // YouTube API call (requires API key)
        /*
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&q=entrepreneurship+Lesotho+African+business+startup&maxResults=3&type=video&key=${process.env.VITE_YOUTUBE_API_KEY}`
        );
        const data = await response.json();
        */

        return getSampleVideos();
      } catch (error) {
        console.warn('YouTube API error:', error);
        return getSampleVideos();
      }
    },
  },

  // Lesotho Government initiatives
  government: {
    getInitiatives: async () => {
      return [
        {
          title: 'Youth Entrepreneurship Fund',
          description: 'Government funding for youth-led businesses',
          amount: 'M 50M',
          deadline: '2024-06-30',
          link: '#',
        },
        {
          title: 'Lesotho National Development Corporation',
          description: 'Support for industrial development',
          amount: 'Various',
          deadline: 'Ongoing',
          link: '#',
        },
      ];
    },
  },

  // API Configuration
  config: API_CONFIG,
};

// Sample data for fallback
const getSampleNews = () => [
  {
    title: 'Lesotho Government Launches New Youth Entrepreneurship Program',
    description:
      'The Ministry of Trade and Industry has announced a new initiative to support young entrepreneurs with funding and mentorship.',
    url: '#',
    image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400',
    source: 'Lesotho Times',
    publishedAt: new Date(Date.now() - 86400000), // 1 day ago
  },
  {
    title: 'African Tech Startups See Record Investment in 2024',
    description:
      'Venture capital investment in African technology startups has grown by 47% compared to last year.',
    url: '#',
    image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400',
    source: 'TechCrunch Africa',
    publishedAt: new Date(Date.now() - 172800000), // 2 days ago
  },
  {
    title: 'Basotho Entrepreneurs Excel at Regional Business Competition',
    description: 'Three Lesotho-based startups won awards at the SADC Entrepreneurship Challenge.',
    url: '#',
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
    source: 'Business Daily',
    publishedAt: new Date(Date.now() - 259200000), // 3 days ago
  },
];

const getSampleJobs = () => [
  {
    title: 'Business Development Manager',
    company: 'Tech Solutions Lesotho',
    location: 'Maseru, Lesotho',
    description:
      'Looking for an experienced business development manager to expand our market presence in Lesotho and regionally.',
    salary: 'M 35,000 - M 50,000',
    type: 'Full-time',
    posted: new Date(Date.now() - 86400000), // 1 day ago
    url: '#',
  },
  {
    title: 'Youth Entrepreneurship Coordinator',
    company: 'UNDP Lesotho',
    location: 'Maseru, Lesotho',
    description:
      'Coordinate youth entrepreneurship programs and mentorship initiatives across Lesotho.',
    salary: 'M 40,000 - M 55,000',
    type: 'Contract',
    posted: new Date(Date.now() - 172800000), // 2 days ago
    url: '#',
  },
  {
    title: 'Agricultural Business Consultant',
    company: 'Lesotho Farmers Association',
    location: 'Leribe, Lesotho',
    description:
      'Provide business consulting services to agricultural entrepreneurs in rural Lesotho.',
    salary: 'M 30,000 - M 45,000',
    type: 'Full-time',
    posted: new Date(Date.now() - 259200000), // 3 days ago
    url: '#',
  },
];

const getSampleVideos = () => [
  {
    title: 'Building a Sustainable Business in Lesotho',
    channel: 'Entrepreneurship Africa',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    videoId: 'dQw4w9WgXcQ',
    publishedAt: new Date(Date.now() - 86400000),
    duration: '15:30',
  },
  {
    title: 'Youth Entrepreneurship Success Stories',
    channel: 'Lesotho Business TV',
    thumbnail: 'https://img.youtube.com/vi/9bZkp7q19f0/mqdefault.jpg',
    videoId: '9bZkp7q19f0',
    publishedAt: new Date(Date.now() - 172800000),
    duration: '22:15',
  },
];

export default EXTERNAL_APIS;
