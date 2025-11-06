# Jina Reader Cloud Wrapper

Convert any URL to clean, LLM-ready markdown instantly. Perfect for RAG pipelines, AI agents, research automation, and content extraction workflows.

## 🌟 What This Does

This Apify actor wraps the powerful **Jina AI Reader API** into a cloud-hosted, batch-processing service with automatic retries, rate limit management, and cost tracking. Instead of managing API calls yourself, just provide URLs and get clean markdown optimized for language models.

**Powered by Jina AI Reader:**
- ✅ **Automatic content extraction** - Removes nav, ads, footers, sidebars
- ✅ **Clean markdown output** - LLM-ready with preserved structure
- ✅ **PDF support** - Extracts text from PDFs automatically
- ✅ **Image captioning** - Optional AI-generated alt text for images
- ✅ **ReaderLM-v2** - Advanced 1.5B parameter model for complex pages
- ✅ **Blazing fast** - Cached responses in milliseconds

## 🚀 Perfect For

### RAG Pipeline Data Collection
Build knowledge bases for retrieval-augmented generation systems. Clean markdown with semantic structure enables better chunking and embedding quality.

### AI Agent Research
Enable autonomous agents to gather information from the web. Process multiple URLs in parallel, handle retries automatically, track token usage.

### Content Aggregation
Collect articles, documentation, blog posts from diverse sources. Normalize into consistent markdown format for downstream processing.

### Documentation Extraction
Extract clean content from technical docs, API references, tutorials. Preserve code blocks, tables, headings for AI-powered code assistants.

### Web Monitoring
Track content changes on specific pages. Disable caching for real-time monitoring, compare snapshots over time.

## 📋 Input Configuration

### Required

**URLs** (array of strings)
- List of URLs to process
- Supports web pages and PDFs
- Example: `["https://en.wikipedia.org/wiki/AI", "https://arxiv.org/pdf/2310.19923"]`

### Optional

| Parameter | Default | Description |
|-----------|---------|-------------|
| `returnFormat` | markdown | Output format: markdown, json, html, text, screenshot |
| `useReaderLM` | false | Use ReaderLM-v2 for higher quality (3x token cost) |
| `generateImageAlt` | false | Generate AI descriptions for images |
| `timeout` | 30000 | Page load timeout in milliseconds |
| `noCache` | false | Force fresh content fetching |
| `cacheTolerance` | 3600 | Max age of cached content (seconds) |
| `targetSelector` | - | CSS selector to limit extraction |
| `waitForSelector` | - | Wait for element before extracting |
| `jinaApiKey` | - | Your Jina API key (500 RPM vs 20 RPM) |
| `batchSize` | 5 | Concurrent URLs to process |
| `maxRetries` | 3 | Retry attempts for failed URLs |

## 🎯 Example Inputs

### Basic Usage - Convert 10 URLs to Markdown
```json
{
  "urls": [
    "https://docs.python.org/3/tutorial/index.html",
    "https://en.wikipedia.org/wiki/Machine_learning",
    "https://github.com/jina-ai/reader"
  ],
  "returnFormat": "markdown"
}
```

### RAG Pipeline - High Quality Extraction
```json
{
  "urls": [
    "https://platform.openai.com/docs/introduction",
    "https://docs.anthropic.com/claude/docs"
  ],
  "useReaderLM": true,
  "generateImageAlt": true,
  "timeout": 45000
}
```

### Real-Time Monitoring - No Cache
```json
{
  "urls": ["https://news.ycombinator.com"],
  "noCache": true,
  "cacheTolerance": 0
}
```

### PDF Extraction
```json
{
  "urls": [
    "https://arxiv.org/pdf/2310.19923",
    "https://example.com/whitepaper.pdf"
  ],
  "returnFormat": "markdown"
}
```

### Specific Content Selection
```json
{
  "urls": ["https://blog.example.com/article"],
  "targetSelector": "article.post-content",
  "waitForSelector": ".article-loaded"
}
```

## 📊 Output Format

### Dataset Results

Each processed URL returns:

```json
{
  "url": "https://example.com/article",
  "title": "Article Title",
  "content": "# Article Title\n\nClean markdown content here...",
  "metadata": {
    "processingTime": 2341,
    "contentLength": 15234,
    "estimatedTokens": 3809,
    "tokenCost": 3809,
    "processedAt": "2025-11-06T10:30:00.000Z",
    "returnFormat": "markdown",
    "usedReaderLM": false
  },
  "status": "success"
}
```

### Failed URLs
```json
{
  "url": "https://blocked-site.com",
  "title": null,
  "content": null,
  "error": "Request failed with status code 403",
  "metadata": {
    "processedAt": "2025-11-06T10:30:00.000Z",
    "returnFormat": "markdown"
  },
  "status": "error"
}
```

### Summary Statistics

Available in Key-Value Store as `OUTPUT`:

```json
{
  "stats": {
    "totalUrls": 10,
    "successful": 9,
    "failed": 1,
    "successRate": "90.0%",
    "totalTokens": 45234,
    "effectiveTokens": 45234,
    "totalTimeSeconds": "12.3",
    "avgTimePerUrlSeconds": "1.23"
  }
}
```

## 💰 Pricing & Cost Control

### Jina API Costs

**Free Tier:**
- 20 requests/minute (no API key)
- 200 requests/minute (with free API key)
- 10M free tokens for new users

**Token Consumption:**
- Standard mode: 1x tokens (response size)
- ReaderLM-v2 mode: 3x tokens (higher quality)

**Rate Limits:**
- Free: 200 RPM
- Premium: 500 RPM (read), 1000 RPM (search)

### This Actor's Pricing

**$0.50 per 1,000 URL conversions**

**Cost Examples:**
- 10 URLs: $0.005 (half a cent)
- 100 URLs: $0.05 (5 cents)
- 1,000 URLs: $0.50
- 10,000 URLs: $5.00

### Combined Cost Example

Processing 100 documentation pages:
- **Jina API cost:** ~$0.00 (within free tier)
- **This actor cost:** $0.05
- **Total cost:** $0.05

Plus Apify compute: ~$0.02 (varies by runtime)

**Grand total: ~$0.07 for 100 clean markdown pages**

### Cost Control Features

✅ **Batch processing** - Process multiple URLs efficiently
✅ **Automatic retries** - Don't waste runs on temporary failures
✅ **Token tracking** - Real-time cost estimates in logs
✅ **Cache support** - Reuse previous results (default: 1 hour)
✅ **Rate limit management** - Automatic delays between batches

## 🔧 Advanced Features

### ReaderLM-v2: Higher Quality Extraction

Enable `useReaderLM: true` for complex pages with:
- Code blocks with syntax highlighting
- Complex HTML tables
- Deeply nested lists
- Mathematical equations (LaTeX)
- Sophisticated document structures

**Trade-off:** 3x token cost for superior quality

### Image Captioning

Enable `generateImageAlt: true` to:
- Generate descriptive alt text using vision models
- Enable LLMs to reason about visual content
- Improve accessibility and SEO

### CSS Selector Targeting

Use `targetSelector` for precise extraction:
- `"article.main-content"` - Specific article
- `"#post-body"` - Element by ID
- `".documentation-content"` - Class-based selection

### Dynamic Content Handling

Use `waitForSelector` for JavaScript-heavy sites:
- Wait for specific elements to load
- Handle single-page applications
- Capture dynamically rendered content

### Caching Strategies

**Default:** 1-hour cache
- Fast responses for repeated URLs
- Good for static content

**No cache:** Real-time monitoring
- `noCache: true`
- Always fetch fresh content
- Best for news, dashboards, live data

**Custom tolerance:** Balance freshness and speed
- `cacheTolerance: 600` (10 minutes)
- Configure per use case

## 🎓 Use Case Examples

### 1. Build RAG Knowledge Base

```json
{
  "urls": [
    "https://docs.company.com/api/overview",
    "https://docs.company.com/api/authentication",
    "https://docs.company.com/api/endpoints"
  ],
  "useReaderLM": true,
  "generateImageAlt": true,
  "jinaApiKey": "your_key_here"
}
```

Process documentation into clean markdown, then:
1. Chunk into paragraphs/sections
2. Generate embeddings (use Jina Embeddings v2)
3. Store in vector database (Pinecone, Weaviate, ChromaDB)
4. Query with LLM for Q&A

### 2. Research Agent Workflow

```json
{
  "urls": [
    "https://arxiv.org/abs/2310.19923",
    "https://en.wikipedia.org/wiki/Transformer_(machine_learning_model)",
    "https://blog.research.google/2017/08/transformer-novel-neural-network.html"
  ],
  "useReaderLM": true,
  "timeout": 60000
}
```

AI agent gathers information, then:
1. Extracts key concepts from each source
2. Synthesizes findings across papers
3. Generates comprehensive summary
4. Cites specific passages from sources

### 3. Content Aggregation Pipeline

```json
{
  "urls": [
    "https://news.ycombinator.com",
    "https://techcrunch.com/ai",
    "https://www.theverge.com/artificial-intelligence"
  ],
  "batchSize": 3,
  "cacheTolerance": 300
}
```

Daily aggregation workflow:
1. Fetch latest articles
2. Extract clean content
3. Classify by topic (using Jina Classifier)
4. Generate daily digest email

### 4. Competitive Intelligence

```json
{
  "urls": [
    "https://competitor.com/pricing",
    "https://competitor.com/features",
    "https://competitor.com/blog/latest"
  ],
  "noCache": true
}
```

Weekly monitoring:
1. Capture current state
2. Compare with previous snapshots
3. Detect pricing changes
4. Alert on new features

## 🛠️ Integration Examples

### LangChain

```python
from langchain.document_loaders import ApifyDatasetLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter

# Load data from this actor
loader = ApifyDatasetLoader(
    dataset_id="your_dataset_id",
    dataset_mapping_function=lambda item: Document(
        page_content=item["content"],
        metadata={
            "source": item["url"],
            "title": item["title"],
            "tokens": item["metadata"]["estimatedTokens"]
        }
    )
)

docs = loader.load()

# Split into chunks
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200
)
splits = text_splitter.split_documents(docs)

# Use in RAG pipeline
```

### LlamaIndex

```python
from llama_index import download_loader

ApifyLoader = download_loader("ApifyDataset")
loader = ApifyLoader("your_dataset_id")
documents = loader.load_data()

# Build vector index
from llama_index import VectorStoreIndex
index = VectorStoreIndex.from_documents(documents)

# Query
response = index.query("What are the key features?")
```

### Jina Ecosystem

```javascript
// Use with Jina Embeddings v2
const response = await fetch('https://api.jina.ai/v1/embeddings', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'jina-embeddings-v2-base-en',
    input: [data.content] // From this actor's output
  })
});

// Use with Jina Reranker
const reranked = await fetch('https://api.jina.ai/v1/rerank', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'jina-reranker-v2-base-multilingual',
    query: 'How do I authenticate?',
    documents: results.map(r => r.content) // From this actor
  })
});
```

## 🐛 Troubleshooting

### No Content Extracted

**Problem:** Empty or very short content returned

**Solutions:**
- Increase `timeout` (try 45000-60000ms)
- Check if site blocks automated access
- Try `targetSelector` to specify content area
- Use `waitForSelector` for dynamic content

### Rate Limit Errors

**Problem:** `429 Too Many Requests`

**Solutions:**
- Reduce `batchSize` (try 2-3)
- Provide `jinaApiKey` for higher limits (500 RPM)
- Add delays between large batches
- Upgrade to Jina premium ($40/month for 500 RPM)

### High Costs

**Problem:** Token usage higher than expected

**Solutions:**
- Disable `useReaderLM` (uses 3x tokens)
- Disable `generateImageAlt` (adds tokens)
- Use `targetSelector` to extract only needed content
- Enable caching (`noCache: false`)
- Monitor token counts in logs

### PDF Extraction Failed

**Problem:** PDF URLs return empty content

**Solutions:**
- Verify PDF URL is publicly accessible
- Increase `timeout` for large PDFs
- Check if PDF requires authentication
- Try downloading and hosting elsewhere if needed

### Blocked by Website

**Problem:** 403 Forbidden or similar errors

**Solutions:**
- Some sites block Jina's user agent
- Try adding specific `targetSelector`
- Consider using Apify Web Scraper for complex sites
- Check site's robots.txt for restrictions

## 📈 Performance Tips

**For Speed:**
- Use default engine (not ReaderLM-v2)
- Enable caching
- Increase `batchSize` to 10-20
- Use low `timeout` values (15000ms)

**For Quality:**
- Enable `useReaderLM: true`
- Enable `generateImageAlt: true`
- Increase `timeout` to 45000-60000ms
- Use `targetSelector` for precision

**For Cost:**
- Disable ReaderLM-v2
- Disable image alt generation
- Use aggressive caching
- Filter URLs before processing

## 🔒 Privacy & Security

- ✅ No data stored by Jina beyond cache period (default: 1 hour)
- ✅ Open-source Jina Reader (self-host if needed)
- ✅ API keys encrypted in Apify
- ✅ No tracking or analytics by this actor
- ⚠️ Publicly accessible URLs only (no authenticated content)

## 📚 Resources

### Jina AI
- **Jina Reader:** https://jina.ai/reader/
- **API Docs:** https://github.com/jina-ai/reader
- **ReaderLM-v2:** https://jina.ai/models/ReaderLM-v2/
- **Get API Key:** https://jina.ai/api-dashboard/

### Related Jina Services
- **Embeddings:** https://jina.ai/embeddings/ (for RAG pipelines)
- **Reranker:** https://jina.ai/reranker/ (improve search quality)
- **Classifier:** https://jina.ai/classifier/ (content categorization)

### Complementary Actors
- **AI Training Data Collector:** Full-site crawling with auto-categorization
- **Apify Web Scraper:** Complex scraping with custom logic
- **Cheerio Scraper:** Fast, lightweight HTML parsing

## 📄 License

This actor: Apache-2.0
Jina Reader API: Apache-2.0 (open-source)

---

**Built by DarkzOGx** | [GitHub](https://github.com/darkzogx) | [More Actors](https://apify.com/darkzogx)

Convert URLs to clean markdown. Build better AI systems. 🚀
