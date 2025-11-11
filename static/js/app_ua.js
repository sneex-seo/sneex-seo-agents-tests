// SEO Agent System - Українська версія JavaScript

let websocket = null;
let sessionId = null;
let linkBuilderWebSocket = null;
let linkBuilderSessionId = null;

// Initialize tabs functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('SEO Agent System - Українська версія завантажена');
    
    // Main tabs functionality
    const mainTabs = document.querySelectorAll('.main-tab');
    const mainTabContents = document.querySelectorAll('.main-tab-content');
    
    mainTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            mainTabs.forEach(t => t.classList.remove('active'));
            mainTabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            document.getElementById(targetTab + 'Tab').classList.add('active');
        });
    });
    
    // Agent tabs functionality
    const agentTabs = document.querySelectorAll('.agent-tab');
    const agentContents = document.querySelectorAll('.agent-content');
    
    agentTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetAgent = this.getAttribute('data-agent');
            
            // Remove active class from all agent tabs and contents
            agentTabs.forEach(t => t.classList.remove('active'));
            agentContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            document.getElementById(targetAgent).classList.add('active');
        });
    });
    
    // Initialize form handlers
    initializeFormHandlers();
    
    // Initialize other functionality
    initializeOtherFeatures();
});

// Initialize form handlers
function initializeFormHandlers() {
    const seoForm = document.getElementById('seoForm');
    const linkBuilderForm = document.getElementById('linkBuilderForm');
    
    if (seoForm) {
        seoForm.addEventListener('submit', handleSEOFormSubmit);
        
        // Add event listeners for mode changes
        const generationMode = document.getElementById('generationMode');
        const processingMode = document.getElementById('processingMode');
        
        if (generationMode) {
            generationMode.addEventListener('change', toggleGenerationMode);
        }
        
        if (processingMode) {
            processingMode.addEventListener('change', toggleProcessingMode);
        }
        
        // Batch input type change
        const batchInputTypes = document.querySelectorAll('input[name="batchInputType"]');
        batchInputTypes.forEach(radio => {
            radio.addEventListener('change', toggleBatchInput);
        });
    }
    
    if (linkBuilderForm) {
        linkBuilderForm.addEventListener('submit', handleLinkBuilderFormSubmit);
    }
}

// Toggle Generation Mode
function toggleGenerationMode() {
    const mode = document.getElementById('generationMode').value;
    const processingMode = document.getElementById('processingMode').value;
    const autoFields = document.getElementById('autoModeFields');
    const chatgptSingleFields = document.getElementById('chatgptSingleFields');
    const batchBusinessFields = document.getElementById('batchBusinessFields');
    const batchModeFields = document.getElementById('batchModeFields');
    
    // Ховаємо всі поля
    if (autoFields) autoFields.style.display = 'none';
    if (chatgptSingleFields) chatgptSingleFields.style.display = 'none';
    if (batchModeFields) batchModeFields.style.display = 'none';
    
    // Показуємо/ховаємо поля для single режиму
    if (processingMode === 'single') {
        if (mode === 'auto') {
            if (autoFields) autoFields.style.display = 'block';
            if (chatgptSingleFields) chatgptSingleFields.style.display = 'none';
        } else if (mode === 'meta_only') {
            if (autoFields) autoFields.style.display = 'none';
            if (chatgptSingleFields) chatgptSingleFields.style.display = 'block';
        } else {
            if (autoFields) autoFields.style.display = 'none';
            if (chatgptSingleFields) chatgptSingleFields.style.display = 'block';
        }
    } else if (processingMode === 'batch') {
        // Для batch режиму показуємо business fields для ChatGPT та meta_only режимів
        if (mode === 'chatgpt' || mode === 'meta_only') {
            if (batchBusinessFields) batchBusinessFields.style.display = 'block';
        } else {
            if (batchBusinessFields) batchBusinessFields.style.display = 'none';
        }
        
        if (batchModeFields) batchModeFields.style.display = 'block';
    }
}

// Toggle Processing Mode
function toggleProcessingMode() {
    const mode = document.getElementById('processingMode').value;
    const singleFields = document.getElementById('singlePageFields');
    const batchFields = document.getElementById('batchModeFields');
    
    if (mode === 'single') {
        singleFields.style.display = 'block';
        batchFields.style.display = 'none';
        toggleGenerationMode();
    } else {
        singleFields.style.display = 'none';
        batchFields.style.display = 'block';
        document.getElementById('autoModeFields').style.display = 'none';
        document.getElementById('chatgptSingleFields').style.display = 'none';
        toggleBatchInput();
    }
}

// Toggle Batch Input Type
function toggleBatchInput() {
    const inputType = document.querySelector('input[name="batchInputType"]:checked').value;
    const simpleField = document.getElementById('simpleInputField');
    const keywordsField = document.getElementById('keywordsInputField');
    const csvField = document.getElementById('csvUploadField');
    const manualField = document.getElementById('manualInputField');
    
    // Ховаємо всі поля
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

// Handle SEO Form Submit
async function handleSEOFormSubmit(e) {
    e.preventDefault();
    
    const loading = document.getElementById('loading');
    const progress = document.getElementById('progress');
    const results = document.getElementById('results');
    
    // Показуємо завантаження
    if (loading) loading.style.display = 'block';
    if (progress) progress.style.display = 'none';
    if (results) results.style.display = 'none';
    
    try {
        const formData = new FormData(e.target);
        const generationMode = formData.get('generationMode');
        const processingMode = formData.get('processingMode');
        
        // Тут буде логіка відправки запиту до сервера
        // Поки що просто показуємо повідомлення
        alert('Функціонал відправки запитів буде реалізовано пізніше');
        
    } catch (error) {
        console.error('Помилка:', error);
        alert('Сталася помилка: ' + error.message);
    } finally {
        if (loading) loading.style.display = 'none';
    }
}

// Handle Link Builder Form Submit
async function handleLinkBuilderFormSubmit(e) {
    e.preventDefault();
    
    const loading = document.getElementById('loading');
    const progress = document.getElementById('progress');
    const results = document.getElementById('results');
    const progressBarFill = document.getElementById('linkProgressBarFill');
    const progressText = document.getElementById('linkProgressText');
    const progressLogs = document.getElementById('linkProgressLogs');
    
    // Показуємо завантаження
    if (loading) loading.style.display = 'block';
    if (progress) progress.style.display = 'none';
    if (results) results.style.display = 'none';
    
    try {
        const formData = new FormData(e.target);
        const csvFile = formData.get('linkBuilderCsvFile');
        const domain = formData.get('linkBuilderDomain') || '';
        const minRiskScore = formData.get('linkBuilderMinRisk') || '50';
        
        if (!csvFile || csvFile.size === 0) {
            alert('Будь ласка, виберіть CSV файл');
            if (loading) loading.style.display = 'none';
            return;
        }
        
        // Генерируем session ID для WebSocket
        linkBuilderSessionId = 'link_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        // Показываем progress сразу
        if (loading) loading.style.display = 'none';
        if (progress) {
            progress.style.display = 'block';
        }
        if (progressBarFill) {
            progressBarFill.style.width = '0%';
        }
        if (progressText) {
            progressText.textContent = 'Підключення до сервера...';
        }
        if (progressLogs) {
            progressLogs.innerHTML = '';
        }
        
        // Подключаемся к WebSocket для прогресса (не блокируем выполнение если не удалось)
        try {
            await connectLinkBuilderWebSocket();
            console.log('WebSocket connected for link builder');
            if (progressText) {
                progressText.textContent = 'Підключено. Початок обробки...';
            }
        } catch (wsError) {
            console.warn('WebSocket connection failed, continuing without progress updates:', wsError);
            // Показываем progress вручную
            if (progressText) {
                progressText.textContent = 'Обробка без оновлення прогресу...';
            }
            if (progressLogs) {
                const logEntry = document.createElement('div');
                logEntry.className = 'progress-log-entry';
                logEntry.style.color = '#ffc107';
                logEntry.textContent = `[${new Date().toLocaleTimeString()}] Попередження: WebSocket не підключено, прогрес може не відображатися`;
                progressLogs.appendChild(logEntry);
            }
        }
        
        // Формируем user_query для анализа ссылок
        let userQuery = 'Проаналізуй посилання з CSV файлу';
        if (domain) {
            userQuery += ` для домену ${domain}`;
        }
        if (minRiskScore) {
            userQuery += ` з мінімальним ризик-скором ${minRiskScore}`;
        }
        
        // Создаем FormData для отправки
        const requestFormData = new FormData();
        requestFormData.append('user_query', userQuery);
        requestFormData.append('csv_file', csvFile);
        if (domain) {
            requestFormData.append('domain', domain);
        }
        if (minRiskScore) {
            requestFormData.append('min_risk_score', minRiskScore);
        }
        requestFormData.append('session_id', linkBuilderSessionId);
        
        // Отправляем запрос на сервер
        const response = await fetch('/process', {
            method: 'POST',
            body: requestFormData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Скрываем loading и progress
        if (loading) loading.style.display = 'none';
        if (progress) progress.style.display = 'none';
        
        // Отображаем результаты
        displayLinkBuilderResults(result, results);
        
    } catch (error) {
        console.error('Помилка:', error);
        if (loading) loading.style.display = 'none';
        if (progress) progress.style.display = 'none';
        if (results) {
            results.innerHTML = `
                <div class="error-message">
                    <h3>❌ Помилка виконання</h3>
                    <p>${error.message}</p>
                </div>
            `;
            results.style.display = 'block';
        } else {
            alert('Сталася помилка: ' + error.message);
        }
    } finally {
        // Закрываем WebSocket если был открыт
        if (linkBuilderWebSocket) {
            linkBuilderWebSocket.close();
            linkBuilderWebSocket = null;
        }
    }
}

async function connectLinkBuilderWebSocket() {
    return new Promise((resolve, reject) => {
        try {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${protocol}//${window.location.host}/ws/${linkBuilderSessionId}`;
            
            console.log('Connecting to WebSocket:', wsUrl);
            
            linkBuilderWebSocket = new WebSocket(wsUrl);
            
            // Таймаут для подключения (5 секунд)
            const timeout = setTimeout(() => {
                if (linkBuilderWebSocket && linkBuilderWebSocket.readyState !== WebSocket.OPEN) {
                    console.warn('WebSocket connection timeout');
                    linkBuilderWebSocket.close();
                    reject(new Error('WebSocket connection timeout'));
                }
            }, 5000);
            
            linkBuilderWebSocket.onopen = () => {
                console.log('LinkBuilder WebSocket connected successfully');
                clearTimeout(timeout);
                resolve();
            };
            
            linkBuilderWebSocket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('WebSocket message received:', data);
                    handleLinkBuilderProgress(data);
                } catch (e) {
                    console.error('Error parsing WebSocket message:', e, 'Raw data:', event.data);
                }
            };
            
            linkBuilderWebSocket.onerror = (error) => {
                console.error('LinkBuilder WebSocket error:', error);
                clearTimeout(timeout);
                // Не reject сразу, даем шанс onclose обработать
            };
            
            linkBuilderWebSocket.onclose = (event) => {
                console.log('LinkBuilder WebSocket closed', event.code, event.reason);
                clearTimeout(timeout);
                linkBuilderWebSocket = null;
                // Если закрылось до открытия - это ошибка
                if (event.code !== 1000 && event.code !== 1001) {
                    reject(new Error(`WebSocket closed unexpectedly: ${event.code} ${event.reason || ''}`));
                }
            };
            
        } catch (error) {
            console.error('Error connecting LinkBuilder WebSocket:', error);
            reject(error);
        }
    });
}

function handleLinkBuilderProgress(data) {
    console.log('LinkBuilder Progress received:', data);
    
    const progress = document.getElementById('progress');
    const progressBarFill = document.getElementById('linkProgressBarFill');
    const progressText = document.getElementById('linkProgressText');
    const progressLogs = document.getElementById('linkProgressLogs');
    
    console.log('Elements found:', {
        progress: !!progress,
        progressBarFill: !!progressBarFill,
        progressText: !!progressText,
        progressLogs: !!progressLogs
    });
    
    if (!progress) {
        console.warn('Progress element not found');
        return;
    }
    
    if (!progressLogs) {
        console.error('progressLogs element not found!');
    }
    
    // Показываем progress если он скрыт
    if (progress.style.display === 'none') {
        progress.style.display = 'block';
    }
    
    // Нормализуем ключи (обрабатываем разные варианты регистра)
    const messageType = (data.type || data.Type || '').toLowerCase();
    const logMessage = data.message || data.Message || data.text || data.Text || '';
    const logLevel = (data.log_level || data.Log_Level || data.logLevel || 'info').toLowerCase();
    const percent = data.percent || data.Percent || undefined;
    
    console.log('Parsed:', { messageType, logMessage, logLevel, percent });
    
    // Обработка прогресса (процент выполнения)
    if (messageType === 'progress' || percent !== undefined) {
        const progressPercent = percent || 0;
        const progressMessage = logMessage || 'Обробка...';
        
        if (progressBarFill) {
            progressBarFill.style.width = progressPercent + '%';
            console.log('Updated progress bar to', progressPercent + '%');
        }
        if (progressText) {
            progressText.textContent = progressMessage;
            console.log('Updated progress text:', progressMessage);
        }
    }
    
    // Обработка логов (log_update, log, и другие типы с сообщениями)
    // Проверяем разные варианты написания типа сообщения
    const isLogMessage = messageType === 'log_update' || 
                        messageType === 'log' ||
                        logMessage.length > 0;
    
    if (isLogMessage && progressLogs) {
        const displayMessage = logMessage || JSON.stringify(data);
        
        console.log('Adding log entry:', {
            isLogMessage,
            progressLogs: !!progressLogs,
            displayMessage,
            logMessage,
            messageType
        });
        
        const logEntry = document.createElement('div');
        logEntry.className = 'progress-log-entry';
        
        // Добавляем цвет в зависимости от уровня лога
        if (logLevel === 'success') {
            logEntry.style.color = '#28a745';
            logEntry.style.fontWeight = 'bold';
        } else if (logLevel === 'error' || logLevel === 'warning') {
            logEntry.style.color = '#dc3545';
        } else {
            logEntry.style.color = '#495057';
        }
        
        logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${displayMessage}`;
        
        try {
            progressLogs.appendChild(logEntry);
            progressLogs.scrollTop = progressLogs.scrollHeight;
            console.log('Log entry added successfully');
        } catch (e) {
            console.error('Error adding log entry:', e);
        }
        
        // Также обновляем текст прогресса если есть сообщение
        if (progressText && logMessage) {
            progressText.textContent = logMessage;
            console.log('Updated progress text to:', logMessage);
        }
    } else {
        console.log('Skipping log entry:', {
            isLogMessage,
            hasProgressLogs: !!progressLogs,
            logMessage,
            messageType
        });
    }
    
    // Обработка других типов сообщений
    if (messageType === 'agent_start' || messageType === 'agent_complete') {
        const agentName = data.agent_name || data.Agent_Name || 'Агент';
        const status = messageType === 'agent_start' ? 'запущено' : 'завершено';
        const message = `${agentName} ${status}`;
        
        if (progressText) {
            progressText.textContent = message;
        }
        if (progressLogs) {
            const logEntry = document.createElement('div');
            logEntry.className = 'progress-log-entry';
            logEntry.style.fontWeight = 'bold';
            logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
            progressLogs.appendChild(logEntry);
            progressLogs.scrollTop = progressLogs.scrollHeight;
        }
    }
}

function displayLinkBuilderResults(result, resultsElement) {
    if (!resultsElement) {
        console.error('Results element not found');
        return;
    }
    
    let html = '<div class="results-container">';
    
    // Проверяем успешность выполнения
    const isSuccess = result.status === 'success' || result.status === 'completed' || result.link_analysis;
    
    if (isSuccess && result.link_analysis) {
        html += '<h2>✅ Результати аналізу посилань</h2>';
        
        const analysis = result.link_analysis;
        
        // Статистика
        if (analysis.analyzed_links) {
            html += '<div class="result-section">';
            html += '<h3>📊 Статистика</h3>';
            html += '<ul>';
            html += `<li><strong>Всього посилань:</strong> ${analysis.analyzed_links.total_links || 0}</li>`;
            html += `<li><strong>Токсичних:</strong> <span style="color: red;">${analysis.analyzed_links.toxic_links || 0}</span></li>`;
            html += `<li><strong>Підозрілих:</strong> <span style="color: orange;">${analysis.analyzed_links.suspicious_links || 0}</span></li>`;
            html += `<li><strong>Гарних:</strong> <span style="color: green;">${analysis.analyzed_links.good_links || 0}</span></li>`;
            html += '</ul>';
            html += '</div>';
        }
        
        // Таблица с детальной информацией по доменам
        if (analysis.analyzed_links && analysis.analyzed_links.link_details && analysis.analyzed_links.link_details.length > 0) {
            // Сохраняем данные для экспорта
            window.currentLinkDetails = analysis.analyzed_links.link_details;
            
            html += '<div class="result-section">';
            html += '<h3>📋 Детальна інформація по доменах</h3>';
            html += '<div style="margin-bottom: 15px;">';
            html += '<button onclick="downloadLinkDetailsCSV()" class="download-btn" style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">';
            html += '📥 Скачати таблицю деталей (CSV)';
            html += '</button>';
            html += '</div>';
            html += '<div style="overflow-x: auto;">';
            html += '<table class="link-analysis-table">';
            html += '<thead>';
            html += '<tr>';
            html += '<th>Домен</th>';
            html += '<th>URL</th>';
            html += '<th>Заголовок</th>';
            html += '<th>Анкор</th>';
            html += '<th>Domain Rating</th>';
            html += '<th>Domain Traffic</th>';
            html += '<th>Page Traffic</th>';
            html += '<th>Keywords</th>';
            html += '<th>Linked Domains</th>';
            html += '<th>Ризик-скор</th>';
            html += '<th>Причина</th>';
            html += '<th>Рекомендація</th>';
            html += '</tr>';
            html += '</thead>';
            html += '<tbody>';
            
            // Сортируем по risk_score (от большего к меньшему)
            const sortedDetails = [...analysis.analyzed_links.link_details].sort((a, b) => {
                const scoreA = parseFloat(a.risk_score || 0);
                const scoreB = parseFloat(b.risk_score || 0);
                return scoreB - scoreA;
            });
            
            sortedDetails.forEach(link => {
                const domain = link.domain || link.url || 'N/A';
                const url = link.url || `https://${domain}`;
                const title = link.title || 'N/A';
                const anchor = link.anchor || 'N/A';
                const dr = link.dr !== undefined && link.dr !== null ? parseFloat(link.dr).toFixed(1) : 'N/A';
                const domainTraffic = link.domain_traffic !== undefined && link.domain_traffic !== null ? link.domain_traffic.toLocaleString() : 'N/A';
                const pageTraffic = link.page_traffic !== undefined && link.page_traffic !== null ? link.page_traffic.toLocaleString() : 'N/A';
                const keywords = link.keywords !== undefined && link.keywords !== null ? link.keywords.toLocaleString() : 'N/A';
                const referringDomains = link.referring_domains !== undefined && link.referring_domains !== null ? link.referring_domains.toLocaleString() : 'N/A';
                const riskScore = link.risk_score !== undefined ? parseFloat(link.risk_score).toFixed(1) : 'N/A';
                const reason = link.reason || 'N/A';
                const recommendation = link.recommendation || 'N/A';
                
                // Определяем цвет строки в зависимости от рекомендации
                let rowClass = '';
                let riskColor = '#495057';
                if (recommendation === 'disavow' || parseFloat(riskScore) >= 50) {
                    rowClass = 'toxic-row';
                    riskColor = '#dc3545';
                } else if (recommendation === 'attention' || parseFloat(riskScore) >= 30) {
                    rowClass = 'suspicious-row';
                    riskColor = '#ffc107';
                } else {
                    rowClass = 'good-row';
                    riskColor = '#28a745';
                }
                
                html += `<tr class="${rowClass}">`;
                html += `<td><strong>${escapeHtml(domain)}</strong></td>`;
                html += `<td><a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(url.length > 50 ? url.substring(0, 50) + '...' : url)}</a></td>`;
                html += `<td>${escapeHtml(title.length > 60 ? title.substring(0, 60) + '...' : title)}</td>`;
                html += `<td>${escapeHtml(anchor.length > 40 ? anchor.substring(0, 40) + '...' : anchor)}</td>`;
                html += `<td style="text-align: center;">${dr}</td>`;
                html += `<td style="text-align: center;">${domainTraffic}</td>`;
                html += `<td style="text-align: center;">${pageTraffic}</td>`;
                html += `<td style="text-align: center;">${keywords}</td>`;
                html += `<td style="text-align: center;">${referringDomains}</td>`;
                html += `<td style="color: ${riskColor}; font-weight: bold; text-align: center;">${riskScore}</td>`;
                html += `<td>${escapeHtml(reason.length > 80 ? reason.substring(0, 80) + '...' : reason)}</td>`;
                html += `<td><span class="recommendation-badge recommendation-${recommendation}">${escapeHtml(recommendation)}</span></td>`;
                html += '</tr>';
            });
            
            html += '</tbody>';
            html += '</table>';
            html += '</div>';
            html += '</div>';
        }
        
        // Disavow файл
        if (analysis.disavow_file && analysis.disavow_file.content) {
            html += '<div class="result-section">';
            html += '<h3>📄 Disavow файл</h3>';
            html += '<p>Скопіюйте цей текст у файл disavow.txt та завантажте його в Google Search Console:</p>';
            html += `<pre class="disavow-content">${escapeHtml(analysis.disavow_file.content)}</pre>`;
            html += '<button onclick="copyDisavowFile()" class="copy-button">📋 Копіювати Disavow файл</button>';
            html += '</div>';
        }
        
        // Детальная информация если есть
        if (analysis.details) {
            html += '<div class="result-section">';
            html += '<h3>ℹ️ Деталі аналізу</h3>';
            html += `<p>${escapeHtml(analysis.details)}</p>`;
            html += '</div>';
        }
        
    } else {
        html += '<div class="error-message">';
        html += '<h3>❌ Помилка виконання</h3>';
        if (result.error) {
            html += `<p>${escapeHtml(result.error)}</p>`;
        } else if (result.detail) {
            html += `<p>${escapeHtml(result.detail)}</p>`;
        } else {
            html += '<p>Не вдалося обробити запит. Перевірте формат CSV файлу та спробуйте ще раз.</p>';
        }
        html += '</div>';
    }
    
    html += '</div>';
    
    resultsElement.innerHTML = html;
    resultsElement.style.display = 'block';
    
    // Сохраняем disavow content для копирования
    if (result.link_analysis && result.link_analysis.disavow_file && result.link_analysis.disavow_file.content) {
        window.lastDisavowContent = result.link_analysis.disavow_file.content;
    }
}

function copyDisavowFile() {
    if (window.lastDisavowContent) {
        navigator.clipboard.writeText(window.lastDisavowContent).then(() => {
            alert('Disavow файл скопійовано в буфер обміну!');
        }).catch(err => {
            console.error('Failed to copy:', err);
            alert('Не вдалося скопіювати. Спробуйте виділити текст вручну.');
        });
    }
}

// Делаем функцию копирования глобальной
window.copyDisavowFile = copyDisavowFile;

// Initialize other features
function initializeOtherFeatures() {
    // Test button handler
    const testButton = document.getElementById('testButton');
    if (testButton) {
        testButton.addEventListener('click', function() {
            alert('Тестовий режим активовано');
        });
    }
    
    // Initialize generation mode on load
    toggleGenerationMode();
    toggleProcessingMode();
    
    // Chat input Enter key handler
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
}

// Copy to clipboard function
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
        // Показуємо уведомлення
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = 'Скопійовано!';
        btn.style.background = '#28a745';
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '#28a745';
        }, 2000);
    }).catch(function(err) {
        console.error('Помилка копіювання: ', err);
        alert('Помилка копіювання');
    });
}

// Chat functionality - глобальные переменные
let chatSessionId = null;
let chatWebSocket = null;

function generateSessionId() {
    return 'chat_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

// Основная функция отправки сообщения
async function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');
    const chatMessages = document.getElementById('chatMessages');
    const chatProgress = document.getElementById('chatProgress');
    const showProgressCheckbox = document.getElementById('showProgress');
    
    // Проверяем что все элементы существуют
    if (!chatInput || !sendButton || !chatMessages) {
        console.error('Chat elements not found!');
        return;
    }
    
    const showProgress = showProgressCheckbox ? showProgressCheckbox.checked : true;
    
    const message = chatInput.value.trim();
    
    if (!message) {
        return;
    }
    
    // Disable input and button
    chatInput.disabled = true;
    sendButton.disabled = true;
    
    // Add user message to chat
    addMessageToChat('user', message);
    
    // Clear input
    chatInput.value = '';
    
    // Generate session ID if not exists
    if (!chatSessionId) {
        chatSessionId = generateSessionId();
    }
    
    // Show progress if enabled
    if (showProgress && chatProgress) {
        chatProgress.style.display = 'flex'; // Используем flex для правильной работы в flex-контейнере
        chatProgress.style.flexDirection = 'column';
        updateProgress(0, 'Початок обробки...');
    }
    
    try {
        // Connect WebSocket if not connected
        if (!chatWebSocket || chatWebSocket.readyState !== WebSocket.OPEN) {
            await connectChatWebSocket();
        }
        
        // Send request to server
        const response = await fetch('/process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_query: message,
                session_id: chatSessionId
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        let result = await response.json();
        
        // Hide progress
        if (showProgress && chatProgress) {
            chatProgress.style.display = 'none';
        }
        
        // Проверяем структуру ответа и адаптируем если нужно
        // Сервер возвращает ProcessResultModel с полями: request, analysis, meta_tags, content, validation, link_analysis, status
        // Проверяем успешность по статусу или наличию данных
        if (result && !result.hasOwnProperty('success')) {
            // Если success нет, проверяем status или наличие данных
            const hasData = !!(result.meta_tags || result.content || result.link_analysis || result.semantic_clusters);
            const statusOk = result.status === 'success' || result.status === 'completed';
            result.success = statusOk || hasData;
        }
        
        // Format and display result
        displayChatResult(result);
        
    } catch (error) {
        console.error('Помилка:', error);
        console.error('Error details:', error);
        
        let errorMessage = 'Вибачте, сталася помилка: ' + error.message;
        
        // Пытаемся получить больше информации об ошибке
        if (error.response) {
            try {
                const errorData = await error.response.json();
                if (errorData.detail) {
                    errorMessage += '<br><br>Деталі: ' + (Array.isArray(errorData.detail) ? errorData.detail.map(d => d.msg || d).join(', ') : errorData.detail);
                }
            } catch (e) {
                // Игнорируем ошибку парсинга
            }
        }
        
        addMessageToChat('assistant', errorMessage);
        
        if (showProgress && chatProgress) {
            chatProgress.style.display = 'none';
        }
    } finally {
        // Enable input and button
        chatInput.disabled = false;
        sendButton.disabled = false;
        chatInput.focus();
    }
}

function addMessageToChat(type, content) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    
    const time = new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        <div class="message-content">
            ${content}
            <div class="message-time">${time}</div>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function displayChatResult(result) {
    let resultText = '';
    
    // Логируем результат для отладки
    console.log('Chat result:', result);
    
    // Проверяем успешность - может быть в разных местах
    // Сервер возвращает ProcessResultModel со структурой: {request, analysis, meta_tags, content, validation, status, task_type, ...}
    const hasData = !!(result.meta_tags || result.content || result.link_analysis || result.semantic_clusters || result.analysis);
    const statusOk = result.status === 'success' || result.status === 'completed';
    const isSuccess = (result.success !== false && hasData) || statusOk;
    
    if (isSuccess) {
        resultText = '<strong>✅ Задача виконана успішно!</strong><br><br>';
        
        // Display meta tags if available
        if (result.meta_tags && (result.meta_tags.title || result.meta_tags.description || result.meta_tags.h1)) {
            resultText += '<div class="chat-result">';
            resultText += '<h4>📄 Мета-теги:</h4>';
            resultText += `<p><strong>Title:</strong> ${result.meta_tags.title || 'N/A'}</p>`;
            resultText += `<p><strong>Description:</strong> ${result.meta_tags.description || 'N/A'}</p>`;
            resultText += `<p><strong>H1:</strong> ${result.meta_tags.h1 || 'N/A'}</p>`;
            if (result.meta_tags.faq_snippets && result.meta_tags.faq_snippets.length > 0) {
                resultText += '<p><strong>FAQ:</strong></p><ul>';
                result.meta_tags.faq_snippets.forEach(faq => {
                    resultText += `<li>${faq}</li>`;
                });
                resultText += '</ul>';
            }
            resultText += '</div>';
        }
        
        // Display content if available
        if (result.content && (result.content.text || result.content.content)) {
            resultText += '<div class="chat-result">';
            resultText += '<h4>✍️ Згенерований контент:</h4>';
            const contentText = result.content.text || result.content.content || result.content;
            resultText += `<pre>${escapeHtml(contentText)}</pre>`;
            if (result.content.word_count) {
                resultText += `<p><strong>Кількість слів:</strong> ${result.content.word_count}</p>`;
            }
            if (result.content.readability_score) {
                resultText += `<p><strong>Оцінка читабельності:</strong> ${result.content.readability_score.toFixed(1)}/100</p>`;
            }
            resultText += '</div>';
        }
        
        // Display link analysis if available
        if (result.link_analysis) {
            resultText += '<div class="chat-result">';
            resultText += '<h4>🔗 Аналіз посилань:</h4>';
            const analysis = result.link_analysis;
            if (analysis.analyzed_links) {
                resultText += `<p><strong>Всього посилань:</strong> ${analysis.analyzed_links.total_links || 0}</p>`;
                resultText += `<p><strong>Токсичних:</strong> ${analysis.analyzed_links.toxic_links || 0}</p>`;
                resultText += `<p><strong>Підозрілих:</strong> ${analysis.analyzed_links.suspicious_links || 0}</p>`;
                resultText += `<p><strong>Гарних:</strong> ${analysis.analyzed_links.good_links || 0}</p>`;
            }
            if (analysis.disavow_file && analysis.disavow_file.content) {
                resultText += '<p><strong>Disavow файл:</strong></p>';
                resultText += `<pre>${escapeHtml(analysis.disavow_file.content)}</pre>`;
            }
            resultText += '</div>';
        }
        
        // Display semantic clusters if available
        if (result.semantic_clusters) {
            resultText += '<div class="chat-result">';
            resultText += '<h4>📊 Семантичні кластери:</h4>';
            if (result.semantic_clusters.clusters) {
                result.semantic_clusters.clusters.forEach((cluster, index) => {
                    resultText += `<p><strong>Кластер ${index + 1}:</strong> ${cluster.cluster_name || cluster.main_keyword}</p>`;
                    resultText += `<p>Ключові слова: ${cluster.keywords ? cluster.keywords.join(', ') : 'N/A'}</p>`;
                });
            }
            resultText += '</div>';
        }
        
        // Display validation if available
        if (result.validation) {
            const validation = result.validation;
            resultText += '<div class="chat-result">';
            resultText += '<h4>✅ Валідація:</h4>';
            resultText += `<p><strong>Статус:</strong> ${validation.is_valid ? '✅ Пройдено' : '❌ Потребує доробки'}</p>`;
            resultText += `<p><strong>Загальний бал:</strong> ${validation.overall_score || 0}/100</p>`;
            if (validation.issues && validation.issues.length > 0) {
                resultText += '<p><strong>Проблеми:</strong></p><ul>';
                validation.issues.forEach(issue => {
                    resultText += `<li>${issue}</li>`;
                });
                resultText += '</ul>';
            }
            resultText += '</div>';
        }
        
    } else {
        resultText = '<strong>❌ Помилка виконання задачі</strong><br><br>';
        if (result.error) {
            resultText += `<p>${result.error}</p>`;
        } else if (result.detail) {
            resultText += `<p>${result.detail}</p>`;
        } else {
            resultText += '<p>Не вдалося обробити запит. Перевірте формат запиту та спробуйте ще раз.</p>';
            resultText += '<p><small>Деталі помилки в консолі браузера (F12)</small></p>';
        }
    }
    
    addMessageToChat('assistant', resultText);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function updateProgress(percent, text) {
    const progressBarFill = document.getElementById('progressBarFill');
    const progressText = document.getElementById('progressText');
    const progressLogs = document.getElementById('progressLogs');
    
    if (progressBarFill) {
        progressBarFill.style.width = percent + '%';
    }
    
    if (progressText) {
        progressText.textContent = text || 'Обробка...';
    }
}

function addProgressLog(message, type = 'info') {
    const progressLogs = document.getElementById('progressLogs');
    if (!progressLogs) return;
    
    const logItem = document.createElement('div');
    logItem.className = `progress-log-item ${type}`;
    logItem.textContent = message;
    
    progressLogs.appendChild(logItem);
    progressLogs.scrollTop = progressLogs.scrollHeight;
}

async function connectChatWebSocket() {
    return new Promise((resolve, reject) => {
        if (!chatSessionId) {
            chatSessionId = generateSessionId();
        }
        
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws/${chatSessionId}`;
        
        chatWebSocket = new WebSocket(wsUrl);
        
        chatWebSocket.onopen = function() {
            console.log('Chat WebSocket connected');
            resolve();
        };
        
        chatWebSocket.onmessage = function(event) {
            try {
                const data = JSON.parse(event.data);
                handleChatProgress(data);
            } catch (e) {
                console.error('Error parsing WebSocket message:', e);
            }
        };
        
        chatWebSocket.onclose = function() {
            console.log('Chat WebSocket disconnected');
        };
        
        chatWebSocket.onerror = function(error) {
            console.error('Chat WebSocket error:', error);
            reject(error);
        };
    });
}

function handleChatProgress(data) {
    const showProgress = document.getElementById('showProgress').checked;
    if (!showProgress) return;
    
    if (data.type === 'log_update') {
        const level = data.log_level || 'info';
        const message = data.message || '';
        addProgressLog(message, level);
    } else if (data.type === 'agent_progress') {
        const agentName = data.agent_name || '';
        const status = data.status || '';
        addProgressLog(`${agentName}: ${status}`, 'info');
    } else if (data.type === 'progress') {
        const percent = ((data.current / data.total) * 100) || 0;
        const message = data.message || 'Обробка...';
        updateProgress(percent, message);
    }
}

function clearChat() {
    if (confirm('Ви впевнені, що хочете очистити чат?')) {
        const chatMessages = document.getElementById('chatMessages');
        const chatProgress = document.getElementById('chatProgress');
        
        if (chatMessages) {
            chatMessages.innerHTML = `
                <div class="message system-message">
                    <div class="message-content">
                        <strong>Система:</strong> Чат очищено. Чим можу допомогти?
                    </div>
                </div>
            `;
        }
        
        // Скрываем progress если был показан
        if (chatProgress) {
            chatProgress.style.display = 'none';
        }
        
        // Очищаем progress logs
        const progressLogs = document.getElementById('progressLogs');
        if (progressLogs) {
            progressLogs.innerHTML = '';
        }
        
        // Сбрасываем session
        chatSessionId = null;
        if (chatWebSocket) {
            chatWebSocket.close();
            chatWebSocket = null;
        }
    }
}

// Функция для скачивания таблицы деталей в CSV
function downloadLinkDetailsCSV() {
    if (!window.currentLinkDetails || window.currentLinkDetails.length === 0) {
        alert('Немає даних для завантаження. Переконайтеся, що аналіз завершено.');
        console.error('currentLinkDetails is empty:', window.currentLinkDetails);
        return;
    }
    
    // Формируем CSV заголовки
    const headers = ['Домен', 'Title', 'Anchor', 'Domain Rating', 'Domain Traffic', 'Page Traffic', 'Keywords', 'Linked Domains', 'Ризик-скор', 'Причина', 'Рекомендація'];
    
    // Формируем CSV строки
    let csvContent = headers.join(',') + '\n';
    
    window.currentLinkDetails.forEach(link => {
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
            const drNum = typeof domainRating === 'number' ? domainRating : parseFloat(domainRating);
            if (!isNaN(drNum)) {
                domainRatingStr = drNum.toFixed(1);
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
            `"${link.recommendation === 'attention' ? 'потребує уваги' : (link.recommendation || 'N/A')}"`
        ];
        csvContent += row.join(',') + '\n';
    });
    
    // Создаем и скачиваем файл
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' }); // UTF-8 BOM для правильного отображения кириллицы в Excel
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `link_details_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
}

// Делаем функции глобальными после их определения (для использования в onclick атрибутах HTML)
window.sendMessage = sendMessage;
window.clearChat = clearChat;
window.downloadLinkDetailsCSV = downloadLinkDetailsCSV;

