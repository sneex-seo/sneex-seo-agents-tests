// SEO Agent System - Main JavaScript Application

let websocket = null;
let sessionId = null;

// Detect language from keyword/text
function detectLanguage(text) {
    if (!text) return 'uk';
    
    const textLower = text.toLowerCase();
    
    // Ukrainian patterns
    const ukPatterns = [
        /[а-яєіїґ]/i,  // Ukrainian Cyrillic characters
        /\b(продаж|купити|послуги|товар|компанія|бізнес|вартість|ціна|замовити|зв'язатися|допомога|інформація)\b/i
    ];
    
    // Russian patterns
    const ruPatterns = [
        /[а-яё]/i,  // Russian Cyrillic characters (including ё)
        /\b(продажа|купить|услуги|товар|компания|бизнес|стоимость|цена|заказать|связаться|помощь|информация)\b/i
    ];
    
    // English patterns
    const enPatterns = [
        /^[a-z\s]+$/i,  // Only Latin characters
        /\b(buy|sell|service|product|company|business|price|order|contact|help|information)\b/i
    ];
    
    // Check patterns
    let ukScore = 0;
    let ruScore = 0;
    let enScore = 0;
    
    for (const pattern of ukPatterns) {
        if (pattern.test(text)) ukScore++;
    }
    
    for (const pattern of ruPatterns) {
        if (pattern.test(text)) ruScore++;
    }
    
    for (const pattern of enPatterns) {
        if (pattern.test(text)) enScore++;
    }
    
    // Determine language
    if (enScore > 0 && !ukPatterns[0].test(text) && !ruPatterns[0].test(text)) {
        return 'en';
    } else if (ruScore > ukScore) {
        return 'ru';
    } else if (ukScore > 0) {
        return 'uk';
    }
    
    // Default to Ukrainian if unclear
    return 'uk';
}

// Toggle Generation Mode
function toggleGenerationMode() {
    const mode = document.getElementById('generationMode').value;
    const processingMode = document.getElementById('processingMode').value;
    const autoFields = document.getElementById('autoModeFields');
    const chatgptSingleFields = document.getElementById('chatgptSingleFields');
    const batchBusinessFields = document.getElementById('batchBusinessFields');
    const linkBuilderFields = document.getElementById('linkBuilderFields');
    const batchModeFields = document.getElementById('batchModeFields');
    
    // Скрываем все поля
    if (autoFields) autoFields.style.display = 'none';
    if (chatgptSingleFields) chatgptSingleFields.style.display = 'none';
    if (linkBuilderFields) linkBuilderFields.style.display = 'none';
    if (batchModeFields) batchModeFields.style.display = 'none';
    
    // Show/hide fields for single mode
    if (processingMode === 'single') {
        if (mode === 'auto') {
            if (autoFields) autoFields.style.display = 'block';
            if (chatgptSingleFields) chatgptSingleFields.style.display = 'none';
            if (linkBuilderFields) linkBuilderFields.style.display = 'none';
        } else if (mode === 'meta_only') {
            if (autoFields) autoFields.style.display = 'none';
            if (chatgptSingleFields) chatgptSingleFields.style.display = 'block';
            if (linkBuilderFields) linkBuilderFields.style.display = 'none';
        } else if (mode === 'link_analysis') {
            if (autoFields) autoFields.style.display = 'none';
            if (chatgptSingleFields) chatgptSingleFields.style.display = 'none';
            if (linkBuilderFields) linkBuilderFields.style.display = 'block';
        } else {
            if (autoFields) autoFields.style.display = 'none';
            if (chatgptSingleFields) chatgptSingleFields.style.display = 'block';
            if (linkBuilderFields) linkBuilderFields.style.display = 'none';
        }
    } else if (processingMode === 'batch') {
        // For batch mode, show business fields for ChatGPT and meta_only modes
        if (mode === 'chatgpt' || mode === 'meta_only') {
            if (batchBusinessFields) batchBusinessFields.style.display = 'block';
        } else {
            if (batchBusinessFields) batchBusinessFields.style.display = 'none';
        }
        
        // Для link_analysis в batch режимі не показуємо batch поля
        if (mode === 'link_analysis') {
            if (batchModeFields) batchModeFields.style.display = 'none';
            if (linkBuilderFields) linkBuilderFields.style.display = 'block';
            // Скрываем все поля batch режима
            const simpleField = document.getElementById('simpleInputField');
            const keywordsField = document.getElementById('keywordsInputField');
            const csvField = document.getElementById('csvUploadField');
            const manualField = document.getElementById('manualInputField');
            if (simpleField) simpleField.style.display = 'none';
            if (keywordsField) keywordsField.style.display = 'none';
            if (csvField) csvField.style.display = 'none';
            if (manualField) manualField.style.display = 'none';
        } else {
            if (batchModeFields) batchModeFields.style.display = 'block';
            if (linkBuilderFields) linkBuilderFields.style.display = 'none';
        }
    }
}

// Toggle Processing Mode
function toggleProcessingMode() {
    const mode = document.getElementById('processingMode').value;
    const singleFields = document.getElementById('singlePageFields');
    const batchFields = document.getElementById('batchModeFields');
    const linkBuilderFields = document.getElementById('linkBuilderFields');
    const generationMode = document.getElementById('generationMode').value;
    
    if (mode === 'single') {
        singleFields.style.display = 'block';
        batchFields.style.display = 'none';
        toggleGenerationMode();
    } else {
        singleFields.style.display = 'none';
        if (generationMode === 'link_analysis') {
            batchFields.style.display = 'none';
            if (linkBuilderFields) linkBuilderFields.style.display = 'block';
            // Скрываем все поля batch режима
            const simpleField = document.getElementById('simpleInputField');
            const keywordsField = document.getElementById('keywordsInputField');
            const csvField = document.getElementById('csvUploadField');
            const manualField = document.getElementById('manualInputField');
            if (simpleField) simpleField.style.display = 'none';
            if (keywordsField) keywordsField.style.display = 'none';
            if (csvField) csvField.style.display = 'none';
            if (manualField) manualField.style.display = 'none';
        } else {
            batchFields.style.display = 'block';
            if (linkBuilderFields) linkBuilderFields.style.display = 'none';
        }
        document.getElementById('autoModeFields').style.display = 'none';
        document.getElementById('chatgptSingleFields').style.display = 'none';
        toggleBatchInput();
    }
}

// Toggle Batch Input Type
function toggleBatchInput() {
    const generationMode = document.getElementById('generationMode').value;
    
    // Не выполняем эту функцию для link_analysis
    if (generationMode === 'link_analysis') {
        return;
    }
    
    const inputType = document.querySelector('input[name="batchInputType"]:checked').value;
    const simpleField = document.getElementById('simpleInputField');
    const keywordsField = document.getElementById('keywordsInputField');
    const csvField = document.getElementById('csvUploadField');
    const manualField = document.getElementById('manualInputField');
    
    // Hide all fields
    simpleField.style.display = 'none';
    keywordsField.style.display = 'none';
    csvField.style.display = 'none';
    manualField.style.display = 'none';
    
    if (inputType === 'simple') {
        simpleField.style.display = 'block';
        keywordsField.style.display = 'block';
    } else if (inputType === 'csv') {
        csvField.style.display = 'block';
    } else {
        manualField.style.display = 'block';
    }
    
    toggleGenerationMode();
}

// Initialize Form Handler
function initializeFormHandler() {
    const form = document.getElementById('seoForm');
    if (!form) {
        console.error('Form not found!');
        return;
    }
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('Form submitted!');
        
        const formData = new FormData(e.target);
        const generationMode = formData.get('generationMode');
        const processingMode = formData.get('processingMode');
        
        console.log('Generation mode:', generationMode);
        console.log('Processing mode:', processingMode);
        
        // Для link_analysis всегда используем single режим обработки (не batch)
        if (processingMode === 'batch' && generationMode !== 'link_analysis') {
            await processBatchRequest(formData, generationMode);
        } else {
            // Формуємо user_query для нової системи
            let userQuery = '';
            let data = {};
            
            if (generationMode === 'auto') {
                const url = formData.get('url');
                const topic = formData.get('topic');
                
                if (!url || !topic) {
                    alert('Будь ласка, заповніть URL та тему сторінки');
                    return;
                }
                
                userQuery = `Згенеруй текст для ${url} про ${topic}`;
                data.url = url;
                data.topic = topic;
            } else if (generationMode === 'link_analysis') {
                // Link Builder теперь в отдельном табе
                return;
            } else if (generationMode === 'meta_only') {
                const h1Keyword = formData.get('h1Keyword');
                const brandName = formData.get('brandName');
                const businessType = formData.get('businessType');
                const targetAudience = formData.get('targetAudience') || '';
                const url = formData.get('chatgptUrl') || `https://example.com/${h1Keyword.toLowerCase().replace(/\s+/g, '-')}`;
                
                if (!h1Keyword || !brandName || !businessType) {
                    alert('Будь ласка, заповніть обов\'язкові поля: H1 ключове слово, Назва бренду та Тип бізнесу');
                    return;
                }
                
                const detectedLanguage = detectLanguage(h1Keyword);
                
                userQuery = `Створи тільки мета-теги (Title та Description) для ${url} з ключовим словом "${h1Keyword}" для бренду ${brandName} (${businessType}). Без генерації тексту контенту.`;
                if (targetAudience) {
                    userQuery += ` Цільова аудиторія: ${targetAudience}.`;
                }
                data.url = url;
                data.topic = h1Keyword;
                data.keyword = h1Keyword;
                data.target_audience = targetAudience;
                data.language = detectedLanguage;
            } else {
                const h1Keyword = formData.get('h1Keyword');
                const brandName = formData.get('brandName');
                const businessType = formData.get('businessType');
                const targetAudience = formData.get('targetAudience') || '';
                const url = formData.get('chatgptUrl') || `https://example.com/${h1Keyword.toLowerCase().replace(/\s+/g, '-')}`;
                
                if (!h1Keyword || !brandName || !businessType) {
                    alert('Будь ласка, заповніть обов\'язкові поля: H1 ключове слово, Назва бренду та Тип бізнесу');
                    return;
                }
                
                const detectedLanguage = detectLanguage(h1Keyword);
                
                userQuery = `Створи контент для ${url} з ключовим словом "${h1Keyword}" для бренду ${brandName} (${businessType})`;
                if (targetAudience) {
                    userQuery += ` Цільова аудиторія: ${targetAudience}.`;
                }
                data.url = url;
                data.topic = h1Keyword;
                data.keyword = h1Keyword;
                data.target_audience = targetAudience;
                data.language = detectedLanguage;
            }
            
            data.user_query = userQuery;
            await processRequest(data);
        }
    });
    
    console.log('Form handler initialized');
}

// Process Single Request
async function processRequest(data) {
    const loading = document.getElementById('loading');
    const progress = document.getElementById('progress');
    const results = document.getElementById('results');
    
    sessionId = generateSessionId();
    await connectWebSocket(sessionId);
    
    loading.style.display = 'block';
    progress.style.display = 'none';
    results.style.display = 'none';
    
    try {
        const response = await fetch('/process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({...data, session_id: sessionId})
        });
        
        if (!response.ok) {
            throw new Error('Ошибка обработки запроса');
        }
        
        const result = await response.json();
        displayResults(result);
        
    } catch (error) {
        alert('Ошибка: ' + error.message);
        console.error('Error:', error);
    } finally {
        loading.style.display = 'none';
        if (websocket) {
            websocket.close();
        }
    }
}

// Connect WebSocket
async function connectWebSocket(sessionId) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/${sessionId}`;
    
    websocket = new WebSocket(wsUrl);
    
    websocket.onopen = function(event) {
        console.log('WebSocket connected');
    };
    
    websocket.onmessage = function(event) {
        const message = JSON.parse(event.data);
        handleProgressUpdate(message);
    };
    
    websocket.onclose = function(event) {
        console.log('WebSocket disconnected');
    };
    
    websocket.onerror = function(error) {
        console.error('WebSocket error:', error);
    };
}

// Generate Session ID
function generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9);
}

// Handle Progress Update
function handleProgressUpdate(message) {
    const loading = document.getElementById('loading');
    const progress = document.getElementById('progress');
    
    loading.style.display = 'none';
    progress.style.display = 'block';
    
    if (message.type === 'agent_update') {
        updateAgentProgress(message.agent_name, message.status, message.data);
    } else if (message.type === 'step_update') {
        updateCurrentStep(message.step_info);
    } else if (message.type === 'log_update') {
        addLogEntry(message.log_level, message.message);
    } else if (message.type === 'completed') {
        setTimeout(() => {
            progress.style.display = 'none';
        }, 2000);
    }
}

// Update Agent Progress
function updateAgentProgress(agentName, status, data) {
    const container = document.getElementById('agentProgress');
    
    let card = document.getElementById(`agent-${agentName}`);
    if (!card) {
        card = document.createElement('div');
        card.id = `agent-${agentName}`;
        card.className = 'agent-card';
        container.appendChild(card);
    }
    
    card.className = `agent-card ${status}`;
    
    const statusText = {
        'waiting': '⏳ Ожидание',
        'active': '🔄 Выполняется',
        'completed': '✅ Завершен',
        'error': '❌ Ошибка'
    };
    
    const timeText = data.execution_time ? ` (${data.execution_time.toFixed(2)}s)` : '';
    const confidenceText = data.confidence ? ` - Уверенность: ${(data.confidence * 100).toFixed(1)}%` : '';
    
    card.innerHTML = `
        <div class="agent-name">${agentName.replace('_', ' ').toUpperCase()}</div>
        <div class="agent-status">${statusText[status] || status}</div>
        <div class="agent-time">${timeText}${confidenceText}</div>
    `;
}

// Update Current Step
function updateCurrentStep(stepInfo) {
    const stepInfoDiv = document.getElementById('stepInfo');
    stepInfoDiv.textContent = stepInfo;
}

// Update Batch Progress
function updateBatchProgress(current, total, currentPage) {
    const percent = total > 0 ? Math.round((current / total) * 100) : 0;
    document.getElementById('batchProgressBar').style.width = percent + '%';
    document.getElementById('batchProgressPercent').textContent = percent + '%';
    document.getElementById('batchProgressText').textContent = `${current} из ${total}`;
    document.getElementById('currentBatchPage').textContent = currentPage || '-';
}

// Add Batch Log
function addBatchLog(type, message) {
    const logContainer = document.getElementById('batchStatusLog');
    const logEntry = document.createElement('div');
    logEntry.style.marginBottom = '5px';
    logEntry.style.padding = '5px';
    logEntry.style.borderRadius = '3px';
    
    const colors = {
        'info': '#e3f2fd',
        'success': '#e8f5e9',
        'error': '#ffebee',
        'processing': '#fff3e0'
    };
    
    logEntry.style.background = colors[type] || '#f5f5f5';
    logEntry.textContent = message;
    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight;
}

// Add Log Entry
function addLogEntry(level, message) {
    const logContainer = document.getElementById('logContainer');
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry log-${level}`;
    logEntry.textContent = `[${timestamp}] ${message}`;
    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight;
}

// Process Batch Request
async function processBatchRequest(formData, generationMode) {
    const batchInputType = document.querySelector('input[name="batchInputType"]:checked').value;
    const delay = parseInt(formData.get('batchDelay')) || 2;
    let batchData = [];
    
    if (batchInputType === 'simple') {
        const urlList = formData.get('urlList');
        const keywordsList = formData.get('keywordsList');
        const brandName = formData.get('batchBrandName');
        const businessType = formData.get('batchBusinessType');
        const targetAudience = formData.get('batchTargetAudience') || '';
        
        if (!urlList) {
            alert('Пожалуйста, введите список URL страниц');
            return;
        }
        
        batchData = parseSimpleList(urlList, keywordsList, generationMode, brandName, businessType, targetAudience);
    } else if (batchInputType === 'csv') {
        const csvFile = document.getElementById('csvFile').files[0];
        if (!csvFile) {
            alert('Пожалуйста, выберите CSV файл');
            return;
        }
        const csvText = await csvFile.text();
        const brandName = formData.get('batchBrandName');
        const businessType = formData.get('batchBusinessType');
        const targetAudience = formData.get('batchTargetAudience') || '';
        batchData = parseCSV(csvText, generationMode, brandName, businessType, targetAudience);
    } else {
        const manualText = formData.get('batchData');
        if (!manualText) {
            alert('Пожалуйста, введите данные для пакетной обработки');
            return;
        }
        const brandName = formData.get('batchBrandName');
        const businessType = formData.get('batchBusinessType');
        const targetAudience = formData.get('batchTargetAudience') || '';
        batchData = parseCSV(manualText, generationMode, brandName, businessType, targetAudience);
    }
    
    if (batchData.length === 0) {
        alert('Не найдено данных для обработки');
        return;
    }
    
    // Show progress
    const loading = document.getElementById('loading');
    const progress = document.getElementById('progress');
    const results = document.getElementById('results');
    const batchProgressDiv = document.getElementById('batchProgress');
    
    loading.style.display = 'none';
    progress.style.display = 'block';
    results.style.display = 'none';
    batchProgressDiv.style.display = 'block';
    
    const logContainer = document.getElementById('logContainer');
    const batchStatusLog = document.getElementById('batchStatusLog');
    logContainer.innerHTML = '';
    batchStatusLog.innerHTML = '';
    
    updateBatchProgress(0, batchData.length, 'Начинается пакетная обработка...');
    addBatchLog('info', `📋 Всего страниц: ${batchData.length}`);
    addBatchLog('info', `⏱️ Задержка между страницами: ${delay} сек.`);
    addLogEntry('info', `Начинается пакетная обработка: ${batchData.length} страниц`);
    
    const batchResults = [];
    
    for (let i = 0; i < batchData.length; i++) {
        const pageData = batchData[i];
        const pageNum = i + 1;
        
        updateBatchProgress(i, batchData.length, pageData.url || pageData.topic);
        addBatchLog('processing', `🔄 [${pageNum}/${batchData.length}] Обработка: ${pageData.url}`);
        addLogEntry('info', `\n[${pageNum}/${batchData.length}] Обработка: ${pageData.url}`);
        
        try {
            sessionId = generateSessionId();
            await connectWebSocket(sessionId);
            
            const requestData = {...pageData, session_id: sessionId};
            console.log('Sending request data:', requestData);
            
            const response = await fetch('/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });
            
            if (!response.ok) {
                throw new Error('Ошибка обработки запроса');
            }
            
            const result = await response.json();
            batchResults.push({
                url: pageData.url,
                success: true,
                result: result
            });
            
            addBatchLog('success', `✅ [${pageNum}/${batchData.length}] Успешно: ${pageData.url} (балл: ${result.validation && result.validation.overall_score ? result.validation.overall_score.toFixed(1) : '0'})`);
            addLogEntry('success', `✅ Успешно: ${pageData.url} (балл: ${result.validation && result.validation.overall_score ? result.validation.overall_score.toFixed(1) : '0'})`);
            
            if (websocket) {
                websocket.close();
            }
            
        } catch (error) {
            console.error('Batch processing error:', error);
            const errorMsg = error.message || 'Неизвестная ошибка';
            batchResults.push({
                url: pageData.url,
                success: false,
                error: errorMsg
            });
            addBatchLog('error', `❌ [${pageNum}/${batchData.length}] Ошибка: ${pageData.url} - ${errorMsg}`);
            addLogEntry('error', `❌ Ошибка: ${pageData.url} - ${errorMsg}`);
        }
        
        updateBatchProgress(pageNum, batchData.length, pageData.url || pageData.topic);
        
        if (i < batchData.length - 1) {
            addBatchLog('info', `⏳ Ожидание ${delay} сек...`);
            await new Promise(resolve => setTimeout(resolve, delay * 1000));
        }
    }
    
    updateBatchProgress(batchData.length, batchData.length, 'Обработка завершена');
    addBatchLog('success', `🎉 Пакетная обработка завершена!`);
    addBatchLog('info', `📊 Всего: ${batchResults.length} | Успешно: ${batchResults.filter(r => r.success).length} | Ошибок: ${batchResults.filter(r => !r.success).length}`);
    
    addLogEntry('success', `\n========== ПАКЕТНАЯ ОБРАБОТКА ЗАВЕРШЕНА ==========`);
    addLogEntry('info', `Всего обработано: ${batchResults.length} страниц`);
    addLogEntry('success', `Успешно: ${batchResults.filter(r => r.success).length}`);
    addLogEntry('error', `С ошибками: ${batchResults.filter(r => !r.success).length}`);
    
    displayBatchResults(batchResults);
}

// Parse Simple List
function parseSimpleList(urlList, keywordsList, generationMode, brandName, businessType, targetAudience) {
    const urls = urlList.trim().split('\n').filter(url => url.trim());
    const keywords = keywordsList ? keywordsList.trim().split('\n').filter(k => k.trim()) : [];
    const data = [];
    
    urls.forEach((url, index) => {
        const cleanUrl = url.trim();
        if (cleanUrl) {
            let topic = '';
            if (keywords[index] && keywords[index].trim()) {
                topic = keywords[index].trim();
            } else {
                const urlParts = cleanUrl.split('/');
                const lastPart = urlParts[urlParts.length - 1];
                topic = lastPart.replace(/[^a-zA-Zа-яА-Я0-9]/g, ' ');
                topic = topic.trim() || 'Page';
            }
            
            const detectedLanguage = detectLanguage(topic);
            let userQuery = '';
            const pageData = {
                url: cleanUrl,
                topic: topic,
                keyword: topic,
                language: detectedLanguage
            };
            
            if (targetAudience) {
                pageData.target_audience = targetAudience;
            }
            
            if (generationMode === 'chatgpt' && brandName && businessType) {
                userQuery = `Створи контент для ${cleanUrl} з ключовим словом "${topic}" для бренду ${brandName} (${businessType})`;
                if (targetAudience) {
                    userQuery += ` Цільова аудиторія: ${targetAudience}.`;
                }
            } else if (generationMode === 'meta_only' && brandName && businessType) {
                userQuery = `Створи тільки мета-теги (Title та Description) для ${cleanUrl} з ключовим словом "${topic}" для бренду ${brandName} (${businessType}). Без генерації тексту контенту.`;
                if (targetAudience) {
                    userQuery += ` Цільова аудиторія: ${targetAudience}.`;
                }
            } else {
                userQuery = `Згенеруй текст для ${cleanUrl} про ${topic}`;
            }
            
            pageData.user_query = userQuery;
            data.push(pageData);
        }
    });
    
    return data;
}

// Parse CSV
function parseCSV(csvText, generationMode, brandName, businessType, targetAudience) {
    const lines = csvText.trim().split('\n');
    const data = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith('url,')) continue;
        
        const parts = line.split(',').map(p => p.trim());
        
        if (parts.length >= 2) {
            const url = parts[0];
            const topic = parts[1];
            const detectedLanguage = detectLanguage(topic);
            let userQuery = '';
            
            const pageData = {
                url: url,
                topic: topic,
                keyword: topic,
                language: detectedLanguage
            };
            
            if (targetAudience) {
                pageData.target_audience = targetAudience;
            }
            
            if (generationMode === 'chatgpt' && parts.length >= 3) {
                const pageBrandName = parts[2] || brandName || 'Brand';
                const pageBusinessType = parts[3] || businessType || 'general';
                userQuery = `Створи контент для ${url} з ключовим словом "${topic}" для бренду ${pageBrandName} (${pageBusinessType})`;
                if (targetAudience) {
                    userQuery += ` Цільова аудиторія: ${targetAudience}.`;
                }
            } else if (generationMode === 'meta_only' && parts.length >= 3) {
                const pageBrandName = parts[2] || brandName || 'Brand';
                const pageBusinessType = parts[3] || businessType || 'general';
                userQuery = `Створи тільки мета-теги (Title та Description) для ${url} з ключовим словом "${topic}" для бренду ${pageBrandName} (${pageBusinessType}). Без генерації тексту контенту.`;
                if (targetAudience) {
                    userQuery += ` Цільова аудиторія: ${targetAudience}.`;
                }
            } else {
                userQuery = `Згенеруй текст для ${url} про ${topic}`;
            }
            
            pageData.user_query = userQuery;
            data.push(pageData);
        }
    }
    
    return data;
}

// Display Batch Results
function displayBatchResults(batchResults) {
    const resultsContent = document.getElementById('resultsContent');
    const results = document.getElementById('results');
    
    const successCount = batchResults.filter(r => r.success).length;
    const errorCount = batchResults.filter(r => !r.success).length;
    const totalCount = batchResults.length;
    
    let html = `
        <h2>📊 Результаты пакетной обработки</h2>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3>Статистика:</h3>
            <ul style="font-size: 16px;">
                <li><strong>Всего страниц:</strong> ${totalCount}</li>
                <li style="color: #28a745;"><strong>✅ Успешно:</strong> ${successCount}</li>
                <li style="color: #dc3545;"><strong>❌ С ошибками:</strong> ${errorCount}</li>
                <li><strong>Процент успеха:</strong> ${((successCount / totalCount) * 100).toFixed(1)}%</li>
            </ul>
        </div>
        
        <div style="margin-top: 30px;">
            <h3>Детали по каждой странице:</h3>
    `;
    
    batchResults.forEach((item, index) => {
        if (item.success) {
            const score = item.result.validation && item.result.validation.overall_score ? item.result.validation.overall_score : 0;
            const scoreClass = score >= 80 ? 'good' : score >= 60 ? 'warning' : 'bad';
            html += `
                <div class="meta-section" style="margin: 10px 0;">
                    <h4 style="color: #28a745;">✅ ${index + 1}. ${item.url}</h4>
                    <div class="score ${scoreClass}">Балл: ${score.toFixed(1)}/100</div>
                    <p><strong>Title:</strong> ${item.result.meta_tags && item.result.meta_tags.title ? item.result.meta_tags.title : 'N/A'}</p>
                    <p><strong>Слов:</strong> ${item.result.content && item.result.content.word_count ? item.result.content.word_count : 'N/A'}</p>
                    <details>
                        <summary style="cursor: pointer; color: #007bff;">Показать полные результаты</summary>
                        <div style="margin-top: 10px;">
                            <p><strong>H1:</strong> ${item.result.meta_tags && item.result.meta_tags.h1 ? item.result.meta_tags.h1 : 'N/A'}</p>
                            <p><strong>Description:</strong> ${item.result.meta_tags && item.result.meta_tags.description ? item.result.meta_tags.description : 'N/A'}</p>
                            <p><strong>Читабельность:</strong> ${item.result.content && item.result.content.readability_score ? item.result.content.readability_score.toFixed(1) : 'N/A'}</p>
                        </div>
                    </details>
                </div>
            `;
        } else {
            html += `
                <div class="meta-section" style="margin: 10px 0; border-left-color: #dc3545;">
                    <h4 style="color: #dc3545;">❌ ${index + 1}. ${item.url}</h4>
                    <p style="color: #dc3545;"><strong>Ошибка:</strong> ${item.error}</p>
                </div>
            `;
        }
    });
    
    html += `
        </div>
        <div style="margin-top: 30px; text-align: center;">
            <button onclick="location.reload()" style="background-color: #28a745;">
                🔄 Обработать еще страницы
            </button>
            <button onclick="exportBatchResults()" style="background-color: #007bff; margin-left: 10px;">
                💾 Экспортировать результаты
            </button>
        </div>
    `;
    
    resultsContent.innerHTML = html;
    results.style.display = 'block';
    
    window.batchResults = batchResults;
}

// Export Batch Results
function exportBatchResults() {
    if (!window.batchResults) {
        alert('Нет результатов для экспорта');
        return;
    }
    
    let csvContent = 'URL,Статус,Балл,Title,Description,Слов\n';
    
    window.batchResults.forEach(item => {
        if (item.success) {
            const r = item.result;
            csvContent += `"${item.url}","Успешно","${r.validation && r.validation.overall_score ? r.validation.overall_score.toFixed(1) : '0'}","${r.meta_tags && r.meta_tags.title ? r.meta_tags.title : 'N/A'}","${r.meta_tags && r.meta_tags.description ? r.meta_tags.description : 'N/A'}","${r.content && r.content.word_count ? r.content.word_count : '0'}"\n`;
        } else {
            csvContent += `"${item.url}","Ошибка","0","","${item.error}","0"\n`;
        }
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `seo_batch_results_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
}

// Global variable to store current link details
let currentLinkDetails = [];

// Download Toxic Domains - make globally accessible
window.downloadToxicDomains = function() {
    if (!currentLinkDetails || currentLinkDetails.length === 0) {
        alert('Нет данных для скачивания');
        return;
    }
    
    // Токсичные домены: recommendation === 'disavow' ИЛИ risk_score >= 50 (по умолчанию)
    const toxicDomains = currentLinkDetails
        .filter(link => {
            const recommendation = (link.recommendation || '').toLowerCase();
            return recommendation === 'disavow' || (link.risk_score !== undefined && link.risk_score !== null && link.risk_score >= 50);
        })
        .map(link => link.domain)
        .filter(domain => domain) // Убираем пустые домены
        .filter((domain, index, self) => self.indexOf(domain) === index); // Убираем дубликаты
    
    if (toxicDomains.length === 0) {
        alert('Токсичные домены не найдены');
        return;
    }
    
    const content = '# Токсичные домены для disavow\n' + toxicDomains.map(domain => `domain:${domain}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `toxic_domains_${new Date().toISOString().slice(0,10)}.txt`;
    link.click();
};

// Download Suspicious Domains - make globally accessible
window.downloadSuspiciousDomains = function() {
    if (!currentLinkDetails || currentLinkDetails.length === 0) {
        alert('Нет данных для скачивания');
        return;
    }
    
    // Подозрительные домены: recommendation === 'attention' ИЛИ (risk_score >= 30 И < 50 И recommendation !== 'disavow')
    const suspiciousDomains = currentLinkDetails
        .filter(link => {
            const recommendation = (link.recommendation || '').toLowerCase();
            const riskScore = link.risk_score !== undefined && link.risk_score !== null ? link.risk_score : 0;
            return recommendation === 'attention' || (recommendation !== 'disavow' && riskScore >= 30 && riskScore < 50);
        })
        .map(link => link.domain)
        .filter(domain => domain) // Убираем пустые домены
        .filter((domain, index, self) => self.indexOf(domain) === index); // Убираем дубликаты
    
    if (suspiciousDomains.length === 0) {
        alert('Подозрительные домены не найдены');
        return;
    }
    
    const content = '# Подозрительные домены (рекомендуется проверить вручную)\n' + suspiciousDomains.map(domain => `domain:${domain}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `suspicious_domains_${new Date().toISOString().slice(0,10)}.txt`;
    link.click();
};

// Download Toxic and Suspicious Domains - make globally accessible
window.downloadToxicAndSuspiciousDomains = function() {
    if (!currentLinkDetails || currentLinkDetails.length === 0) {
        alert('Нет данных для скачивания');
        return;
    }
    
    // Токсичные + подозрительные домены: recommendation === 'disavow' ИЛИ 'attention' ИЛИ risk_score >= 30
    const domains = currentLinkDetails
        .filter(link => {
            const recommendation = (link.recommendation || '').toLowerCase();
            const riskScore = link.risk_score !== undefined && link.risk_score !== null ? link.risk_score : 0;
            return recommendation === 'disavow' || recommendation === 'attention' || riskScore >= 30;
        })
        .map(link => link.domain)
        .filter(domain => domain) // Убираем пустые домены
        .filter((domain, index, self) => self.indexOf(domain) === index); // Убираем дубликаты
    
    if (domains.length === 0) {
        alert('Токсичные и подозрительные домены не найдены');
        return;
    }
    
    const content = '# Токсичные и подозрительные домены для disavow\n' + domains.map(domain => `domain:${domain}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `toxic_and_suspicious_domains_${new Date().toISOString().slice(0,10)}.txt`;
    link.click();
};

// Download Link Details Table (CSV)
window.downloadLinkDetailsTable = function() {
    console.log('downloadLinkDetailsTable called, currentLinkDetails length:', currentLinkDetails ? currentLinkDetails.length : 0);
    if (!currentLinkDetails || currentLinkDetails.length === 0) {
        alert('Нет данных для скачивания. Убедитесь, что анализ завершен.');
        console.error('currentLinkDetails is empty:', currentLinkDetails);
        return;
    }
    
    // Формируем CSV заголовки
    const headers = ['Домен', 'Title', 'Anchor', 'Domain Rating', 'Domain Traffic', 'Page Traffic', 'Keywords', 'Linked Domains', 'Риск-скор', 'Причина', 'Рекомендация'];
    
    // Формируем CSV строки
    let csvContent = headers.join(',') + '\n';
    
    currentLinkDetails.forEach(link => {
        // Используем dr если есть, иначе domain_rating (для обратной совместимости)
        const domainRating = (link.dr !== undefined && link.dr !== null) ? link.dr : 
                            (link.domain_rating !== undefined && link.domain_rating !== null ? link.domain_rating : null);
        
        // Безопасное преобразование risk_score в число
        let riskScore = 'N/A';
        if (link.risk_score !== undefined && link.risk_score !== null) {
            const riskScoreNum = typeof link.risk_score === 'number' ? link.risk_score : parseFloat(link.risk_score);
            if (!isNaN(riskScoreNum)) {
                riskScore = riskScoreNum.toFixed(1);
            }
        }
        
        // Безопасное преобразование domainRating в число
        let domainRatingStr = 'N/A';
        if (domainRating !== null && domainRating !== undefined) {
            const domainRatingNum = typeof domainRating === 'number' ? domainRating : parseFloat(domainRating);
            if (!isNaN(domainRatingNum)) {
                domainRatingStr = domainRatingNum.toFixed(1);
            }
        }
        
        const row = [
            `"${(link.domain || 'N/A').replace(/"/g, '""')}"`,
            `"${(link.title || 'N/A').replace(/"/g, '""')}"`,
            `"${(link.anchor || 'N/A').replace(/"/g, '""')}"`,
            domainRatingStr,
            link.domain_traffic !== undefined && link.domain_traffic !== null ? link.domain_traffic.toString() : 'N/A',
            link.page_traffic !== undefined && link.page_traffic !== null ? link.page_traffic.toString() : 'N/A',
            link.keywords !== undefined && link.keywords !== null ? link.keywords.toString() : 'N/A',
            link.referring_domains !== undefined && link.referring_domains !== null ? link.referring_domains.toString() : 'N/A',
            riskScore,
            `"${(link.reason || 'N/A').replace(/"/g, '""')}"`,
            `"${link.recommendation === 'attention' ? 'требует внимания' : (link.recommendation || 'N/A')}"`
        ];
        csvContent += row.join(',') + '\n';
    });
    
    // Создаем и скачиваем файл
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' }); // UTF-8 BOM для правильного отображения кириллицы в Excel
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `link_details_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
};

// Display Single Results
function displayResults(result) {
    const resultsContent = document.getElementById('resultsContent');
    const results = document.getElementById('results');
    
    const scoreClass = result.validation && result.validation.overall_score >= 80 ? 'good' : 
                     result.validation && result.validation.overall_score >= 60 ? 'warning' : 'bad';
    
    // Перевіряємо тип задачі
    const taskType = result.task_type || 'unknown';
    
    let contentHtml = '';
    
    // Для link_analysis показуємо інші результати
    if (taskType === 'link_analysis' && result.link_analysis) {
        const linkData = result.link_analysis;
        const analyzedLinks = linkData.analyzed_links || {};
        const disavowFile = linkData.disavow_file || {};
        const report = linkData.report || {};
        const anchorStats = report.anchor_statistics || {};
        
        // Сохраняем link_details в глобальную переменную для использования в кнопках
        if (analyzedLinks.link_details && analyzedLinks.link_details.length > 0) {
            currentLinkDetails = analyzedLinks.link_details;
        }
        
        // Статистика по ссылкам
        const totalLinks = analyzedLinks.total_links || report.total_links || 0;
        const toxicLinks = analyzedLinks.toxic_links || 0;
        const suspiciousLinks = analyzedLinks.suspicious_links || 0;
        const goodLinks = analyzedLinks.good_links || 0;
        
        // Пересчитываем количество уникальных токсичных и подозрительных доменов из link_details
        let toxicDomainsCount = 0;
        let suspiciousDomainsCount = 0;
        if (analyzedLinks.link_details && analyzedLinks.link_details.length > 0) {
            const toxicDomainsSet = new Set();
            const suspiciousDomainsSet = new Set();
            
            analyzedLinks.link_details.forEach(link => {
                const recommendation = (link.recommendation || '').toLowerCase();
                const riskScore = link.risk_score !== undefined && link.risk_score !== null ? link.risk_score : 0;
                const domain = (link.domain || '').toLowerCase();
                
                if (domain) {
                    if (recommendation === 'disavow' || riskScore >= 50) {
                        toxicDomainsSet.add(domain);
                    } else if (recommendation === 'attention' || (riskScore >= 30 && riskScore < 50)) {
                        suspiciousDomainsSet.add(domain);
                    }
                }
            });
            
            toxicDomainsCount = toxicDomainsSet.size;
            suspiciousDomainsCount = suspiciousDomainsSet.size;
        }
        
        // Статистика по анкорам
        const topAnchors = anchorStats.top_anchors || [];
        const toxicAnchorsCount = anchorStats.toxic_anchors_count || 0;
        
        contentHtml = `
            <div class="score ${scoreClass}">
                Общий балл: ${result.validation && result.validation.overall_score ? result.validation.overall_score.toFixed(1) : '0'}/100
            </div>
            <p><strong>Статус:</strong> ${result.status === 'completed' ? '✅ Готово' : '⚠️ Требует доработки'}</p>
            <p><strong>Валидность:</strong> ${result.validation && result.validation.is_valid ? '✅ Прошла валидацию' : '❌ Не прошла валидацию'}</p>
            
            <div class="meta-section">
                <h3>🔗 Результаты анализа ссылок</h3>
                <p><strong>Краткое описание:</strong> Проаналізовано ${totalLinks} посилань. Знайдено ${toxicDomainsCount || toxicLinks} токсичних та ${suspiciousDomainsCount || suspiciousLinks} підозрілих доменів. Унікальних доменів: ${analyzedLinks.link_details ? analyzedLinks.link_details.length : 0}. Disavow файл містить ${disavowFile.links_count || toxicDomainsCount || toxicLinks} доменів.</p>
                
                <div style="margin-top: 15px; padding: 15px; background: #f8f9fa; border-radius: 5px;">
                    <h4 style="margin-top: 0;">📊 Статистика по ссылкам</h4>
                    <p><strong>Всего ссылок:</strong> ${totalLinks}</p>
                    ${analyzedLinks.link_details && analyzedLinks.link_details.length > 0 ? `
                        <p><strong>Унікальних доменів в таблиці:</strong> ${analyzedLinks.link_details.length} (з ${totalLinks} посилань)</p>
                        <p style="color: #666; font-size: 0.9em; margin-top: 5px;">ℹ️ Багато посилань можуть бути з одного домену, тому унікальних доменів менше ніж посилань</p>
                    ` : ''}
                    <p style="color: #dc3545;"><strong>Токсичные домены:</strong> ${toxicDomainsCount || toxicLinks} (${analyzedLinks.link_details && analyzedLinks.link_details.length > 0 ? ((toxicDomainsCount / analyzedLinks.link_details.length) * 100).toFixed(1) : 0}% от уникальных доменов)</p>
                    <p style="color: #ffc107;"><strong>Подозрительные домены:</strong> ${suspiciousDomainsCount || suspiciousLinks} (${analyzedLinks.link_details && analyzedLinks.link_details.length > 0 ? ((suspiciousDomainsCount / analyzedLinks.link_details.length) * 100).toFixed(1) : 0}% от уникальных доменов)</p>
                    <p style="color: #28a745;"><strong>Хорошие домены:</strong> ${goodLinks} (${analyzedLinks.link_details && analyzedLinks.link_details.length > 0 ? ((goodLinks / analyzedLinks.link_details.length) * 100).toFixed(1) : 0}% от уникальных доменов)</p>
                    <p><strong>Доменов в disavow файле:</strong> ${disavowFile.links_count || toxicDomainsCount || toxicLinks}</p>
                    
                    ${analyzedLinks.link_details && analyzedLinks.link_details.length > 0 ? `
                        <div style="margin-top: 15px; display: flex; gap: 10px; flex-wrap: wrap;">
                            <button id="downloadToxicBtn" class="download-btn" 
                                    style="padding: 8px 16px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">
                                📥 Скачать токсичные домены (${toxicDomainsCount || toxicLinks})
                            </button>
                            <button id="downloadSuspiciousBtn" class="download-btn" 
                                    style="padding: 8px 16px; background: #ffc107; color: black; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">
                                📥 Скачать подозрительные домены (${suspiciousDomainsCount || suspiciousLinks})
                            </button>
                            <button id="downloadToxicAndSuspiciousBtn" class="download-btn" 
                                    style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">
                                📥 Скачать токсичные + подозрительные (${(toxicDomainsCount || toxicLinks) + (suspiciousDomainsCount || suspiciousLinks)})
                            </button>
                            <button id="downloadLinkDetailsBtn" class="download-btn" 
                                    style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">
                                📊 Скачать таблицу "Детали по доменам" (${analyzedLinks.link_details.length})
                            </button>
                        </div>
                    ` : ''}
                </div>
                
                ${topAnchors.length > 0 ? `
                    <div style="margin-top: 15px; padding: 15px; background: #f8f9fa; border-radius: 5px;">
                        <h4 style="margin-top: 0;">📌 Статистика по анкорам</h4>
                        <p><strong>Токсичных анкоров:</strong> ${toxicAnchorsCount}</p>
                        <p><strong>Топ-10 анкоров:</strong></p>
                        <ul style="margin-top: 10px;">
                            ${topAnchors.map(anchor => `
                                <li style="margin-bottom: 5px;">
                                    <strong>"${anchor.anchor || 'N/A'}"</strong> - использован ${anchor.count || 0} раз(а)
                                    ${anchor.is_toxic ? '<span style="color: #dc3545;"> (токсичный)</span>' : ''}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                ${report.recommendations && report.recommendations.length > 0 ? `
                    <div style="margin-top: 15px; padding: 15px; background: #e7f3ff; border-radius: 5px; border-left: 4px solid #007bff;">
                        <h4 style="margin-top: 0;">💡 Рекомендации</h4>
                        <ul style="margin-top: 10px;">
                            ${report.recommendations.map(rec => `<li style="margin-bottom: 5px;">${rec}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                ${analyzedLinks.link_details && analyzedLinks.link_details.length > 0 ? `
                    <details style="margin-top: 15px;">
                        <summary style="cursor: pointer; font-weight: bold;">📋 Детали по доменам (${analyzedLinks.link_details.length} доменів из ${analyzedLinks.total_links || analyzedLinks.link_details.length} посилань)</summary>
                        <div style="max-height: 400px; overflow-y: auto; margin-top: 10px;">
                            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                                <thead>
                                    <tr style="background: #f8f9fa;">
                                        ${analyzedLinks.link_details && analyzedLinks.link_details.length > 0 && analyzedLinks.link_details[0].url ? `
                                            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">URL</th>
                                        ` : ''}
                                        <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Домен</th>
                                        <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Title</th>
                                        <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Anchor</th>
                                        <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Domain Rating</th>
                                        <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Domain Traffic</th>
                                        <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Page Traffic</th>
                                        <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Keywords</th>
                                        <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Linked Domains</th>
                                        <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Риск-скор</th>
                                        <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Причина</th>
                                        <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Рекомендация</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${analyzedLinks.link_details.slice(0, 100).map((link, idx) => `
                                        <tr style="background: ${idx % 2 === 0 ? '#fff' : '#f8f9fa'};">
                                            ${link.url ? `
                                                <td style="padding: 8px; border: 1px solid #ddd; max-width: 200px; overflow: hidden; text-overflow: ellipsis;" title="${link.url}">
                                                    <a href="${link.url}" target="_blank" style="color: #007bff; text-decoration: none;">${link.url.substring(0, 40)}${link.url.length > 40 ? '...' : ''}</a>
                                                </td>
                                            ` : ''}
                                            <td style="padding: 8px; border: 1px solid #ddd;">${link.domain || 'N/A'}</td>
                                            <td style="padding: 8px; border: 1px solid #ddd; max-width: 200px; overflow: hidden; text-overflow: ellipsis;" title="${link.title || ''}">${(link.title || 'N/A').substring(0, 50)}${(link.title || '').length > 50 ? '...' : ''}</td>
                                            <td style="padding: 8px; border: 1px solid #ddd; max-width: 150px; overflow: hidden; text-overflow: ellipsis;" title="${link.anchor || ''}">${(link.anchor || 'N/A').substring(0, 30)}${(link.anchor || '').length > 30 ? '...' : ''}</td>
                                            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">
                                                ${(link.dr !== undefined && link.dr !== null) ? link.dr.toFixed(1) : (link.domain_rating !== undefined && link.domain_rating !== null ? link.domain_rating.toFixed(1) : 'N/A')}
                                            </td>
                                            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">
                                                ${(link.domain_traffic !== undefined && link.domain_traffic !== null) ? link.domain_traffic.toLocaleString() : 'N/A'}
                                            </td>
                                            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">
                                                ${(link.page_traffic !== undefined && link.page_traffic !== null) ? link.page_traffic.toLocaleString() : 'N/A'}
                                            </td>
                                            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">
                                                ${(link.keywords !== undefined && link.keywords !== null) ? link.keywords.toLocaleString() : 'N/A'}
                                            </td>
                                            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">
                                                ${(link.referring_domains !== undefined && link.referring_domains !== null) ? link.referring_domains.toLocaleString() : 'N/A'}
                                            </td>
                                            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">
                                                <span style="color: ${link.risk_score >= 50 ? '#dc3545' : link.risk_score >= 30 ? '#ffc107' : '#28a745'}; font-weight: bold;">
                                                    ${link.risk_score !== undefined && link.risk_score !== null ? link.risk_score.toFixed(1) : 'N/A'}
                                                </span>
                                            </td>
                                            <td style="padding: 8px; border: 1px solid #ddd; max-width: 200px; overflow: hidden; text-overflow: ellipsis;" title="${link.reason || ''}">${(link.reason || 'N/A').substring(0, 50)}${(link.reason || '').length > 50 ? '...' : ''}</td>
                                            <td style="padding: 8px; border: 1px solid #ddd;">
                                                ${link.recommendation === 'disavow' ? '<span style="color: #dc3545; font-weight: bold;">disavow</span>' : 
                                                  link.recommendation === 'attention' ? '<span style="color: #ffc107; font-weight: bold;">требует внимания</span>' : 
                                                  link.recommendation === 'ok' ? '<span style="color: #28a745;">ok</span>' : 
                                                  link.recommendation || 'N/A'}
                                            </td>
                                        </tr>
                                    `).join('')}
                                    ${analyzedLinks.link_details.length > 100 ? `
                                        <tr>
                                            <td colspan="${analyzedLinks.link_details[0] && analyzedLinks.link_details[0].url ? '10' : '9'}" style="padding: 8px; text-align: center; color: #666;">
                                                ... и еще ${analyzedLinks.link_details.length - 100} доменів
                                            </td>
                                        </tr>
                                    ` : ''}
                                </tbody>
                            </table>
                        </div>
                    </details>
                ` : ''}
                
                ${disavowFile.content ? `
                    <details style="margin-top: 15px;">
                        <summary style="cursor: pointer; font-weight: bold;">📄 Показать disavow файл (${disavowFile.links_count || 0} доменов)</summary>
                        <pre style="white-space: pre-wrap; background: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 10px; max-height: 400px; overflow-y: auto;">${disavowFile.content}</pre>
                    </details>
                ` : ''}
            </div>
        `;
    } else {
        // Стандартний вивід для інших типів задач
        contentHtml = `
            <div class="score ${scoreClass}">
                Общий балл: ${result.validation && result.validation.overall_score ? result.validation.overall_score.toFixed(1) : '0'}/100
            </div>
            <p><strong>Статус:</strong> ${result.status === 'completed' ? '✅ Готово' : '⚠️ Требует доработки'}</p>
            <p><strong>Валидность:</strong> ${result.validation && result.validation.is_valid ? '✅ Прошла валидацию' : '❌ Не прошла валидацию'}</p>
            
            <div class="meta-section">
                <h3>🔍 Анализ агента</h3>
                <p><strong>Ключевые слова:</strong> ${result.analysis && result.analysis.keywords ? result.analysis.keywords.join(', ') : 'N/A'}</p>
                <p><strong>Целевая аудитория:</strong> ${result.analysis && result.analysis.target_audience ? result.analysis.target_audience : 'N/A'}</p>
                <p><strong>Тип контента:</strong> ${result.analysis && result.analysis.content_type ? result.analysis.content_type : 'N/A'}</p>
                <p><strong>Регион:</strong> ${result.analysis && result.analysis.region ? result.analysis.region : 'N/A'}</p>
                <p><strong>Язык:</strong> ${result.analysis && result.analysis.language ? result.analysis.language : 'N/A'}</p>
                <p><strong>Количество слов:</strong> ${result.analysis && result.analysis.word_count ? result.analysis.word_count : 'N/A'}</p>
                <p><strong>Уверенность агента:</strong> ${result.analysis && result.analysis.confidence ? (result.analysis.confidence * 100).toFixed(1) + '%' : 'N/A'}</p>
            </div>
            
            <div class="meta-section">
                <h3>🏷️ Мета-теги</h3>
                <p><strong>Title:</strong> ${result.meta_tags && result.meta_tags.title ? result.meta_tags.title : 'N/A'}</p>
                <p><strong>Description:</strong> ${result.meta_tags && result.meta_tags.description ? result.meta_tags.description : 'N/A'}</p>
                <p><strong>H1:</strong> ${result.meta_tags && result.meta_tags.h1 ? result.meta_tags.h1 : 'N/A'}</p>
            </div>
            
            <div class="content-section">
                <h3>📝 Контент</h3>
                <p><strong>Количество слов:</strong> ${result.content && result.content.word_count ? result.content.word_count : 'N/A'}</p>
                <p><strong>Читабельность:</strong> ${result.content && result.content.readability_score ? result.content.readability_score.toFixed(1) : 'N/A'}</p>
                <p><strong>Внутренние ссылки:</strong> ${result.content && result.content.internal_links ? result.content.internal_links.length : 0}</p>
                
                <details>
                    <summary>Показать текст контента</summary>
                    <pre style="white-space: pre-wrap; background: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 10px;">${result.content && result.content.text ? result.content.text : 'Контент не был сгенерирован'}</pre>
                </details>
            </div>
        `;
    }
    
    contentHtml += `
        <div class="qa-section">
            <h3>✅ Валидация тим-лида</h3>
            ${result.validation && result.validation.issues && result.validation.issues.length > 0 ? `
                <div class="issues">
                    <h4>Проблемы:</h4>
                    <ul>
                        ${result.validation.issues.map(issue => `<li>${issue}</li>`).join('')}
                    </ul>
                </div>
            ` : '<p style="color: #28a745;">✅ Проблем не найдено</p>'}
            
            ${result.validation && result.validation.recommendations && result.validation.recommendations.length > 0 ? `
                <div class="recommendations">
                    <h4>Рекомендации:</h4>
                    <ul>
                        ${result.validation.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            
            ${result.validation && result.validation.detailed_scores ? `
                <div style="margin-top: 15px;">
                    <h4>Детальные баллы:</h4>
                    <ul>
                        <li>Анализ: ${result.validation.detailed_scores.analysis_score || 0}%</li>
                        <li>Мета-теги: ${result.validation.detailed_scores.meta_score || 0}%</li>
                        <li>Контент: ${result.validation.detailed_scores.content_score || 0}%</li>
                        <li>Согласованность: ${result.validation.detailed_scores.consistency_score || 0}%</li>
                    </ul>
                </div>
            ` : ''}
        </div>
        
        ${result.agent_results ? `
            <div class="qa-section">
                <h3>🤖 Статус агентов</h3>
                <ul>
                    ${Object.entries(result.agent_results).map(([name, agent]) => `
                        <li>
                            <strong>${name.replace('_', ' ')}:</strong> 
                            ${agent.success ? '✅ Успешно' : '❌ Ошибка'} 
                            (${agent.execution_time.toFixed(2)}s)
                            ${agent.confidence ? ` - Уверенность: ${(agent.confidence * 100).toFixed(1)}%` : ''}
                            ${agent.errors && agent.errors.length > 0 ? `<br><small style="color: #dc3545;">Ошибки: ${agent.errors.join(', ')}</small>` : ''}
                        </li>
                    `).join('')}
                </ul>
            </div>
        ` : ''}
    `;
    
    resultsContent.innerHTML = contentHtml;
    results.style.display = 'block';
    
    // Добавляем обработчики событий для кнопок скачивания после рендеринга HTML
    // Используем делегирование событий для надежности
    if (taskType === 'link_analysis') {
        // Удаляем старые обработчики если они есть
        const oldHandler = resultsContent.onclick;
        if (oldHandler) {
            resultsContent.removeEventListener('click', oldHandler);
        }
        
        // Используем делегирование событий на родительском элементе
        resultsContent.addEventListener('click', function(e) {
            const target = e.target.closest('button');
            if (!target) return;
            
            const btnId = target.id;
            if (btnId === 'downloadToxicBtn') {
                e.preventDefault();
                e.stopPropagation();
                if (window.downloadToxicDomains) {
                    window.downloadToxicDomains();
                }
            } else if (btnId === 'downloadSuspiciousBtn') {
                e.preventDefault();
                e.stopPropagation();
                if (window.downloadSuspiciousDomains) {
                    window.downloadSuspiciousDomains();
                }
            } else if (btnId === 'downloadToxicAndSuspiciousBtn') {
                e.preventDefault();
                e.stopPropagation();
                if (window.downloadToxicAndSuspiciousDomains) {
                    window.downloadToxicAndSuspiciousDomains();
                }
            } else if (btnId === 'downloadLinkDetailsBtn') {
                e.preventDefault();
                e.stopPropagation();
                console.log('Download link details button clicked (delegated)');
                if (window.downloadLinkDetailsTable) {
                    window.downloadLinkDetailsTable();
                } else {
                    console.error('window.downloadLinkDetailsTable is not defined');
                    alert('Функция скачивания не найдена. Перезагрузите страницу.');
                }
            }
        });
        
        // Также привязываем напрямую для совместимости
        setTimeout(() => {
            const toxicBtn = document.getElementById('downloadToxicBtn');
            const suspiciousBtn = document.getElementById('downloadSuspiciousBtn');
            const toxicAndSuspiciousBtn = document.getElementById('downloadToxicAndSuspiciousBtn');
            const linkDetailsBtn = document.getElementById('downloadLinkDetailsBtn');
            
            if (toxicBtn && !toxicBtn.onclick) {
                toxicBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (window.downloadToxicDomains) window.downloadToxicDomains();
                });
            }
            if (suspiciousBtn && !suspiciousBtn.onclick) {
                suspiciousBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (window.downloadSuspiciousDomains) window.downloadSuspiciousDomains();
                });
            }
            if (toxicAndSuspiciousBtn && !toxicAndSuspiciousBtn.onclick) {
                toxicAndSuspiciousBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (window.downloadToxicAndSuspiciousDomains) window.downloadToxicAndSuspiciousDomains();
                });
            }
            if (linkDetailsBtn) {
                // Удаляем старые обработчики если есть
                linkDetailsBtn.replaceWith(linkDetailsBtn.cloneNode(true));
                const newLinkDetailsBtn = document.getElementById('downloadLinkDetailsBtn');
                newLinkDetailsBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Download link details button clicked');
                    if (window.downloadLinkDetailsTable) {
                        window.downloadLinkDetailsTable();
                    } else {
                        console.error('window.downloadLinkDetailsTable is not defined');
                        alert('Функция скачивания не найдена. Перезагрузите страницу.');
                    }
                });
            }
        }, 100);
    }
}

// Test System
async function testSystem() {
    const testData = {
        user_query: "Протестуй систему",
        url: "https://example.com/electronics-guide",
        topic: "Electronics"
    };
    
    await processRequest(testData);
}

// Initialize Link Builder Form Handler
function initializeLinkBuilderForm() {
    const form = document.getElementById('linkBuilderForm');
    if (!form) {
        console.error('Link Builder form not found!');
        return;
    }
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('Link Builder form submitted!');
        
        const formData = new FormData(e.target);
        const csvFile = document.getElementById('linkBuilderCsvFile').files[0];
        const domain = formData.get('linkBuilderDomain') || '';
        const minRisk = formData.get('linkBuilderMinRisk') || '50';
        
        if (!csvFile) {
            alert('Будь ласка, виберіть CSV файл з посиланнями Ahrefs');
            return;
        }
        
        // Формуємо user_query
        const userQuery = `Проаналізуй посилання з CSV файлу Ahrefs та створи disavow файл${domain ? ` для домену ${domain}` : ''}. Мінімальний ризик-скор: ${minRisk}.`;
        
        // Показуємо завантаження
        document.getElementById('loading').style.display = 'block';
        document.getElementById('progress').style.display = 'block';
        document.getElementById('results').style.display = 'none';
        
        try {
            // Генеруємо session_id для WebSocket
            sessionId = generateSessionId();
            await connectWebSocket(sessionId);
            
            // Для link_analysis потрібно передати файл на сервер через FormData
            const formDataToSend = new FormData();
            formDataToSend.append('user_query', userQuery);
            formDataToSend.append('csv_file', csvFile);
            if (domain) formDataToSend.append('domain', domain);
            formDataToSend.append('min_risk_score', minRisk);
            formDataToSend.append('session_id', sessionId);
            
            const response = await fetch('/process', {
                method: 'POST',
                body: formDataToSend
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Помилка обробки запиту');
            }
            
            const result = await response.json();
            
            document.getElementById('loading').style.display = 'none';
            displayResults(result);
            
            if (websocket) {
                websocket.close();
            }
        } catch (error) {
            console.error('Link analysis error:', error);
            document.getElementById('loading').style.display = 'none';
            alert(`Помилка: ${error.message}`);
            if (websocket) {
                websocket.close();
            }
        }
    });
    
    console.log('Link Builder form handler initialized');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing...');
    
    // Tab switching
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            document.getElementById(targetTab + 'Tab').classList.add('active');
        });
    });
    
    // Initialize form handler
    initializeFormHandler();
    
    // Initialize Link Builder form handler
    initializeLinkBuilderForm();
    
    // Initialize mode toggles
    toggleGenerationMode();
    toggleProcessingMode();
    
    // Add event listeners for mode changes
    const generationModeSelect = document.getElementById('generationMode');
    const processingModeSelect = document.getElementById('processingMode');
    
    if (generationModeSelect) {
        generationModeSelect.addEventListener('change', toggleGenerationMode);
    }
    if (processingModeSelect) {
        processingModeSelect.addEventListener('change', toggleProcessingMode);
    }
    
    // Add event listeners for batch input type
    const batchInputRadios = document.querySelectorAll('input[name="batchInputType"]');
    batchInputRadios.forEach(radio => {
        radio.addEventListener('change', toggleBatchInput);
    });
    
    // Add test button handler
    const testButton = document.getElementById('testButton');
    if (testButton) {
        testButton.addEventListener('click', testSystem);
    }
    
    console.log('Initialization complete');
});

