import { Actor } from 'apify';
import { gotScraping } from 'got-scraping';

/**
 * Jina Reader Cloud Wrapper
 * Converts URLs to clean, LLM-ready markdown using Jina AI Reader API
 */

await Actor.main(async () => {
    console.log('🚀 Starting Jina Reader Cloud Wrapper...');

    // Get input from Apify
    const input = await Actor.getInput();
    const {
        urls = [],
        timeout = 30000,
        returnFormat = 'markdown',
        useReaderLM = false,
        generateImageAlt = false,
        noCache = false,
        cacheTolerance,
        targetSelector,
        waitForSelector,
        jinaApiKey,
        batchSize = 5,
        maxRetries = 3
    } = input;

    // Validation
    if (!urls || urls.length === 0) {
        throw new Error('No URLs provided. Please provide at least one URL in the "urls" array.');
    }

    console.log(`📊 Configuration:
    - URLs to process: ${urls.length}
    - Return format: ${returnFormat}
    - Use ReaderLM-v2: ${useReaderLM}
    - Generate image alt text: ${generateImageAlt}
    - Timeout: ${timeout}ms
    - Batch size: ${batchSize}
    `);

    // Stats tracking
    const stats = {
        totalUrls: urls.length,
        successful: 0,
        failed: 0,
        totalTokens: 0,
        startTime: Date.now()
    };

    /**
     * Process a single URL through Jina Reader
     */
    async function processUrl(url, retryCount = 0) {
        try {
            console.log(`\n📄 Processing: ${url}`);

            // Build Jina Reader URL
            const jinaUrl = `https://r.jina.ai/${url}`;

            // Prepare headers
            const headers = {
                'User-Agent': 'Apify-Jina-Reader-Wrapper/1.0'
            };

            // Add API key if provided
            if (jinaApiKey) {
                headers['Authorization'] = `Bearer ${jinaApiKey}`;
            }

            // Add timeout
            if (timeout) {
                headers['X-Timeout'] = timeout.toString();
            }

            // Add return format
            if (returnFormat === 'json') {
                headers['Accept'] = 'application/json';
            } else if (returnFormat !== 'markdown') {
                headers['X-Return-Format'] = returnFormat;
            }

            // Add ReaderLM-v2 engine (consumes 3x tokens but higher quality)
            if (useReaderLM) {
                headers['X-Engine'] = 'readerlm-v2';
            }

            // Add image alt text generation
            if (generateImageAlt) {
                headers['X-With-Generated-Alt'] = 'true';
            }

            // Add cache control
            if (noCache) {
                headers['X-No-Cache'] = 'true';
            } else if (cacheTolerance !== undefined) {
                headers['X-Cache-Tolerance'] = cacheTolerance.toString();
            }

            // Add CSS selectors
            if (targetSelector) {
                headers['X-Target-Selector'] = targetSelector;
            }
            if (waitForSelector) {
                headers['X-Wait-For-Selector'] = waitForSelector;
            }

            // Make request to Jina Reader
            const startTime = Date.now();
            const response = await gotScraping({
                url: jinaUrl,
                headers,
                responseType: returnFormat === 'json' ? 'json' : 'text',
                timeout: {
                    request: timeout + 5000 // Add 5s buffer for network
                },
                retry: {
                    limit: 0 // We handle retries ourselves
                }
            });

            const processingTime = Date.now() - startTime;

            // Parse response
            let title, content, metadata;

            if (returnFormat === 'json') {
                // JSON response from Jina
                const data = response.body;
                title = data.title || 'Untitled';
                content = data.content || '';
                metadata = data;
            } else {
                // Markdown or other text response
                content = response.body;

                // Try to extract title from markdown (first # heading)
                const titleMatch = content.match(/^#\s+(.+)$/m);
                title = titleMatch ? titleMatch[1] : url;
            }

            // Estimate token count (rough approximation: 1 token ≈ 4 characters)
            const estimatedTokens = Math.ceil(content.length / 4);
            stats.totalTokens += estimatedTokens;

            // Calculate cost (Jina pricing: varies, but we'll use approximation)
            const tokenCost = useReaderLM ? estimatedTokens * 3 : estimatedTokens;
            const estimatedCost = (tokenCost / 10000) * 0.001; // Rough estimate

            console.log(`✅ Success: ${url}`);
            console.log(`   - Processing time: ${processingTime}ms`);
            console.log(`   - Content length: ${content.length.toLocaleString()} chars`);
            console.log(`   - Estimated tokens: ${estimatedTokens.toLocaleString()}`);
            console.log(`   - Token cost: ${tokenCost.toLocaleString()} (${useReaderLM ? '3x for ReaderLM-v2' : 'standard'})`);

            stats.successful++;

            // Return result
            return {
                url,
                title,
                content,
                metadata: {
                    ...metadata,
                    processingTime,
                    contentLength: content.length,
                    estimatedTokens,
                    tokenCost,
                    processedAt: new Date().toISOString(),
                    returnFormat,
                    usedReaderLM: useReaderLM
                },
                status: 'success'
            };

        } catch (error) {
            console.error(`❌ Error processing ${url}: ${error.message}`);

            // Retry logic
            if (retryCount < maxRetries) {
                console.log(`🔄 Retrying ${url} (attempt ${retryCount + 1}/${maxRetries})...`);
                await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1))); // Exponential backoff
                return processUrl(url, retryCount + 1);
            }

            stats.failed++;

            return {
                url,
                title: null,
                content: null,
                error: error.message,
                metadata: {
                    processedAt: new Date().toISOString(),
                    returnFormat
                },
                status: 'error'
            };
        }
    }

    /**
     * Process URLs in batches to respect rate limits
     */
    async function processBatch(urlBatch) {
        const promises = urlBatch.map(url => processUrl(url));
        return Promise.all(promises);
    }

    // Process all URLs in batches
    const results = [];
    for (let i = 0; i < urls.length; i += batchSize) {
        const batch = urls.slice(i, i + batchSize);
        console.log(`\n📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(urls.length / batchSize)} (${batch.length} URLs)...`);

        const batchResults = await processBatch(batch);
        results.push(...batchResults);

        // Small delay between batches to respect rate limits
        if (i + batchSize < urls.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    // Save results to dataset
    await Actor.pushData(results);

    // Calculate final stats
    const totalTime = Date.now() - stats.startTime;
    const avgTimePerUrl = totalTime / stats.totalUrls;

    console.log(`\n
═══════════════════════════════════════════════════════
✅ Processing Complete!

📊 Statistics:
   - Total URLs: ${stats.totalUrls}
   - Successful: ${stats.successful}
   - Failed: ${stats.failed}
   - Success rate: ${((stats.successful / stats.totalUrls) * 100).toFixed(1)}%

💰 Token Usage:
   - Total tokens: ${stats.totalTokens.toLocaleString()}
   - Cost multiplier: ${useReaderLM ? '3x (ReaderLM-v2)' : '1x (standard)'}
   - Effective tokens: ${(stats.totalTokens * (useReaderLM ? 3 : 1)).toLocaleString()}

⏱️  Performance:
   - Total time: ${(totalTime / 1000).toFixed(1)}s
   - Average per URL: ${(avgTimePerUrl / 1000).toFixed(2)}s

📁 Results saved to dataset
═══════════════════════════════════════════════════════
    `);

    // Set output for easy access
    await Actor.setValue('OUTPUT', {
        stats: {
            totalUrls: stats.totalUrls,
            successful: stats.successful,
            failed: stats.failed,
            successRate: ((stats.successful / stats.totalUrls) * 100).toFixed(1) + '%',
            totalTokens: stats.totalTokens,
            effectiveTokens: stats.totalTokens * (useReaderLM ? 3 : 1),
            totalTimeSeconds: (totalTime / 1000).toFixed(1),
            avgTimePerUrlSeconds: (avgTimePerUrl / 1000).toFixed(2)
        },
        results
    });

    console.log('\n🎉 Actor finished successfully!');
});
