import { NewsAPIProvider } from '../infrastructure/news/NewsAPIProvider';
import { EducationalOpenAIProvider } from '../infrastructure/openai/EducationalOpenAIProvider';
import { GetHeadlines } from '../application/usecases/get-headlines';
import { ExplainNews } from '../application/usecases/explain-news';
import { GenerateNewsQuiz } from '../application/usecases/generate-news-quiz';
import { iaNoticiasEnv } from './iaNoticiasEducativas.env';

const newsProvider = new NewsAPIProvider(iaNoticiasEnv.newsApiKey);
const aiProvider = new EducationalOpenAIProvider(iaNoticiasEnv.openaiApiKey);

export const getHeadlines = new GetHeadlines(newsProvider);
export const explainNews = new ExplainNews(newsProvider, aiProvider);
export const generateNewsQuiz = new GenerateNewsQuiz(explainNews, aiProvider);
