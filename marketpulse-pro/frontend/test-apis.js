// API Integration Test Script
import TradingAPIService from '../src/services/TradingAPIService.js';

const testAPIs = async () => {
  console.log('🚀 Testing Trading API Integration...\n');

  // Test 1: Real-time Stock Quote
  console.log('📊 Testing Stock Quotes...');
  try {
    const quote = await TradingAPIService.getRealTimeQuote('AAPL');
    console.log('✅ Stock Quote Success:', {
      symbol: quote.symbol,
      price: quote.price,
      change: quote.change
    });
  } catch (error) {
    console.log('❌ Stock Quote Failed:', error.message);
  }

  // Test 2: Forex Data
  console.log('\n💱 Testing Forex Rates...');
  try {
    const forex = await TradingAPIService.getForexRealTime('EUR', 'USD');
    console.log('✅ Forex Success:', {
      pair: `${forex.fromCurrency}/${forex.toCurrency}`,
      rate: forex.rate
    });
  } catch (error) {
    console.log('❌ Forex Failed:', error.message);
  }

  // Test 3: Market News
  console.log('\n📰 Testing Market News...');
  try {
    const news = await TradingAPIService.getRealTimeMarketNews('general', 5);
    console.log('✅ News Success:', {
      articles: news.length,
      latest: news[0]?.title
    });
  } catch (error) {
    console.log('❌ News Failed:', error.message);
  }

  // Test 4: Technical Indicators  
  console.log('\n📈 Testing Technical Indicators...');
  try {
    const indicators = await TradingAPIService.getTechnicalIndicators('AAPL');
    console.log('✅ Indicators Success:', {
      rsi: indicators.rsi?.value,
      macd: indicators.macd?.trend
    });
  } catch (error) {
    console.log('❌ Indicators Failed:', error.message);
  }

  // Test 5: Global Market Indices
  console.log('\n🌍 Testing Global Indices...');
  try {
    const indices = await TradingAPIService.getGlobalMarketIndices();
    console.log('✅ Indices Success:', {
      count: indices.length,
      sp500: indices.find(i => i.name?.includes('S&P'))?.price
    });
  } catch (error) {
    console.log('❌ Indices Failed:', error.message);
  }

  // Test 6: Market Status
  console.log('\n🏦 Testing Market Status...');
  try {
    const status = await TradingAPIService.getEnhancedMarketStatus();
    console.log('✅ Market Status Success:', {
      nyse: status.NYSE?.isOpen ? 'OPEN' : 'CLOSED',
      forex: status.FOREX?.isOpen ? 'OPEN' : 'CLOSED'
    });
  } catch (error) {
    console.log('❌ Market Status Failed:', error.message);
  }

  console.log('\n🎯 API Integration Test Complete!');
  console.log('If you see ❌ errors, check your API keys in .env.local');
};

export default testAPIs;
