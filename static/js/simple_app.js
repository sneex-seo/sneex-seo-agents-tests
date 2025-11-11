// Простой JavaScript для генератора мета-тегов

document.addEventListener('DOMContentLoaded', function() {
    console.log('Simple Meta Generator loaded');
    
    const metaForm = document.getElementById('metaForm');
    const batchForm = document.getElementById('batchForm');
    const loading = document.getElementById('loading');
    const progress = document.getElementById('progress');
    const results = document.getElementById('results');
    const batchResults = document.getElementById('batchResults');
    const error = document.getElementById('error');
    
    let websocket = null;
    let currentBatchResults = null;
    
    // Переключение режимов
    const modeRadios = document.querySelectorAll('input[name="mode"]');
    modeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const singleMode = document.getElementById('singleMode');
            const batchMode = document.getElementById('batchMode');
            
            if (this.value === 'single') {
                singleMode.style.display = 'block';
                batchMode.style.display = 'none';
            } else {
                singleMode.style.display = 'none';
                batchMode.style.display = 'block';
            }
        });
    });
    
    // Одиночная генерация
    metaForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Скрываем предыдущие результаты
        results.style.display = 'none';
        batchResults.style.display = 'none';
        error.style.display = 'none';
        
        // Показываем загрузку
        loading.style.display = 'block';
        
        try {
            // Собираем данные формы
            const formData = new FormData(metaForm);
            const requestData = {
                url: formData.get('url'),
                h1_keyword: formData.get('h1Keyword'),
                brand_name: formData.get('brandName') || null,
                business_type: formData.get('businessType') || null
            };
            
            console.log('Sending single request:', requestData);
            
            // Отправляем запрос
            const response = await fetch('/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('Received single result:', result);
            
            if (result.success) {
                displaySingleResults(result);
            } else {
                displayError(result.error || 'Неизвестная ошибка');
            }
            
        } catch (err) {
            console.error('Error:', err);
            displayError(err.message);
        } finally {
            loading.style.display = 'none';
        }
    });
    
    // Пакетная генерация
    batchForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Скрываем предыдущие результаты
        results.style.display = 'none';
        batchResults.style.display = 'none';
        error.style.display = 'none';
        loading.style.display = 'none';
        
        // Показываем прогресс
        progress.style.display = 'block';
        
        try {
            // Собираем данные формы
            const formData = new FormData(batchForm);
            const urls = formData.get('urls').split('\n').filter(url => url.trim());
            const h1Keywords = formData.get('h1Keywords').split('\n').filter(keyword => keyword.trim());
            
            if (urls.length !== h1Keywords.length) {
                throw new Error('Количество URL должно совпадать с количеством H1 ключевых слов');
            }
            
            const requests = urls.map((url, index) => ({
                url: url.trim(),
                h1_keyword: h1Keywords[index].trim(),
                brand_name: formData.get('batchBrandName') || null,
                business_type: formData.get('batchBusinessType') || null
            }));
            
            // Генерируем session_id
            const sessionId = generateSessionId();
            
            // Подключаемся к WebSocket
            await connectWebSocket(sessionId);
            
            const requestData = { 
                requests,
                session_id: sessionId
            };
            
            console.log('Sending batch request:', requestData);
            
            // Отправляем запрос
            const response = await fetch('/generate-batch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('Received batch result:', result);
            
            currentBatchResults = result;
            displayBatchResults(result);
            
        } catch (err) {
            console.error('Error:', err);
            displayError(err.message);
        } finally {
            progress.style.display = 'none';
            if (websocket) {
                websocket.close();
                websocket = null;
            }
        }
    });
});

function displaySingleResults(result) {
    const resultsContent = document.getElementById('resultsContent');
    const results = document.getElementById('results');
    
    const metaTags = result.meta_tags;
    const analysis = result.analysis;
    const validation = result.validation;
    const improved = result.improved || false;
    
    // Определяем цвет балла
    const score = validation?.overall_score || 0;
    const scoreClass = score >= 80 ? 'good' : score >= 60 ? 'warning' : 'bad';
    
    let html = `
        <div class="meta-item">
            <h3>🔍 Анализ страницы</h3>
            <p><strong>URL:</strong> ${result.url}</p>
            <p><strong>H1 ключевое слово:</strong> ${result.h1_keyword}</p>
            <p><strong>Тип контента:</strong> ${analysis?.content_type || 'Не определен'}</p>
            <p><strong>Целевая аудитория:</strong> ${analysis?.target_audience || 'Не определена'}</p>
            <p><strong>Ключевые слова:</strong> ${analysis?.keywords?.join(', ') || 'Не определены'}</p>
            <p><strong>Сложность:</strong> ${analysis?.complexity || 'Не определена'}</p>
        </div>
        
        ${validation ? `
        <div class="meta-item">
            <h3>✅ Валидация качества ${improved ? '🔄 (Улучшено)' : ''}</h3>
            <div class="score ${scoreClass}">
                Общий балл: ${score.toFixed(1)}/100
            </div>
            <p><strong>Статус:</strong> ${validation.is_valid ? '✅ Прошла валидацию' : '❌ Требует доработки'}</p>
            
            ${validation.issues && validation.issues.length > 0 ? `
                <div style="margin-top: 15px;">
                    <h4>Проблемы:</h4>
                    <ul>
                        ${validation.issues.map(issue => `<li style="color: #dc3545;">${issue}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            
            ${validation.recommendations && validation.recommendations.length > 0 ? `
                <div style="margin-top: 15px;">
                    <h4>Рекомендации:</h4>
                    <ul>
                        ${validation.recommendations.map(rec => `<li style="color: #007bff;">${rec}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            
            ${validation.detailed_scores ? `
                <div style="margin-top: 15px;">
                    <h4>Детальные баллы:</h4>
                    <ul>
                        <li>Title: ${validation.detailed_scores.title_score || 0}%</li>
                        <li>Description: ${validation.detailed_scores.description_score || 0}%</li>
                        <li>H1: ${validation.detailed_scores.h1_score || 0}%</li>
                        <li>Релевантность: ${validation.detailed_scores.relevance_score || 0}%</li>
                    </ul>
                </div>
            ` : ''}
        </div>
        ` : ''}
        
        <div class="meta-item">
            <h3>📄 Title</h3>
            <p>${metaTags.title}</p>
            <button class="copy-btn" onclick="copyToClipboard('${metaTags.title.replace(/'/g, "\\'")}')">Копировать</button>
        </div>
        
        <div class="meta-item">
            <h3>📝 Description</h3>
            <p>${metaTags.description}</p>
            <button class="copy-btn" onclick="copyToClipboard('${metaTags.description.replace(/'/g, "\\'")}')">Копировать</button>
        </div>
        
        <div class="meta-item">
            <h3>🏷️ H1 заголовок</h3>
            <p>${metaTags.h1}</p>
            <button class="copy-btn" onclick="copyToClipboard('${metaTags.h1.replace(/'/g, "\\'")}')">Копировать</button>
        </div>
    `;
    
    if (metaTags.faq && metaTags.faq.length > 0) {
        html += '<div class="meta-item"><h3>❓ FAQ вопросы</h3>';
        metaTags.faq.forEach((item, index) => {
            html += `
                <div class="faq-item">
                    <div class="faq-question">${index + 1}. ${item.question}</div>
                    <div class="faq-answer">${item.answer}</div>
                </div>
            `;
        });
        html += '</div>';
    }
    
    resultsContent.innerHTML = html;
    results.style.display = 'block';
}

function displayBatchResults(result) {
    const batchResultsContent = document.getElementById('batchResultsContent');
    const batchResults = document.getElementById('batchResults');
    
    const successCount = result.success_count;
    const errorCount = result.error_count;
    const total = result.total;
    
    let html = `
        <div class="meta-item">
            <h3>📊 Статистика</h3>
            <p><strong>Всего страниц:</strong> ${total}</p>
            <p style="color: #28a745;"><strong>✅ Успешно:</strong> ${successCount}</p>
            <p style="color: #dc3545;"><strong>❌ С ошибками:</strong> ${errorCount}</p>
            <p><strong>Процент успеха:</strong> ${((successCount / total) * 100).toFixed(1)}%</p>
        </div>
        
        <div style="margin-top: 30px;">
            <h3>Детали по каждой странице:</h3>
    `;
    
    result.results.forEach((item, index) => {
        if (item.success) {
            const metaTags = item.meta_tags;
            const analysis = item.analysis;
            const validation = item.validation;
            const improved = item.improved || false;
            
            // Определяем цвет балла
            const score = validation?.overall_score || 0;
            const scoreClass = score >= 80 ? 'good' : score >= 60 ? 'warning' : 'bad';
            
            html += `
                <div class="meta-item" style="margin: 15px 0;">
                    <h4 style="color: #28a745;">✅ ${index + 1}. ${item.url}</h4>
                    <p><strong>H1 ключевое слово:</strong> ${item.h1_keyword}</p>
                    <p><strong>Тип контента:</strong> ${analysis?.content_type || 'Не определен'}</p>
                    <div class="score ${scoreClass}" style="display: inline-block; margin: 5px 0;">
                        Балл: ${score.toFixed(1)}/100 ${improved ? '🔄' : ''}
                    </div>
                    <p><strong>Title:</strong> ${metaTags.title}</p>
                    <p><strong>Description:</strong> ${metaTags.description}</p>
                    <p><strong>H1:</strong> ${metaTags.h1}</p>
                    <details>
                        <summary style="cursor: pointer; color: #007bff;">Показать полные результаты</summary>
                        <div style="margin-top: 10px;">
                            <p><strong>Целевая аудитория:</strong> ${analysis?.target_audience || 'Не определена'}</p>
                            <p><strong>Ключевые слова:</strong> ${analysis?.keywords?.join(', ') || 'Не определены'}</p>
                            <p><strong>Сложность:</strong> ${analysis?.complexity || 'Не определена'}</p>
                            
                            ${validation ? `
                                <div style="margin-top: 15px;">
                                    <h5>Валидация:</h5>
                                    <p><strong>Статус:</strong> ${validation.is_valid ? '✅ Прошла валидацию' : '❌ Требует доработки'}</p>
                                    ${validation.issues && validation.issues.length > 0 ? `
                                        <p><strong>Проблемы:</strong> ${validation.issues.join(', ')}</p>
                                    ` : ''}
                                    ${validation.detailed_scores ? `
                                        <p><strong>Детальные баллы:</strong> Title: ${validation.detailed_scores.title_score || 0}%, Description: ${validation.detailed_scores.description_score || 0}%, H1: ${validation.detailed_scores.h1_score || 0}%</p>
                                    ` : ''}
                                </div>
                            ` : ''}
                            
                            ${metaTags.faq && metaTags.faq.length > 0 ? `
                                <div style="margin-top: 15px;">
                                    <h5>FAQ вопросы:</h5>
                                    ${metaTags.faq.map((faq, i) => `
                                        <div style="margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 5px;">
                                            <strong>${i + 1}. ${faq.question}</strong><br>
                                            <span style="color: #666;">${faq.answer}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                    </details>
                </div>
            `;
        } else {
            html += `
                <div class="meta-item" style="margin: 15px 0; border-left-color: #dc3545;">
                    <h4 style="color: #dc3545;">❌ ${index + 1}. ${item.url}</h4>
                    <p><strong>H1 ключевое слово:</strong> ${item.h1_keyword}</p>
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
        </div>
    `;
    
    batchResultsContent.innerHTML = html;
    batchResults.style.display = 'block';
}

function displayError(errorMessage) {
    const errorContent = document.getElementById('errorContent');
    const error = document.getElementById('error');
    
    errorContent.innerHTML = `
        <p><strong>Ошибка:</strong> ${errorMessage}</p>
        <p>Проверьте:</p>
        <ul>
            <li>Правильность URL</li>
            <li>Наличие API ключа OpenAI</li>
            <li>Подключение к интернету</li>
        </ul>
    `;
    
    error.style.display = 'block';
}

function generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9);
}

async function connectWebSocket(sessionId) {
    return new Promise((resolve, reject) => {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws/${sessionId}`;
        
        websocket = new WebSocket(wsUrl);
        
        websocket.onopen = function() {
            console.log('WebSocket connected');
            resolve();
        };
        
        websocket.onmessage = function(event) {
            const data = JSON.parse(event.data);
            handleProgressUpdate(data);
        };
        
        websocket.onclose = function() {
            console.log('WebSocket disconnected');
        };
        
        websocket.onerror = function(error) {
            console.error('WebSocket error:', error);
            reject(error);
        };
    });
}

function handleProgressUpdate(data) {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const progressMessage = document.getElementById('progressMessage');
    const progressLog = document.getElementById('progressLog');
    
    if (data.type === 'progress') {
        const percentage = (data.current / data.total) * 100;
        progressFill.style.width = percentage + '%';
        progressText.textContent = `${data.current}/${data.total} (${percentage.toFixed(1)}%)`;
        progressMessage.textContent = data.message;
        
        // Добавляем запись в лог
        const logItem = document.createElement('div');
        logItem.className = 'progress-log-item';
        
        if (data.success === false) {
            logItem.className += ' error';
            logItem.textContent = `❌ ${data.message}`;
        } else if (data.success === true) {
            logItem.className += ' success';
            logItem.textContent = `✅ ${data.message} (балл: ${data.score?.toFixed(1) || 'N/A'})`;
        } else {
            logItem.className += ' info';
            logItem.textContent = `🔄 ${data.message}`;
        }
        
        progressLog.appendChild(logItem);
        progressLog.scrollTop = progressLog.scrollHeight;
        
    } else if (data.type === 'complete') {
        progressFill.style.width = '100%';
        progressText.textContent = `Завершено: ${data.success_count} успешно, ${data.error_count} с ошибками`;
        progressMessage.textContent = data.message;
        
        const logItem = document.createElement('div');
        logItem.className = 'progress-log-item success';
        logItem.textContent = `🎉 ${data.message}`;
        progressLog.appendChild(logItem);
        progressLog.scrollTop = progressLog.scrollHeight;
    }
}

function exportResults() {
    if (!currentBatchResults) {
        alert('Нет результатов для экспорта');
        return;
    }
    
    let csvContent = 'URL,H1_Keyword,Status,Score,Title,Description,H1,FAQ_Questions\n';
    
    currentBatchResults.results.forEach(item => {
        if (item.success) {
            const r = item;
            const faqQuestions = r.meta_tags?.faq?.map(faq => faq.question).join('; ') || '';
            csvContent += `"${r.url}","${r.h1_keyword}","Успешно","${r.validation?.overall_score?.toFixed(1) || 'N/A'}","${r.meta_tags?.title || ''}","${r.meta_tags?.description || ''}","${r.meta_tags?.h1 || ''}","${faqQuestions}"\n`;
        } else {
            csvContent += `"${item.url}","${item.h1_keyword}","Ошибка","0","","","","${item.error || ''}"\n`;
        }
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `seo_meta_tags_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
        // Показываем уведомление
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = 'Скопировано!';
        btn.style.background = '#28a745';
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '#28a745';
        }, 2000);
    }).catch(function(err) {
        console.error('Ошибка копирования: ', err);
        alert('Ошибка копирования');
    });
}
